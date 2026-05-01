let io;

const init = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Authenticate and join company room
    socket.on('authenticate', async ({ token }) => {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return socket.emit('auth_error', { message: 'Invalid token' });

        socket.join(`company_${user.companyId}`);
        socket.emit('authenticated', { userId: user._id, companyId: user.companyId });
        console.log(`👤 User ${user.name} joined room company_${user.companyId}`);
      } catch (err) {
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Client requesting live SITREP for an incident
    socket.on('request:sitrep', async ({ incidentId, token }) => {
      try {
        const jwt = require('jsonwebtoken');
        const Incident = require('../models/Incident');
        const aiService = require('../services/ai.service');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const incident = await Incident.findById(incidentId)
          .populate('siteId', 'name url')
          .populate('assignedTo', 'name');

        if (!incident || incident.companyId.toString() !== decoded.companyId) return;

        const sitrep = await aiService.generateSitrep(incident);
        incident.aiSitrep = sitrep;
        await incident.save();

        io.to(`company_${incident.companyId}`).emit('incident:sitrep', { incidentId, sitrep });
      } catch (err) {
        console.error('SITREP generation failed:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = { init, getIO };
