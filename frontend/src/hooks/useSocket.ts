import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateIncidentInList, addIncident } from '../store/slices/incidentSlice';
import { updateSiteInList } from '../store/slices/siteSlice';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('⚡ Socket connected');
        socketRef.current?.emit('authenticate', { token });
      });

      socketRef.current.on('authenticated', ({ companyId }) => {
        console.log(`✅ Authenticated room for company: ${companyId}`);
      });

      socketRef.current.on('incident:created', (incident) => {
        dispatch(addIncident(incident));
        toast.error(`New Incident: ${incident.title}`, { icon: '🚨' });
      });

      socketRef.current.on('incident:updated', (incident) => {
        dispatch(updateIncidentInList(incident));
      });

      socketRef.current.on('site:status', (statusUpdate) => {
        dispatch(updateSiteInList({ id: statusUpdate.siteId, ...statusUpdate }));
      });

      socketRef.current.on('notification:alert', (alert) => {
        toast(alert.message, {
          icon: alert.severity === 'critical' ? '🔥' : '⚠️',
          style: {
            borderRadius: '10px',
            background: alert.severity === 'critical' ? '#fee2e2' : '#fffbeb',
            color: alert.severity === 'critical' ? '#991b1b' : '#92400e',
          },
        });
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });
    }

    return () => {
      // Don't disconnect on every re-render, only on logout or unmount
    };
  }, [isAuthenticated, token, dispatch]);

  return socketRef.current;
};
