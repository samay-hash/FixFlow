const axios = require('axios');
const Website = require('../models/Website');
const UptimeSnapshot = require('../models/UptimeSnapshot');
const Incident = require('../models/Incident');
const Log = require('../models/Log');
const ServerLog = require('../models/ServerLog');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

// Write a real operational log to ServerLog (visible in Log Intelligence)
const writeServerLog = async (companyId, level, message) => {
  try {
    await ServerLog.create({
      companyId,
      serverIp: 'fixflow-monitor.internal',
      source: 'monitor-agent',
      level,
      message,
    });
  } catch (e) { /* non-critical, don't crash monitor */ }
};

// Check a single site and return result
const checkSite = async (site) => {
  const startTime = Date.now();
  try {
    const response = await axios.get(site.url, {
      timeout: 10000,
      validateStatus: null,
      headers: { 'User-Agent': 'SIMRS-Monitor/1.0' },
    });
    const responseTime = Date.now() - startTime;
    const isDown = response.status >= 500;
    const isDegraded = responseTime > 3000 && response.status < 500;

    return {
      status: isDown ? 'down' : isDegraded ? 'degraded' : 'up',
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      statusCode: null,
      error: error.message,
    };
  }
};

// Recalculate uptime % from last 30 days of snapshots
const recalculateUptime = async (siteId, companyId) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const snapshots = await UptimeSnapshot.find({ siteId, companyId, timestamp: { $gte: since } });
  if (snapshots.length === 0) return 100;
  const upCount = snapshots.filter(s => s.status === 'up').length;
  return Number(((upCount / snapshots.length) * 100).toFixed(2));
};

// Auto-create incident when site goes down
const createDownIncident = async (site, io) => {
  try {
    // Check if there's already an open incident for this site
    const existing = await Incident.findOne({
      siteId: site._id,
      companyId: site.companyId,
      status: { $ne: 'resolved' },
    });
    if (existing) return existing;

    const incident = await Incident.create({
      title: `${site.name} is DOWN`,
      description: `Automated detection: ${site.url} is returning errors or is unreachable.`,
      severity: 'critical',
      status: 'open',
      source: 'auto',
      siteId: site._id,
      companyId: site.companyId,
      timeline: [{
        message: `🚨 Automated incident created — ${site.name} detected as DOWN at ${new Date().toISOString()}`,
        type: 'system',
      }],
    });

    // Log the failure
    await Log.create({
      message: `Site DOWN: ${site.url} — automated monitor detected failure`,
      level: 'fatal',
      source: 'monitor',
      companyId: site.companyId,
      siteId: site._id,
      incidentId: incident._id,
    });

    // Broadcast via socket
    if (io) {
      io.to(`company_${site.companyId}`).emit('incident:created', incident);
      io.to(`company_${site.companyId}`).emit('notification:alert', {
        message: `🚨 CRITICAL: ${site.name} is DOWN!`,
        severity: 'critical',
        incidentId: incident._id,
      });
    }

    // Send email notification
    await notificationService.sendDownAlert(site, incident);

    logger.error(`Auto-incident created for ${site.name} (${site.url})`);
    return incident;
  } catch (err) {
    logger.error(`Failed to create incident for ${site.name}: ${err.message}`);
  }
};

// Auto-resolve incident when site comes back up
const autoResolveIncident = async (site, io) => {
  const incident = await Incident.findOne({
    siteId: site._id,
    companyId: site.companyId,
    status: { $ne: 'resolved' },
    source: 'auto',
  });

  if (!incident) return;

  incident.status = 'resolved';
  incident.resolvedAt = new Date();
  incident.mttr = Math.round((Date.now() - incident.createdAt) / 1000);
  incident.timeline.push({
    message: `✅ Auto-resolved — ${site.name} is back online. MTTR: ${Math.round(incident.mttr / 60)} minutes.`,
    type: 'system',
  });
  await incident.save();

  if (io) {
    io.to(`company_${site.companyId}`).emit('incident:updated', incident);
    io.to(`company_${site.companyId}`).emit('notification:alert', {
      message: `✅ ${site.name} is back online. Incident auto-resolved.`,
      severity: 'low',
      incidentId: incident._id,
    });
  }

  logger.info(`Auto-resolved incident for ${site.name}`);
};

// Main monitoring tick — called by cron job every minute
const runMonitoringTick = async (io) => {
  try {
    const sites = await Website.find({ isActive: true });
    logger.info(`🔍 Monitoring ${sites.length} sites...`);

    for (const site of sites) {
      const result = await checkSite(site);
      const previousStatus = site.status;

      // Save snapshot
      await UptimeSnapshot.create({
        siteId: site._id,
        companyId: site.companyId,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
      });

      // ⭐ Write real operational log to Log Intelligence
      if (result.status === 'up') {
        await writeServerLog(site.companyId, 'INFO',
          `[MONITOR] ${site.name} (${site.url}) — UP ✔️  Response: ${result.responseTime}ms | HTTP ${result.statusCode}`);
      } else if (result.status === 'degraded') {
        await writeServerLog(site.companyId, 'WARN',
          `[MONITOR] ${site.name} (${site.url}) — DEGRADED ⚠️  Slow response: ${result.responseTime}ms | HTTP ${result.statusCode}`);
      } else {
        await writeServerLog(site.companyId, 'ERROR',
          `[MONITOR] ${site.name} (${site.url}) — DOWN 🔴  ${result.error || `HTTP ${result.statusCode}`} | Response: ${result.responseTime}ms`);
      }

      // Update site
      site.status = result.status;
      site.lastChecked = new Date();
      site.responseTime = result.responseTime;
      site.uptimePercent = await recalculateUptime(site._id, site.companyId);
      await site.save();

      // Broadcast status update
      if (io) {
        io.to(`company_${site.companyId}`).emit('site:status', {
          siteId: site._id,
          name: site.name,
          status: result.status,
          responseTime: result.responseTime,
          uptimePercent: site.uptimePercent,
        });
      }

      // Handle state transitions
      if (previousStatus !== 'down' && result.status === 'down') {
        await writeServerLog(site.companyId, 'FATAL',
          `[MONITOR] CRITICAL: ${site.name} just went DOWN. Auto-incident created. Previous status: ${previousStatus}`);
        await createDownIncident(site, io);
      } else if (previousStatus === 'down' && result.status === 'up') {
        await writeServerLog(site.companyId, 'INFO',
          `[MONITOR] RECOVERY: ${site.name} is back ONLINE. Auto-resolving incident.`);
        await autoResolveIncident(site, io);
      }
    }
  } catch (err) {
    logger.error(`Monitoring tick error: ${err.message}`);
  }
};

module.exports = { runMonitoringTick, checkSite };
