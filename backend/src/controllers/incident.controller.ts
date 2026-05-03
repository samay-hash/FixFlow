import { Request, Response } from 'express';
import Incident from '../models/Incident';
import Log from '../models/Log';
import { getIO } from '../socket/socket';
import mongoose from 'mongoose';
import User from '../models/User';
import ServerLog from '../models/ServerLog';
import * as notificationService from '../services/notification.service';
import { askGroqCopilot, generateSitrep as generateSitrepAI } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth.middleware';
import Website from '../models/Website';
import axios from 'axios';
import { exec } from 'child_process';

// @GET /api/incidents
export const getIncidents = async (req: AuthRequest, res: Response) => {
  try {
    const { status, severity, limit = 50, page = 1 } = req.query;
    const filter: any = { companyId: req.user?.companyId as any };
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
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/incidents/:id
export const getIncidentById = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user?.companyId as any })
      .populate('siteId', 'name url status dependsOn')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email')
      .populate('timeline.updatedBy', 'name avatar');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, incident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents
export const createIncident = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, severity, siteId, assignedTo, category } = req.body;

    const payload = {
      title,
      description,
      severity,
      siteId,
      assignedTo: assignedTo || [],
      category: category || 'other',
      source: 'manual',
      companyId: req.user?.companyId as any,
      createdBy: req.user?._id as any,
      timeline: [{
        message: `Incident created manually by ${req.user?.name}`,
        updatedBy: req.user?._id,
        type: 'system',
      }],
    };

    const incident = await Incident.create(payload as any);
    await incident.populate(['siteId', 'assignedTo', 'createdBy']);

    if (!incident.assignedTo || incident.assignedTo.length === 0) {
      try {
        const engineers = await User.find({ companyId: req.user?.companyId, role: { $in: ['engineer', 'admin'] } });
        if (engineers.length > 0) {
          const agg = await Incident.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(req.user?.companyId as any), status: { $ne: 'resolved' } } },
            { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
          ]);
          const counts: Record<string, number> = {};
          agg.forEach(a => { counts[String(a._id)] = a.count; });

          const preferred = engineers.filter(u => (u.preferences || []).includes(incident.category as any));
          let selected: any[] = [];
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
            await notificationService.sendAssignedIncidentEmail(incident as any, selected.map(u => ({ name: u.name, email: u.email })));
          }
        }
      } catch (err: any) {
        console.warn('Auto-assignment failed:', err.message);
      }
    }

    const io = getIO();
    io.to(`company_${req.user?.companyId}`).emit('incident:created', incident);

    res.status(201).json({ success: true, incident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/incidents/:id
export const updateIncident = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user?.companyId as any });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    const { status, severity, assignedTo, title, description } = req.body;
    const changes: string[] = [];

    if (status && status !== incident.status) {
      changes.push(`Status changed from '${incident.status}' to '${status}'`);
      if (status === 'in_progress' && !incident.acknowledgedAt) incident.acknowledgedAt = new Date();
      if (status === 'resolved') {
        incident.resolvedAt = new Date();
        incident.mttr = Math.round((Date.now() - (incident.createdAt as Date).getTime()) / 1000);
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

    if (changes.length > 0) {
      incident.timeline.push({
        message: changes.join('. ') + `. Updated by ${req.user?.name}`,
        updatedBy: req.user?._id,
        type: 'status_change',
        timestamp: new Date(),
        isPublic: false
      });
    }
    await incident.save();
    await incident.populate(['siteId', 'assignedTo', 'createdBy']);

    try {
      const currentAssignedIds = (incident.assignedTo || []).map(a => String((a as any)._id || a));
      const newAssignedIds = currentAssignedIds.filter(id => !prevAssignedIds.includes(id));
      if (newAssignedIds.length > 0) {
        const newUsers = await User.find({ _id: { $in: newAssignedIds } });
        if (newUsers.length > 0) await notificationService.sendAssignedIncidentEmail(incident as any, newUsers);
      }
    } catch (err: any) {
      console.warn('Failed sending assigned emails on update:', err.message);
    }

    const io = getIO();
    io.to(`company_${req.user?.companyId}`).emit('incident:updated', incident);

    res.json({ success: true, incident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/timeline
export const addTimelineUpdate = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const { message, type, isPublic } = req.body;
    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user?.companyId as any });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    incident.timeline.push({
      message, type: type || 'observation',
      isPublic: isPublic || false,
      updatedBy: req.user?._id,
      timestamp: new Date()
    });
    await incident.save();

    const io = getIO();
    io.to(`company_${req.user?.companyId}`).emit('incident:updated', { _id: incident._id, timeline: incident.timeline });

    res.json({ success: true, timeline: incident.timeline });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/stress-test — Real Load Tester
export const runStressTest = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.body?.siteId;
    
    let site;
    if (siteId) {
      site = await Website.findOne({ _id: siteId, companyId: req.user?.companyId });
    } else {
      site = await Website.findOne({ companyId: req.user?.companyId });
    }
    
    if (!site || !site.url) {
      return res.status(400).json({ success: false, message: 'No registered website found to stress test.' });
    }

    const targetUrl = site.url;

    const performLoadTest = async () => {
      let successCount = 0;
      let failCount = 0;
      const requests = [];
      
      for (let i = 0; i < 500; i++) {
        requests.push(
          axios.get(targetUrl, { timeout: 8000 })
            .then(() => successCount++)
            .catch(() => failCount++)
        );
      }

      await Promise.allSettled(requests);

      await Log.create({
        message: `[STRESS TEST] Completed on ${targetUrl}. Successful requests: ${successCount}. Failed/Dropped requests: ${failCount}.`,
        level: failCount > 50 ? 'fatal' : (failCount > 0 ? 'error' : 'warning'),
        source: 'load-tester',
        companyId: req.user?.companyId as any,
        siteId: site._id as any,
      });

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
          companyId: req.user?.companyId,
          timeline: [{
            message: `System detected massive request failure spike. ${failCount} requests timed out. Possible DDoS or capacity limit reached.`,
            type: 'system',
          }],
        });
        const io = getIO();
        io.to(`company_${req.user?.companyId}`).emit('incident:created', incident);
        io.to(`company_${req.user?.companyId}`).emit('notification:alert', {
          message: '🔥 CRITICAL: Site crashed during load test!',
          severity: 'critical',
          incidentId: incident._id,
        });
      }
    };

    performLoadTest();

    res.status(200).json({ success: true, message: `Load test initiated on ${targetUrl}. Blasting 500 concurrent requests.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/incidents/stats — Dashboard analytics
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const [total, open, inProgress, resolved, critical] = await Promise.all([
      Incident.countDocuments({ companyId: companyId as any }),
      Incident.countDocuments({ companyId: companyId as any, status: 'open' }),
      Incident.countDocuments({ companyId: companyId as any, status: 'in_progress' }),
      Incident.countDocuments({ companyId: companyId as any, status: 'resolved' }),
      Incident.countDocuments({ companyId: companyId as any, severity: 'critical', status: { $ne: 'resolved' } }),
    ]);

    const avgMttr = await Incident.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId as any), status: 'resolved', mttr: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$mttr' } } },
    ]);

    res.json({
      success: true,
      stats: {
        total, open, inProgress, resolved, critical,
        avgMttrSeconds: avgMttr[0]?.avg || 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/chat
export const askCopilot = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const { message, history } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user?.companyId as any });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    let logs: any[] = [];
    if (incident.siteId) {
      logs = await ServerLog.find({ siteId: incident.siteId })
        .sort({ timestamp: -1 })
        .limit(50);
      logs = logs.reverse();
    }

    const reply = await askGroqCopilot(incident as any, logs, message, history || []);

    res.json({ success: true, reply });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/remediate
export const executeRemediation = async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const { script } = req.body;
    if (!script) return res.status(400).json({ success: false, message: 'Script is required' });

    exec(script, { timeout: 15000 }, (error, stdout, stderr) => {
      res.json({
        success: true,
        output: stdout || 'Command executed with no stdout.',
        stderr: stderr || (error ? error.message : '')
      });
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/resolve-verify
export const resolveAndVerify = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user?.companyId as any }).populate('siteId');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    if (incident.siteId && (incident.siteId as any).url) {
      try {
        await axios.get((incident.siteId as any).url, { timeout: 5000 });
        (incident.siteId as any).status = 'up';
        await (incident.siteId as any).save();
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: `Verification Failed! The server at ${(incident.siteId as any).url} is still unreachable. You cannot resolve this incident yet.` 
        });
      }
    }

    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    incident.mttr = Math.round((Date.now() - (incident.createdAt as Date).getTime()) / 1000);
    
    incident.timeline.push({
      message: `System Verification Passed. Incident resolved by ${req.user?.name}.`,
      updatedBy: req.user?._id,
      type: 'status_change',
      timestamp: new Date(),
      isPublic: false
    });

    await incident.save();
    await incident.populate(['siteId', 'assignedTo', 'createdBy']);

    const io = getIO();
    io.to(`company_${req.user?.companyId}`).emit('incident:updated', incident);

    res.json({ success: true, message: 'Server verified UP. Incident resolved successfully!', incident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/incidents/:id/sitrep
export const generateSitrep = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOne({ _id: req.params.id, companyId: req.user?.companyId as any })
      .populate('siteId')
      .populate('assignedTo');
      
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    let logs: any[] = [];
    if (incident.siteId) {
      logs = await ServerLog.find({ siteId: (incident.siteId as any)._id })
        .sort({ timestamp: -1 })
        .limit(50);
      logs = logs.reverse();
    }

    const sitrep = await generateSitrepAI(incident as any, logs);
    
    incident.aiSitrep = sitrep;
    await incident.save();

    res.json({ success: true, sitrep, incident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/incidents/:id
export const deleteIncident = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid incident id' });
    }

    const incident = await Incident.findOneAndDelete({ _id: req.params.id, companyId: req.user?.companyId });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

    res.json({ success: true, message: 'Incident deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/incidents
export const deleteAllIncidents = async (req: AuthRequest, res: Response) => {
  try {
    await Incident.deleteMany({ companyId: req.user?.companyId });
    res.json({ success: true, message: 'All incidents deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
