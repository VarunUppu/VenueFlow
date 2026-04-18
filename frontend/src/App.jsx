import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffProfile from './pages/StaffProfile';
import AttendeeProfile from './pages/AttendeeProfile';

import OpsDashboard from './pages/OpsDashboard';
import AttendeeApp from './pages/AttendeeApp';
import StaffDispatch from './pages/StaffDispatch';
import IncidentLogs from './pages/IncidentLogs';
import ZoneManagement from './pages/ZoneManagement';
import QueuesWaitTimes from './pages/QueuesWaitTimes';
import FoodDrinkOrdering from './pages/FoodDrinkOrdering';
import AlertsHistory from './pages/AlertsHistory';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function App() {
  return (
    <AuthProvider>
      <APIProvider apiKey={API_KEY}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Operations (staff-only) routes */}
            <Route path="/ops" element={<ProtectedRoute requiredRole="staff"><OpsDashboard /></ProtectedRoute>} />
            <Route path="/ops/dispatch" element={<ProtectedRoute requiredRole="staff"><StaffDispatch /></ProtectedRoute>} />
            <Route path="/ops/incidents" element={<ProtectedRoute requiredRole="staff"><IncidentLogs /></ProtectedRoute>} />
            <Route path="/ops/zones" element={<ProtectedRoute requiredRole="staff"><ZoneManagement /></ProtectedRoute>} />
            <Route path="/ops/profile" element={<ProtectedRoute requiredRole="staff"><StaffProfile /></ProtectedRoute>} />

            {/* Attendee routes */}
            <Route path="/attendee" element={<ProtectedRoute requiredRole="attendee"><AttendeeApp /></ProtectedRoute>} />
            <Route path="/attendee/queues" element={<ProtectedRoute requiredRole="attendee"><QueuesWaitTimes /></ProtectedRoute>} />
            <Route path="/attendee/dining" element={<ProtectedRoute requiredRole="attendee"><FoodDrinkOrdering /></ProtectedRoute>} />
            <Route path="/attendee/food" element={<Navigate to="/attendee/dining" replace />} />
            <Route path="/attendee/alerts" element={<ProtectedRoute requiredRole="attendee"><AlertsHistory /></ProtectedRoute>} />
            <Route path="/attendee/profile" element={<ProtectedRoute requiredRole="attendee"><AttendeeProfile /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </APIProvider>
    </AuthProvider>
  );
}

export default App;
