import { Request, Response } from 'express';
import Log from '../models/Log';
import ServerLog from '../models/ServerLog';
import { getIO } from '../socket/socket';
import * as aiService from '../services/ai.service';
import { AuthRequest } from '../middleware/auth.middleware';

// @GET /api/logs
export const getLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { level, siteId, limit = 100, page = 1 } = req.query;
    const filter: any = { companyId: req.user?.companyId };
    if (level) filter.level = level;
    if (siteId) filter.siteId = siteId;

    const logs = await Log.find(filter)
      .populate('siteId', 'name url')
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Log.countDocuments(filter);
    res.json({ success: true, total, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/logs/ingest — Webhook endpoint for external log drains
export const ingestLog = async (req: AuthRequest, res: Response) => {
  try {
    const { message, level, source, metadata, siteId } = req.body;
    const log = await Log.create({
      message, level, source, metadata,
      siteId,
      companyId: req.user?.companyId,
    });

    const io = getIO();
    io.to(`company_${req.user?.companyId}`).emit('log:new', log);

    res.status(201).json({ success: true, log });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/logs/summary — Grouped log counts by level for dashboard
export const getLogSummary = async (req: AuthRequest, res: Response) => {
  try {
    const summary = await Log.aggregate([
      { $match: { companyId: req.user?.companyId, timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);
    const result: Record<string, number> = { info: 0, warning: 0, error: 0, fatal: 0 };
    summary.forEach(s => { result[s._id] = s.count; });
    res.json({ success: true, summary: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/logs/agent/ingest — For external EC2 agents (No JWT required)
export const agentIngest = async (req: Request, res: Response) => {
  try {
    const token = req.headers['x-agent-token'];
    if (!token || token !== process.env.LOG_INGEST_TOKEN) {
      return res.status(401).json({ success: false, message: 'Unauthorized agent' });
    }

    const { message, level = 'INFO', source = 'syslog', serverIp, companyId } = req.body;
    
    if (!message || !companyId) {
      return res.status(400).json({ success: false, message: 'Message and companyId are required' });
    }

    const log = await ServerLog.create({
      companyId,
      serverIp: serverIp || req.ip,
      source,
      level,
      message,
    });

    const io = getIO();
    io.to(`company_${companyId}`).emit('serverlog:new', log);

    res.status(201).json({ success: true, id: log._id });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/logs/analyze — Analyze last 100 server logs using AI
export const analyzeServerLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await ServerLog.find({ companyId: req.user?.companyId })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    if (!logs.length) {
      return res.json({ success: true, logs: [], analysis: { summary: 'No logs found.', anomalies: [], fix: '' }});
    }

    const analysis = await aiService.analyzeLogs(logs);
    res.json({ success: true, logs, analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
