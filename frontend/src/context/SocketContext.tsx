import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addIncidentRealtime, updateIncidentRealtime } from '../store/incidentSlice';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

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
        <div onClick={() => toast.dismiss(t.id)} className={`${t.visible ? 'animate-fade-in' : 'animate-fade-out'} cursor-pointer bg-[var(--pink)] text-white p-4 flex items-start justify-between gap-3 min-w-[300px]`}>
          <div className="flex gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-black text-sm uppercase tracking-wider">New Incident</p>
              <p className="text-xs font-bold mt-0.5">{incident.title}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }} className="text-white hover:text-gray-200"><X size={16} /></button>
        </div>
      ), { duration: 6000 });
    });

    socket.on('incident:updated', (incident) => {
      dispatch(updateIncidentRealtime(incident));
    });

    socket.on('notification:alert', ({ message, severity }) => {
      const isGood = severity === 'low';
      toast.custom((t) => (
        <div onClick={() => toast.dismiss(t.id)} className={`${t.visible ? 'animate-fade-in' : 'animate-fade-out'} cursor-pointer ${isGood ? 'bg-[var(--lime)] text-[var(--black)]' : 'bg-[#FF6B00] text-white'} p-4 flex items-start justify-between gap-3 min-w-[300px]`}>
          <div className="flex gap-3 items-center">
            <span className="text-xl">{isGood ? '✅' : '⚠️'}</span>
            <p className="text-sm font-bold uppercase tracking-wider">{message}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }} className="hover:opacity-70"><X size={16} /></button>
        </div>
      ), { duration: 5000 });
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
