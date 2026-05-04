import { useCallback, useState, type ReactNode } from 'react';
import SplashLoader from './components/SplashLoader';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import DashboardPage from './pages/DashboardPage';
import SitesPage from './pages/SitesPage';
import IncidentsPage from './pages/IncidentsPage';
import NewIncidentPage from './pages/NewIncidentPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import TeamPage from './pages/TeamPage';
import LogsPage from './pages/LogsPage';
import PostmortemsPage from './pages/PostmortemsPage';
import StatusPage from './pages/StatusPage';

type AuthState = {
  auth: {
    isAuthenticated: boolean;
  };
};

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useSelector((state: AuthState) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useSelector((state: AuthState) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        maxToasts={3}
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 18px 45px rgba(15,23,42,0.10)',
            background: '#ffffff',
            color: '#07111f',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
        <Route path="/status/:slug" element={<StatusPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/sites" element={<PrivateRoute><SitesPage /></PrivateRoute>} />
        <Route path="/monitoring" element={<PrivateRoute><SitesPage /></PrivateRoute>} />
        <Route path="/incidents" element={<PrivateRoute><IncidentsPage /></PrivateRoute>} />
        <Route path="/incidents/new" element={<PrivateRoute><NewIncidentPage /></PrivateRoute>} />
        <Route path="/incidents/:id" element={<PrivateRoute><IncidentDetailPage /></PrivateRoute>} />
        <Route path="/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><LogsPage /></PrivateRoute>} />
        <Route path="/postmortems" element={<PrivateRoute><PostmortemsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const onDone = useCallback(() => setReady(true), []);

  return (
    <Provider store={store}>
      {!ready && <SplashLoader onDone={onDone} />}
      <div
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: ready ? 'auto' : 'none',
        }}
      >
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </div>
    </Provider>
  );
}
