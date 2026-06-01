import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, Shield, CheckCircle, AlertCircle, ChevronLeft, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LogoTaxi Pro } from '@/components/icons';
import { getIncompletePayment, clearIncompletePayment } from '@/lib/pi-sdk';
import type { IncompletePayment } from '@/lib/pi-sdk';

type AuthState = 'default' | 'loading' | 'success' | 'error';

export default function Auth() {
  const navigate = useNavigate();
  const { login, isPiBrowser } = useAuth();
  const [authState, setAuthState] = useState<AuthState>('default');
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompletePayment, setIncompletePayment] = useState<IncompletePayment | null>(null);
  const [shakeButton, setShakeButton] = useState(false);

  const handleLogin = useCallback(async () => {
    setAuthState('loading');

    try {
      await login();

      // Check for incomplete payment after login
      const pending = getIncompletePayment();
      if (pending) {
        setIncompletePayment(pending);
        setShowIncompleteModal(true);
        setAuthState('default');
        return;
      }

      setAuthState('success');

      // Navigate after success animation
      setTimeout(() => {
        navigate('/role-select');
      }, 800);
    } catch {
      setAuthState('error');
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 400);

      // Reset to default after 2 seconds
      setTimeout(() => {
        setAuthState('default');
      }, 2000);
    }
  }, [login, navigate]);

  const handleResumeRide = useCallback(() => {
    clearIncompletePayment();
    setShowIncompleteModal(false);
    // Navigate to ride status with the incomplete payment ride
    navigate('/status');
  }, [navigate]);

  const handleCancelIncomplete = useCallback(() => {
    clearIncompletePayment();
    setShowIncompleteModal(false);
    setAuthState('success');
    setTimeout(() => {
      navigate('/role-select');
    }, 800);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const buttonBg = authState === 'success'
    ? 'bg-emerald'
    : authState === 'error'
      ? 'bg-error'
      : 'bg-gradient-to-r from-[#2c3e50] to-[#34495e]';

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col relative">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={handleBack}
        className="absolute top-4 left-4 z-10 p-2"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft size={24} className="text-text-primary" />
      </motion.button>

      {/* Logo Area — top 35% */}
      <div className="flex flex-col items-center justify-center pt-16 pb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        >
          <LogoTaxi Pro className="w-[120px] h-[120px]" />
        </motion.div>

        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="text-2xl font-bold text-text-primary mt-4"
        >
          Welcome to Taxi Pro
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="text-base text-text-secondary mt-2"
        >
          Ride &amp; Earn with Pi
        </motion.p>
      </div>

      {/* Auth Content — middle */}
      <div className="flex-1 flex flex-col px-6">
        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="bg-lightgray rounded-taxipro-lg p-5 space-y-4"
        >
          <p className="text-sm font-medium text-text-primary leading-relaxed">
            Taxi Pro uses Pi Network for secure authentication and payments. No passwords needed.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User size={20} className="text-navy shrink-0" />
              <span className="text-sm font-medium text-text-primary">Access your Pi username</span>
            </div>
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-navy shrink-0" />
              <span className="text-sm font-medium text-text-primary">Payment permission for ride fares</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-navy shrink-0" />
              <span className="text-sm font-medium text-text-primary">Secure escrow-protected payments</span>
            </div>
          </div>
        </motion.div>

        {/* Connect Button */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="mt-6"
        >
          <motion.button
            animate={shakeButton ? {
              x: [0, -8, 8, -4, 4, 0],
            } : {}}
            transition={{ duration: 0.4 }}
            whileTap={authState === 'default' ? { scale: 0.97 } : undefined}
            onClick={handleLogin}
            disabled={authState === 'loading' || authState === 'success'}
            className={`w-full h-14 rounded-taxipro-md font-medium text-base text-white flex items-center justify-center gap-2 shadow-md transition-all duration-300 ${buttonBg} ${authState === 'loading' || authState === 'success' ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {authState === 'loading' && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {authState === 'success' && (
              <CheckCircle size={22} />
            )}
            {authState === 'error' && (
              <AlertCircle size={22} />
            )}
            {authState === 'default' && (
              <>
                <span className="text-lg font-bold">&#960;</span>
                <span>Connect with Pi</span>
              </>
            )}
            <span>
              {authState === 'loading' ? 'Connecting...' : authState === 'success' ? 'Connected!' : authState === 'error' ? 'Try Again' : 'Connect with Pi'}
            </span>
          </motion.button>
        </motion.div>

        {/* Pi Browser Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.3 }}
          className="text-center mt-4"
        >
          {!isPiBrowser && (
            <span
              className="text-sm text-info cursor-pointer hover:underline"
              onClick={() => window.open('https://minepi.com', '_blank')}
              role="button"
              tabIndex={0}
            >
              Not in Pi Browser? Download Pi Browser
            </span>
          )}
        </motion.p>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.3 }}
        className="px-6 pb-8 pt-4"
      >
        <p className="text-xs text-text-tertiary text-center">
          By continuing, you agree to our{' '}
          <span className="text-info underline cursor-pointer" onClick={() => { }} role="button" tabIndex={0}>
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-info underline cursor-pointer" onClick={() => { }} role="button" tabIndex={0}>
            Privacy Policy
          </span>
        </p>
      </motion.div>

      {/* Incomplete Payment Modal */}
      <AnimatePresence>
        {showIncompleteModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-modal-overlay"
              onClick={() => setShowIncompleteModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-taxipro-xl z-modal-content p-6"
              style={{ maxWidth: 430, margin: '0 auto' }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-midgray rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Incomplete Payment Found</h2>
                <button
                  onClick={() => setShowIncompleteModal(false)}
                  className="p-1"
                >
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>

              <p className="text-sm text-text-secondary mb-6">
                You have an unfinished ride payment. Would you like to resume it or cancel and continue?
              </p>

              {incompletePayment && (
                <div className="bg-lightgray rounded-taxipro-md p-4 mb-6">
                  <p className="text-xs text-text-tertiary uppercase tracking-wide">Payment ID</p>
                  <p className="text-sm font-mono text-text-primary mt-1 break-all">
                    {incompletePayment.identifier}
                  </p>
                  <p className="text-xs text-text-tertiary mt-2">
                    Status: {incompletePayment.status}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCancelIncomplete}
                  className="flex-1 h-12 rounded-taxipro-md border-2 border-navy text-navy font-medium text-base cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResumeRide}
                  className="flex-1 h-12 rounded-taxipro-md bg-navy text-white font-medium text-base cursor-pointer"
                >
                  Resume Ride
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
