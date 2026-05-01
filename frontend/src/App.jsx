import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
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
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid #334155' } }} />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/status/:slug" element={<StatusPage />} />

        {/* Private */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/sites" element={<PrivateRoute><Sites /></PrivateRoute>} />
        <Route path="/incidents" element={<PrivateRoute><Incidents /></PrivateRoute>} />
        <Route path="/incidents/:id" element={<PrivateRoute><IncidentDetail /></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
        <Route path="/postmortems" element={<PrivateRoute><Postmortems /></PrivateRoute>} />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
