import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { initPiSDK } from '@/lib/pi-sdk';
// Components
import { BottomNav } from '@/components/BottomNav';
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
import AdminPage from '@/pages/AdminPage';
import ChatPage from '@/pages/ChatPage';

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
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/chat');

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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container bg-bg-body">
      <div className="relative w-full h-full">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    try { initPiSDK(false); } catch { /* Pi SDK not yet available */ }
  }, []);

  return (
    <Layout>
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
          <Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
