import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Incident from '../models/Incident';
import * as aiService from '../services/ai.service';

let io: SocketIOServer;

export const init = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Authenticate and join company room
    socket.on('authenticate', async ({ token }: { token: string }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
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
    socket.on('request:sitrep', async ({ incidentId, token }: { incidentId: string, token: string }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, companyId: string };
        const incident = await Incident.findById(incidentId)
          .populate('siteId', 'name url')
          .populate('assignedTo', 'name');

        if (!incident || incident.companyId.toString() !== decoded.companyId) return;

        const sitrep = await aiService.generateSitrep(incident as any);
        incident.aiSitrep = sitrep;
        await incident.save();

        io.to(`company_${incident.companyId}`).emit('incident:sitrep', { incidentId, sitrep });
      } catch (err: any) {
        console.error('SITREP generation failed:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
