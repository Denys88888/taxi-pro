import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
// Components
import { BottomNav } from '@/components/BottomNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// Pages
import MapHome from '@/pages/MapHome';
import SearchPage from '@/pages/SearchPage';
import BookPage from '@/pages/BookPage';
import PaymentPage from '@/pages/PaymentPage';
import DriverFoundPage from '@/pages/DriverFoundPage';
import RideProgressPage from '@/pages/RideProgressPage';
import RideCompletePage from '@/pages/RideCompletePage';
import RidesPage from '@/pages/RidesPage';
import ProfilePage from '@/pages/ProfilePage';
import DriverModePage from '@/pages/DriverModePage';
import ChatPage from '@/pages/ChatPage';
import RateRidePage from '@/pages/RateRidePage';
import SOSPage from '@/pages/SOSPage';
import CancelRidePage from '@/pages/CancelRidePage';
import AdminPage from '@/pages/AdminPage';
import OnboardingPage from '@/pages/OnboardingPage';

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isOverlay = location.pathname.startsWith('/search') ||
    location.pathname.startsWith('/book') ||
    location.pathname.startsWith('/payment') ||
    location.pathname.startsWith('/driver-found') ||
    location.pathname.startsWith('/ride') ||
    location.pathname.startsWith('/complete') ||
    location.pathname.startsWith('/rides') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/driver') ||
    location.pathname.startsWith('/chat') ||
    location.pathname.startsWith('/rate-ride') ||
    location.pathname.startsWith('/sos') ||
    location.pathname.startsWith('/cancel-ride');

  if (isOverlay) {
    return (
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-modal-content"
      >
        {children}
      </motion.div>
    );
  }

  return <>{children}</>;
}

function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container bg-bg-body">
      <div className="relative w-full h-full">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

function MobileRoutes() {
  const location = useLocation();
  return (
    <MobileLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><MapHome /></PageTransition>} />
          <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="/book" element={<PageTransition><BookPage /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><PaymentPage /></PageTransition>} />
          <Route path="/driver-found" element={<PageTransition><DriverFoundPage /></PageTransition>} />
          <Route path="/ride" element={<PageTransition><RideProgressPage /></PageTransition>} />
          <Route path="/complete" element={<PageTransition><RideCompletePage /></PageTransition>} />
          <Route path="/rides" element={<PageTransition><RidesPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/driver" element={<PageTransition><DriverModePage /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
          <Route path="/rate-ride" element={<PageTransition><RateRidePage /></PageTransition>} />
          <Route path="/sos" element={<PageTransition><SOSPage /></PageTransition>} />
          <Route path="/cancel-ride" element={<PageTransition><CancelRidePage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </MobileLayout>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const hasOnboarded = localStorage.getItem('taxipro_onboarded') === 'true';

  if (!hasOnboarded) {
    return (
      <ErrorBoundary>
        <OnboardingPage />
      </ErrorBoundary>
    );
  }

  if (isAdmin) {
    return (
      <ErrorBoundary>
        <AdminPage />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <MobileRoutes />
    </ErrorBoundary>
  );
}
