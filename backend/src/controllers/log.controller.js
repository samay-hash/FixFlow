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

// @POST /api/logs/agent/ingest — For external EC2 agents (No JWT required)
const agentIngest = async (req, res) => {
  try {
    const token = req.headers['x-agent-token'];
    if (!token || token !== process.env.LOG_INGEST_TOKEN) {
      return res.status(401).json({ success: false, message: 'Unauthorized agent' });
    }

    // CompanyId is usually mapped to the token in production, 
    // for this hackathon we take it from body or fallback to a known company
    const { message, level = 'INFO', source = 'syslog', serverIp, companyId } = req.body;
    
    if (!message || !companyId) {
      return res.status(400).json({ success: false, message: 'Message and companyId are required' });
    }

    const ServerLog = require('../models/ServerLog');
    const log = await ServerLog.create({
      companyId,
      serverIp: serverIp || req.ip,
      source,
      level,
      message,
    });

    const { getIO } = require('../socket/socket');
    const io = getIO();
    io.to(`company_${companyId}`).emit('serverlog:new', log);

    res.status(201).json({ success: true, id: log._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/logs/analyze — Analyze last 100 server logs using AI
const analyzeServerLogs = async (req, res) => {
  try {
    const ServerLog = require('../models/ServerLog');
    const { analyzeLogs } = require('../services/ai.service');

    const logs = await ServerLog.find({ companyId: req.user.companyId })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    if (!logs.length) {
      return res.json({ success: true, logs: [], analysis: { summary: 'No logs found.', anomalies: [], fix: '' }});
    }

    const analysis = await analyzeLogs(logs);
    res.json({ success: true, logs, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLogs, ingestLog, getLogSummary, agentIngest, analyzeServerLogs };
