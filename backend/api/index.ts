import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from '../src/config/db';
import logger from '../src/utils/logger';
import * as socketInit from '../src/socket/socket';

// Routes
import authRoutes from '../src/routes/auth.routes';
import siteRoutes from '../src/routes/site.routes';
import incidentRoutes from '../src/routes/incident.routes';
import logRoutes from '../src/routes/log.routes';
import postmortemRoutes from '../src/routes/postmortem.routes';
import webhookRoutes from '../src/routes/webhook.routes';

const app = express();
const server = http.createServer(app);

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/postmortems', postmortemRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404 handler
app.use((_req: Request, res: Response) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── DB Connection (cached for serverless) ─────────────────────────
let dbConnected = false;
const ensureDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;

    // Init Socket.io on the server (best-effort in serverless context)
    socketInit.init(server);
  }
};

// ── Serverless handler export ─────────────────────────────────────
export default async function handler(req: any, res: any) {
  await ensureDB();
  return (app as any)(req, res);
}
