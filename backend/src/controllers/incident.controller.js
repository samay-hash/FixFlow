const Incident = require('../models/Incident');
const Log = require('../models/Log');
const { getIO } = require('../socket/socket');
const mongoose = require('mongoose');
const User = require('../models/User');
const ServerLog = require('../models/ServerLog');
const notificationService = require('../services/notification.service');
const { askGroqCopilot } = require('../services/ai.service');

// @GET /api/incidents
const getIncidents = async (req, res) => {
  try {
    const { status, severity, limit = 50, page = 1 } = req.query;
    const filter = { companyId: req.user.companyId };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const incidents = await Incident.find(filter)
      .populate('siteId', 'name url')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Incident.countDocuments(filter);
    res.json({ success: true, total, incidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/incidents/:id
const getIncidentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user.companyId })
      .populate('siteId', 'name url status dependsOn')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email')
      .populate('timeline.updatedBy', 'name avatar');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents
const createIncident = async (req, res) => {
  try {
    const { title, description, severity, siteId, assignedTo, category } = req.body;

    // Base payload
    const payload = {
      title,
      description,
      severity,
      siteId,
      assignedTo: assignedTo || [],
      category: category || 'other',
      source: 'manual',
      companyId: req.user.companyId,
      createdBy: req.user._id,
      timeline: [{
        message: `Incident created manually by ${req.user.name}`,
        updatedBy: req.user._id,
        type: 'system',
      }],
    };

    const incident = await Incident.create(payload);
    await incident.populate(['siteId', 'assignedTo', 'createdBy']);

    // Auto-assign when no assignee provided: pick an engineer matching preferences or with lowest load
    if ((!incident.assignedTo || incident.assignedTo.length === 0)) {
      try {
        const engineers = await User.find({ companyId: req.user.companyId, role: { $in: ['engineer', 'admin'] } });
        if (engineers.length > 0) {
          const agg = await Incident.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(req.user.companyId), status: { $ne: 'resolved' } } },
            { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
          ]);
          const counts = {};
          agg.forEach(a => { counts[String(a._id)] = a.count; });

          const preferred = engineers.filter(u => (u.preferences || []).includes(incident.category));
          let selected = [];
          if (preferred.length > 0) {
            preferred.sort((a, b) => (counts[String(a._id)] || 0) - (counts[String(b._id)] || 0));
            selected.push(preferred[0]);
          } else {
            engineers.sort((a, b) => (counts[String(a._id)] || 0) - (counts[String(b._id)] || 0));
            selected.push(engineers[0]);
          }

          if (selected.length > 0) {
            incident.assignedTo = selected.map(u => u._id);
            await incident.save();
            await incident.populate(['siteId', 'assignedTo', 'createdBy']);
            // notify selected users
            await notificationService.sendAssignedIncidentEmail(incident, selected.map(u => ({ name: u.name, email: u.email })));
          }
        }
      } catch (err) {
        console.warn('Auto-assignment failed:', err.message);
      }
    }

    // Real-time broadcast
    const io = getIO();
    io.to(`company_${req.user.companyId}`).emit('incident:created', incident);

    res.status(201).json({ success: true, incident });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/incidents/:id
const updateIncident = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    const { status, severity, assignedTo, title, description } = req.body;
    const changes = [];

    if (status && status !== incident.status) {
      changes.push(`Status changed from '${incident.status}' to '${status}'`);
      if (status === 'in_progress' && !incident.acknowledgedAt) incident.acknowledgedAt = new Date();
      if (status === 'resolved') {
        incident.resolvedAt = new Date();
        incident.mttr = Math.round((Date.now() - incident.createdAt) / 1000);
      }
      incident.status = status;
    }
    if (severity && severity !== incident.severity) {
      changes.push(`Severity changed to '${severity}'`);
      incident.severity = severity;
    }
    const prevAssignedIds = (incident.assignedTo || []).map(a => String(a));
    if (assignedTo) incident.assignedTo = assignedTo;
    if (title) incident.title = title;
    if (description) incident.description = description;

    // Auto-add timeline entry for changes
    if (changes.length > 0) {
      incident.timeline.push({
        message: changes.join('. ') + `. Updated by ${req.user.name}`,
        updatedBy: req.user._id,
        type: 'status_change',
      });
    }
    await incident.save();
    await incident.populate(['siteId', 'assignedTo', 'createdBy']);

    // Notify newly assigned users (only those added in this update)
    try {
      const currentAssignedIds = (incident.assignedTo || []).map(a => String(a._id || a));
      const newAssignedIds = currentAssignedIds.filter(id => !prevAssignedIds.includes(id));
      if (newAssignedIds.length > 0) {
        const newUsers = await User.find({ _id: { $in: newAssignedIds } });
        if (newUsers.length > 0) await notificationService.sendAssignedIncidentEmail(incident, newUsers);
      }
    } catch (err) {
      console.warn('Failed sending assigned emails on update:', err.message);
    }

    const io = getIO();
    io.to(`company_${req.user.companyId}`).emit('incident:updated', incident);

    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/timeline
const addTimelineUpdate = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const { message, type, isPublic } = req.body;
    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    incident.timeline.push({
      message, type: type || 'observation',
      isPublic: isPublic || false,
      updatedBy: req.user._id,
    });
    await incident.save();

    const io = getIO();
    io.to(`company_${req.user.companyId}`).emit('incident:updated', { _id: incident._id, timeline: incident.timeline });

    res.json({ success: true, timeline: incident.timeline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/stress-test — Real Load Tester
const runStressTest = async (req, res) => {
  try {
    const Website = require('../models/Website');
    let site = await Website.findOne({ companyId: req.user.companyId });
    if (!site || !site.url) {
      return res.status(400).json({ success: false, message: 'No registered website found to stress test.' });
    }

    const targetUrl = site.url;

    // We don't await this because we want it to run in the background
    const performLoadTest = async () => {
      const axios = require('axios');
      let successCount = 0;
      let failCount = 0;
      const requests = [];
      
      // Send 500 concurrent requests to the target URL to simulate DDoS / High Load
      for (let i = 0; i < 500; i++) {
        requests.push(
          axios.get(targetUrl, { timeout: 8000 })
            .then(() => successCount++)
            .catch(() => failCount++)
        );
      }

      await Promise.allSettled(requests);

      // Log the result of the stress test into the system logs
      await Log.create({
        message: `[STRESS TEST] Completed on ${targetUrl}. Successful requests: ${successCount}. Failed/Dropped requests: ${failCount}.`,
        level: failCount > 50 ? 'fatal' : (failCount > 0 ? 'error' : 'warning'),
        source: 'load-tester',
        companyId: req.user.companyId,
        siteId: site._id,
      });

      // If the site failed under load, create a real incident automatically
      if (failCount > 50) {
        site.status = 'down';
        await site.save();
        
        const incident = await Incident.create({
          title: `🔥 [DDoS ALERT] Site crashed under massive load (${failCount} dropped requests)`,
          description: `The website ${targetUrl} failed to handle the concurrent connections during the stress test. It is currently unresponsive.`,
          severity: 'critical',
          status: 'open',
          source: 'auto',
          siteId: site._id,
          companyId: req.user.companyId,
          timeline: [{
            message: `System detected massive request failure spike. ${failCount} requests timed out. Possible DDoS or capacity limit reached.`,
            type: 'system',
          }],
        });
        const io = getIO();
        io.to(`company_${req.user.companyId}`).emit('incident:created', incident);
        io.to(`company_${req.user.companyId}`).emit('notification:alert', {
          message: '🔥 CRITICAL: Site crashed during load test!',
          severity: 'critical',
          incidentId: incident._id,
        });
      }
    };

    performLoadTest(); // Start async execution

    res.status(200).json({ success: true, message: `Load test initiated on ${targetUrl}. Blasting 500 concurrent requests.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/incidents/stats — Dashboard analytics
const getStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const [total, open, inProgress, resolved, critical] = await Promise.all([
      Incident.countDocuments({ companyId }),
      Incident.countDocuments({ companyId, status: 'open' }),
      Incident.countDocuments({ companyId, status: 'in_progress' }),
      Incident.countDocuments({ companyId, status: 'resolved' }),
      Incident.countDocuments({ companyId, severity: 'critical', status: { $ne: 'resolved' } }),
    ]);

    const avgMttr = await Incident.aggregate([
      { $match: { companyId, status: 'resolved', mttr: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$mttr' } } },
    ]);

    res.json({
      success: true,
      stats: {
        total, open, inProgress, resolved, critical,
        avgMttrSeconds: avgMttr[0]?.avg || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/chat
const askCopilot = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const { message, history } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    // Fetch recent server logs if there is a site attached
    let logs = [];
    if (incident.siteId) {
      logs = await ServerLog.find({ siteId: incident.siteId })
        .sort({ timestamp: -1 })
        .limit(50);
      logs = logs.reverse(); // Chronological order
    }

    const reply = await askGroqCopilot(incident, logs, message, history || []);

    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/remediate
const executeRemediation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const { script } = req.body;
    if (!script) return res.status(400).json({ success: false, message: 'Script is required' });

    // DANGEROUS: For Hackathon Demo purposes ONLY. Executes AI-generated shell commands locally.
    const { exec } = require('child_process');
    
    exec(script, { timeout: 15000 }, (error, stdout, stderr) => {
      res.json({
        success: true,
        output: stdout || 'Command executed with no stdout.',
        stderr: stderr || (error ? error.message : '')
      });
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/resolve-verify
const resolveAndVerify = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user.companyId }).populate('siteId');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    // If there is a site attached, we must VERIFY it is up.
    if (incident.siteId && incident.siteId.url) {
      const axios = require('axios');
      try {
        // Ping the server to check if it's actually alive
        await axios.get(incident.siteId.url, { timeout: 5000 });
        
        // If it succeeds, update site status
        incident.siteId.status = 'up';
        await incident.siteId.save();
      } catch (error) {
        // The server is still down! Refuse to resolve.
        return res.status(400).json({ 
          success: false, 
          message: `Verification Failed! The server at ${incident.siteId.url} is still unreachable. You cannot resolve this incident yet.` 
        });
      }
    }

    // If verification passed (or no site attached), mark as resolved
    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    incident.mttr = Math.round((Date.now() - incident.createdAt) / 1000);
    
    incident.timeline.push({
      message: `System Verification Passed. Incident resolved by ${req.user.name}.`,
      updatedBy: req.user._id,
      type: 'status_change',
    });

    await incident.save();
    await incident.populate(['siteId', 'assignedTo', 'createdBy']);

    const io = getIO();
    io.to(`company_${req.user.companyId}`).emit('incident:updated', incident);

    res.json({ success: true, message: 'Server verified UP. Incident resolved successfully!', incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getIncidents, getIncidentById, createIncident, updateIncident, addTimelineUpdate, runStressTest, getStats, askCopilot, executeRemediation, resolveAndVerify };
