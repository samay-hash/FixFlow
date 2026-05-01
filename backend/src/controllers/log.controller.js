const Log = require('../models/Log');

// @GET /api/logs
const getLogs = async (req, res) => {
  try {
    const { level, siteId, limit = 100, page = 1 } = req.query;
    const filter = { companyId: req.user.companyId };
    if (level) filter.level = level;
    if (siteId) filter.siteId = siteId;

    const logs = await Log.find(filter)
      .populate('siteId', 'name url')
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Log.countDocuments(filter);
    res.json({ success: true, total, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/logs/ingest — Webhook endpoint for external log drains
const ingestLog = async (req, res) => {
  try {
    const { message, level, source, metadata, siteId } = req.body;
    const log = await Log.create({
      message, level, source, metadata,
      siteId,
      companyId: req.user.companyId,
    });

    const { getIO } = require('../socket/socket');
    const io = getIO();
    io.to(`company_${req.user.companyId}`).emit('log:new', log);

    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/logs/summary — Grouped log counts by level for dashboard
const getLogSummary = async (req, res) => {
  try {
    const summary = await Log.aggregate([
      { $match: { companyId: req.user.companyId, timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);
    const result = { info: 0, warning: 0, error: 0, fatal: 0 };
    summary.forEach(s => { result[s._id] = s.count; });
    res.json({ success: true, summary: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLogs, ingestLog, getLogSummary };
