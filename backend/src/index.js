require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const socketInit = require('./socket/socket');
const { runMonitoringTick } = require('./services/monitor.service');

// Routes
const authRoutes = require('./routes/auth.routes');
const siteRoutes = require('./routes/site.routes');
const incidentRoutes = require('./routes/incident.routes');
const logRoutes = require('./routes/log.routes');
const postmortemRoutes = require('./routes/postmortem.routes');

const app = express();
const server = http.createServer(app);

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/postmortems', postmortemRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
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
