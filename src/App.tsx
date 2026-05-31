import { Routes, Route, Navigate } from 'react-router';
import { useAuth, hasSeenOnboarding } from '@/contexts/AuthContext';
// Pages
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import RoleSelect from './pages/RoleSelect';
import Ride from './pages/Ride';
import SearchLocation from './pages/SearchLocation';
import RidePreview from './pages/RidePreview';
import Payment from './pages/Payment';
import RideStatus from './pages/RideStatus';
import RideHistory from './pages/RideHistory';
import DriverDashboard from './pages/DriverDashboard';
import DriverNavigation from './pages/DriverNavigation';
import Earnings from './pages/Earnings';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

function OnboardingGuard() {
  const { isAuthenticated, user } = useAuth();
  const seen = hasSeenOnboarding();

  if (!seen) {
    return <Onboarding />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/role-select" replace />;
  }

  if (user.role === 'driver') {
    return <Navigate to="/driver" replace />;
  }

  return <Navigate to="/ride" replace />;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function RoleGuard({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: 'passenger' | 'driver';
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/role-select" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/ride'} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Root: onboarding or redirect */}
        <Route path="/" element={<OnboardingGuard />} />

        {/* Auth flow */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/role-select" element={<AuthGuard><RoleSelect /></AuthGuard>} />

        {/* Passenger routes */}
        <Route
          path="/ride"
          element={
            <RoleGuard allowedRole="passenger">
              <Ride />
            </RoleGuard>
          }
        />
        <Route
          path="/search"
          element={
            <RoleGuard allowedRole="passenger">
              <SearchLocation />
            </RoleGuard>
          }
        />
        <Route
          path="/preview"
          element={
            <RoleGuard allowedRole="passenger">
              <RidePreview />
            </RoleGuard>
          }
        />
        <Route
          path="/payment"
          element={
            <RoleGuard allowedRole="passenger">
              <Payment />
            </RoleGuard>
          }
        />
        <Route
          path="/status"
          element={
            <RoleGuard allowedRole="passenger">
              <RideStatus />
            </RoleGuard>
          }
        />
        <Route
          path="/history"
          element={
            <AuthGuard>
              <RideHistory />
            </AuthGuard>
          }
        />

        {/* Driver routes */}
        <Route
          path="/driver"
          element={
            <RoleGuard allowedRole="driver">
              <DriverDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/driver-nav"
          element={
            <RoleGuard allowedRole="driver">
              <DriverNavigation />
            </RoleGuard>
          }
        />
        <Route
          path="/earnings"
          element={
            <RoleGuard allowedRole="driver">
              <Earnings />
            </RoleGuard>
          }
        />

        {/* Shared routes */}
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />

        {/* Admin */}
        <Route path="/admin" element={<Admin />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global toast container - placeholder for future integration */}
      <div id="toast-root" />
    </>
  );
}
