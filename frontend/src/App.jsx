import { useState, useEffect, useCallback } from 'react';
import SplashLoader from './components/SplashLoader';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AcceptInvite from './pages/AcceptInvite';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Incidents from './pages/Incidents';
import NewIncident from './pages/NewIncident';
import IncidentDetail from './pages/IncidentDetail';
import Team from './pages/Team';
import Logs from './pages/Logs';
import Postmortems from './pages/Postmortems';
import StatusPage from './pages/StatusPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <SocketProvider>
      <Toaster
        position="top-right"
        maxToasts={3}
        toastOptions={{
          style: {
            fontFamily: "'Space Grotesk', sans-serif",
            border: '2px solid var(--black)',
            borderRadius: 0,
            boxShadow: '4px 4px 0 var(--black)',
            background: 'var(--bg-3)',
            color: 'var(--text)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        <Route path="/status/:slug" element={<StatusPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/sites" element={<PrivateRoute><Sites /></PrivateRoute>} />
        <Route path="/incidents" element={<PrivateRoute><Incidents /></PrivateRoute>} />
        <Route path="/incidents/new" element={<PrivateRoute><NewIncident /></PrivateRoute>} />
        <Route path="/incidents/:id" element={<PrivateRoute><IncidentDetail /></PrivateRoute>} />
        <Route path="/team" element={<PrivateRoute><Team /></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
        <Route path="/postmortems" element={<PrivateRoute><Postmortems /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  // Only show splash on very first visit ever (or hard reload)
  const [ready, setReady] = useState(false);
  const onDone = useCallback(() => setReady(true), []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        {!ready && <SplashLoader onDone={onDone} />}
        <div style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: ready ? 'auto' : 'none',
        }}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </Provider>
  );
}
