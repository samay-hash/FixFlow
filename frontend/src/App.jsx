import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { SocketProvider } from './context/SocketContext';
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
        toastOptions={{
          style: {
            fontFamily: "'Space Grotesk', sans-serif",
            border: '2px solid #0A0A0A',
            borderRadius: 0,
            boxShadow: '3px 3px 0 #0A0A0A',
          },
        }}
      />
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Public auth */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        <Route path="/status/:slug" element={<StatusPage />} />

        {/* Private */}
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

import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    if (localStorage.getItem('fixflow-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for custom theme change event
    const handleThemeChange = (e) => {
      if (e.detail === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
