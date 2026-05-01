const Incident = require('../models/Incident');
const Log = require('../models/Log');
const { getIO } = require('../socket/socket');

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
    const { title, description, severity, siteId, assignedTo } = req.body;
    const incident = await Incident.create({
      title, description, severity,
      siteId, assignedTo: assignedTo || [],
      source: 'manual',
      companyId: req.user.companyId,
      createdBy: req.user._id,
      timeline: [{
        message: `Incident created manually by ${req.user.name}`,
        updatedBy: req.user._id,
        type: 'system',
      }],
    });
    await incident.populate(['siteId', 'assignedTo', 'createdBy']);

    // Real-time broadcast
    const io = getIO();
    io.to(`company_${req.user.companyId}`).emit('incident:created', incident);

    res.status(201).json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/incidents/:id
const updateIncident = async (req, res) => {
  try {
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

// @POST /api/incidents/trigger-chaos — Demo mode only
const triggerChaos = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production')
      return res.status(403).json({ success: false, message: 'Chaos mode disabled in production' });

    const Website = require('../models/Website');
    let site = await Website.findOne({ companyId: req.user.companyId });

    const incident = await Incident.create({
      title: '🔥 [CHAOS] Simulated Production Outage',
      description: 'Chaos mode triggered for demo purposes. This simulates a real production outage.',
      severity: 'critical',
      status: 'open',
      source: 'auto',
      siteId: site?._id,
      companyId: req.user.companyId,
      timeline: [{
        message: '🔥 CHAOS MODE ACTIVATED — Simulated outage triggered',
        type: 'system',
      }],
    });

    if (site) { site.status = 'down'; await site.save(); }

    await Log.create({
      message: '[CHAOS] Simulated 500 Internal Server Error — Connection to database refused',
      level: 'fatal',
      source: 'chaos-mode',
      companyId: req.user.companyId,
      siteId: site?._id,
      incidentId: incident._id,
    });

    const io = getIO();
    io.to(`company_${req.user.companyId}`).emit('incident:created', incident);
    io.to(`company_${req.user.companyId}`).emit('notification:alert', {
      message: '🔥 CRITICAL: Production outage detected!',
      severity: 'critical',
      incidentId: incident._id,
    });

    res.status(201).json({ success: true, message: 'Chaos triggered!', incident });
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

module.exports = { getIncidents, getIncidentById, createIncident, updateIncident, addTimelineUpdate, triggerChaos, getStats };
