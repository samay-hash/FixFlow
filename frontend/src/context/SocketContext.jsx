import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addIncidentRealtime, updateIncidentRealtime } from '../store/incidentSlice';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected');
      socket.emit('authenticate', { token });
    });

    socket.on('authenticated', ({ companyId }) => {
      console.log(`✅ Joined company room: ${companyId}`);
    });

    // Real-time incident events
    socket.on('incident:created', (incident) => {
      dispatch(addIncidentRealtime(incident));
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-slide-in' : ''} bg-red-900/90 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-xl flex items-start gap-3 max-w-sm`}>
          <span className="text-xl">🚨</span>
          <div>
            <p className="font-semibold text-sm">New Incident Created</p>
            <p className="text-xs text-red-200 mt-0.5">{incident.title}</p>
          </div>
        </div>
      ), { duration: 8000 });
    });

    socket.on('incident:updated', (incident) => {
      dispatch(updateIncidentRealtime(incident));
    });

    socket.on('notification:alert', ({ message, severity }) => {
      const isGood = severity === 'low';
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-slide-in' : ''} ${isGood ? 'bg-emerald-900/90 border-emerald-500/50' : 'bg-orange-900/90 border-orange-500/50'} border text-white px-4 py-3 rounded-xl shadow-xl flex items-start gap-3 max-w-sm`}>
          <span className="text-xl">{isGood ? '✅' : '⚠️'}</span>
          <p className="text-sm">{message}</p>
        </div>
      ), { duration: 6000 });
    });

    socket.on('site:status', (data) => {
      if (data.status === 'down') {
        toast.error(`${data.name} is DOWN`, { id: `site-${data.siteId}` });
      }
    });

    socket.on('disconnect', () => console.log('❌ Socket disconnected'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, dispatch]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
