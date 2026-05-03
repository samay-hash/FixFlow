import axios from 'axios';
import Website, { IWebsite } from '../models/Website';
import UptimeSnapshot from '../models/UptimeSnapshot';
import Incident, { IIncident } from '../models/Incident';
import Log from '../models/Log';
import ServerLog from '../models/ServerLog';
import * as notificationService from './notification.service';
import logger from '../utils/logger';
import { Server } from 'socket.io';

interface CheckResult {
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode: number | null;
  error?: string;
}

// Write a real operational log to ServerLog (visible in Log Intelligence)
const writeServerLog = async (companyId: any, level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL', message: string): Promise<void> => {
  try {
    await ServerLog.create({
      companyId: companyId as any,
      serverIp: 'fixflow-monitor.internal',
      source: 'monitor-agent',
      level,
      message,
    });
  } catch (e) { /* non-critical, don't crash monitor */ }
};

// Check a single site and return result
export const checkSite = async (site: IWebsite): Promise<CheckResult> => {
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
  } catch (error: any) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      statusCode: null,
      error: error.message,
    };
  }
};

// Recalculate uptime % from last 30 days of snapshots
const recalculateUptime = async (siteId: any, companyId: any): Promise<number> => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const snapshots = await UptimeSnapshot.find({ siteId: siteId as any, companyId: companyId as any, timestamp: { $gte: since } });
  if (snapshots.length === 0) return 100;
  const upCount = snapshots.filter(s => s.status === 'up').length;
  return Number(((upCount / snapshots.length) * 100).toFixed(2));
};

// Auto-create incident when site goes down
const createDownIncident = async (site: IWebsite, io?: Server): Promise<IIncident | undefined> => {
  try {
    // Check if there's already an open incident for this site
    const existing = await Incident.findOne({
      siteId: site._id as any,
      companyId: site.companyId as any,
      status: { $ne: 'resolved' } as any,
    });
    if (existing) return existing as unknown as IIncident;

    const incident = await Incident.create({
      title: `${site.name} is DOWN`,
      description: `Automated detection: ${site.url} is returning errors or is unreachable.`,
      severity: 'critical',
      status: 'open',
      source: 'auto',
      siteId: site._id as any,
      companyId: site.companyId as any,
      timeline: [{
        message: `🚨 Automated incident created — ${site.name} detected as DOWN at ${new Date().toISOString()}`,
        type: 'system' as any,
      }] as any,
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
    await notificationService.sendDownAlert(site, incident as unknown as IIncident);

    logger.error(`Auto-incident created for ${site.name} (${site.url})`);
    return incident as unknown as IIncident;
  } catch (err: any) {
    logger.error(`Failed to create incident for ${site.name}: ${err.message}`);
  }
};

// Auto-resolve incident when site comes back up
const autoResolveIncident = async (site: IWebsite, io?: Server): Promise<void> => {
  const incident = await Incident.findOne({
    siteId: site._id as any,
    companyId: site.companyId as any,
    status: { $ne: 'resolved' } as any,
    source: 'auto' as any,
  });

  if (!incident) return;

  incident.status = 'resolved';
  incident.resolvedAt = new Date();
  incident.mttr = Math.round((Date.now() - (incident.createdAt as Date).getTime()) / 1000);
  incident.timeline.push({
    message: `✅ Auto-resolved — ${site.name} is back online. MTTR: ${Math.round(incident.mttr / 60)} minutes.`,
    type: 'system',
    timestamp: new Date(),
    isPublic: false
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
export const runMonitoringTick = async (io?: Server): Promise<void> => {
  try {
    const sites = await Website.find({ isActive: true });
    logger.info(`🔍 Monitoring ${sites.length} sites...`);

    for (const site of sites) {
      const result = await checkSite(site);
      const previousStatus = site.status;

      // Save snapshot
      await UptimeSnapshot.create({
        siteId: site._id as any,
        companyId: site.companyId as any,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: (result.statusCode === null ? undefined : result.statusCode) as any,
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
        io.to(`company_${site.companyId.toString()}`).emit('site:status', {
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
  } catch (err: any) {
    logger.error(`Monitoring tick error: ${err.message}`);
  }
};
