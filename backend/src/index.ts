import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';

import connectDB from './config/db';
import logger from './utils/logger';
import * as socketInit from './socket/socket';
import { runMonitoringTick } from './services/monitor.service';

// Routes
import authRoutes from './routes/auth.routes';
import siteRoutes from './routes/site.routes';
import incidentRoutes from './routes/incident.routes';
import logRoutes from './routes/log.routes';
import postmortemRoutes from './routes/postmortem.routes';
import webhookRoutes from './routes/webhook.routes';

import ServerLog from './models/ServerLog';
import { archiveLogsToS3 } from './services/s3.service';

const app = express();
const server = http.createServer(app);

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/postmortems', postmortemRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req: Request, res: Response) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── Start Server ───────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  // Init Socket.io
  const io = socketInit.init(server);

  // Start monitoring cron (every 1 minute)
  cron.schedule('* * * * *', () => {
    runMonitoringTick(io).catch(err => logger.error(`Cron error: ${err.message}`));
  });
  logger.info('🕐 Monitoring cron started (every 1 minute)');

  // Start S3 Log Archival cron (runs every midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('☁️ Starting nightly S3 Log Archival...');
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Get all unique companies that have old logs
      const companies = await ServerLog.distinct('companyId', { timestamp: { $lt: yesterday } });
      
      for (const companyId of companies) {
        const logs = await ServerLog.find({ companyId, timestamp: { $lt: yesterday } }).lean();
        if (logs.length > 0) {
          await archiveLogsToS3(companyId.toString(), logs);
          await ServerLog.deleteMany({ companyId, timestamp: { $lt: yesterday } });
          logger.info(`🧹 Cleaned up ${logs.length} old logs from MongoDB for company ${companyId}`);
        }
      }
    } catch (err: any) {
      logger.error(`Archival cron error: ${err.message}`);
    }
  });
  logger.info('📦 S3 Archival cron scheduled (daily at midnight)');

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(`🚀 SIMRS Backend running on http://localhost:${PORT}`);
    logger.info(`📡 Socket.io ready | 🌍 ENV: ${process.env.NODE_ENV}`);
  });
};

startServer().catch(err => {
  logger.error(`Startup error: ${err.message}`);
  process.exit(1);
});
