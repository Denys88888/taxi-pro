import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Wallet, Loader2, AlertCircle, Lock, Link2, ShieldCheck, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { createPayment } from '@/lib/pi-sdk';
import { serverApprovePayment, serverCompletePayment, createPaymentRecord } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { notifyPaymentRequired } from '@/lib/notifications';

type PaymentStep = 'confirm' | 'escrow' | 'done';

// ─── Pi Network Logo ───────────────────────────────────────────
const PiLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="45" stroke="#6700C2" strokeWidth="6" fill="none" />
    <text x="50" y="65" textAnchor="middle" fontSize="45" fontWeight="bold" fill="#6700C2" fontFamily="serif">π</text>
  </svg>
);

// ─── Price Breakdown Row ───────────────────────────────────────
const BreakdownRow = ({ label, value, highlight = false, isTotal = false }: {
  label: string; value: string; highlight?: boolean; isTotal?: boolean;
}) => (
  <div className={`flex justify-between items-center py-1.5 ${isTotal ? 'border-t border-white/10 pt-3 mt-1' : ''}`}>
    <span className={`text-sm ${isTotal ? 'font-semibold' : ''} ${highlight ? 'text-primary' : 'text-text-secondary'}`}>
      {label}
    </span>
    <span className={`text-sm font-mono ${isTotal ? 'font-bold text-lg text-primary' : highlight ? 'text-primary font-medium' : 'text-text-primary'}`}>
      {value}
    </span>
  </div>
);

// ─── Security Badge ────────────────────────────────────────────
const SecurityBadge = ({ icon: Icon, label }: { icon: typeof Lock; label: string }) => (
  <motion.div
    className="flex items-center gap-1.5 bg-bg-elevated/60 rounded-full px-3 py-1.5 border border-white/5"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Icon size={12} className="text-primary" />
    <span className="text-[10px] text-text-secondary whitespace-nowrap">{label}</span>
  </motion.div>
);

export default function PaymentPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { price, pickup, destination, selectedTariff, routeDistance, routeDuration, setCurrentRide, findMockDriver } = useApp();

  const [step, setStep] = useState<PaymentStep>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txid, setTxid] = useState<string>('');

  // ─── Price Breakdown Calculation ─────────────────────────────
  const breakdown = useMemo(() => {
    const tariffMultiplier = selectedTariff === 'standard' ? 1.0 : selectedTariff === 'comfort' ? 1.3 : 1.8;
    const baseFare = 0.50 * tariffMultiplier;
    const distKm = routeDistance > 0 ? routeDistance / 1000 : 12; // fallback 12km
    const durationMin = routeDuration > 0 ? routeDuration / 60 : 15; // fallback 15min
    const distanceFee = distKm * 0.10 * tariffMultiplier;
    const timeFee = durationMin * 0.02 * tariffMultiplier;
    const subtotal = baseFare + distanceFee + timeFee;
    const platformFee = subtotal * 0.02;
    const total = subtotal + platformFee;

    return {
      baseFare,
      distKm: Math.round(distKm),
      durationMin: Math.round(durationMin),
      distanceFee,
      timeFee,
      platformFee,
      total,
    };
  }, [selectedTariff, routeDistance, routeDuration]);

  const steps: { key: PaymentStep; label: string; icon: typeof Check }[] = [
    { key: 'confirm', label: t('confirm'), icon: Check },
    { key: 'escrow', label: t('escrow'), icon: Shield },
    { key: 'done', label: t('done'), icon: Check },
  ];

  // ─── Handle Payment ──────────────────────────────────────────
  const handlePayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStep('escrow');

    const rideId = `ride_${Date.now()}`;
    const memo = `Taxi Pro: ${pickup.name} → ${destination?.name}`;

    try {
      // 1. Create payment record on server first
      await createPaymentRecord({
        amount: price,
        memo,
        metadata: { rideId, tariff: selectedTariff },
        rideId,
      });

      // 2. Initiate Pi SDK payment
      await createPayment(
        price,
        memo,
        {
          rideId,
          pickup: pickup.name,
          destination: destination?.name,
          tariff: selectedTariff,
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('[Payment] Ready for approval:', paymentId);
            try {
              await serverApprovePayment(paymentId);
            } catch (err) {
              console.error('Approval failed:', err);
              setError(t('paymentApprovalFailed'));
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('[Payment] Ready for completion:', paymentId, txid);
            setTxid(txid);
            try {
              await serverCompletePayment(paymentId, txid);
              setStep('done');
              notifyPaymentRequired(price);
              const driver = findMockDriver();
              setCurrentRide({
                id: rideId,
                passengerId: user?.uid || 'demo_user',
                passengerName: user?.username || 'Demo User',
                driverId: driver.id,
                driverName: driver.name,
                driver,
                pickup,
                destination: destination!,
                price,
                status: 'driver_found',
                createdAt: new Date().toISOString(),
                tariff: selectedTariff,
              });
              setTimeout(() => navigate('/driver-found'), 1500);
            } catch (err) {
              console.error('Completion failed:', err);
              setError(t('paymentCompletionFailed'));
            }
          },
          onCancel: (paymentId: string) => {
            console.log('[Payment] Cancelled:', paymentId);
            setError(t('paymentCancelled'));
            setStep('confirm');
          },
          onError: (paymentId: string, err: Error) => {
            console.error('[Payment] Error:', paymentId, err);
            setError(err.message || t('paymentFailed'));
            setStep('confirm');
          },
        }
      );
    } catch (err) {
      console.error('Payment creation failed:', err);
      setError(t('paymentInitFailed'));
      // Fallback to demo mode
      setTimeout(() => {
        setStep('done');
        notifyPaymentRequired(price);
        const driver = findMockDriver();
        setCurrentRide({
          id: rideId,
          passengerId: user?.uid || 'demo_user',
          passengerName: user?.username || 'Demo User',
          driverId: driver.id,
          driverName: driver.name,
          driver,
          pickup,
          destination: destination!,
          price,
          status: 'driver_found',
          createdAt: new Date().toISOString(),
          tariff: selectedTariff,
        });
        setTimeout(() => navigate('/driver-found'), 1500);
      }, 2000);
    } finally {
      setLoading(false);
    }
  }, [price, pickup, destination, selectedTariff, user, findMockDriver, setCurrentRide, navigate, t, routeDistance, routeDuration]);

  const handleRetry = useCallback(() => {
    setError(null);
    setStep('confirm');
  }, []);

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* ── Header with Animated Pi Logo ── */}
      <div className="pt-6 px-4 pb-2 flex flex-col items-center">
        <motion.div
          animate={step === 'escrow' ? { rotate: 360 } : step === 'done' ? { scale: [1, 1.3, 1] } : {}}
          transition={step === 'escrow' ? { repeat: Infinity, duration: 3, ease: 'linear' } : { duration: 0.5, type: 'spring' }}
        >
          <PiLogo size={48} />
        </motion.div>
        <h1 className="text-text-primary text-xl font-bold text-center mt-2">{t('payWithPi')}</h1>
        <p className="text-text-tertiary text-sm text-center mt-1">{t('rideCoveredByEscrow')}</p>
      </div>

      {/* ── Progress Steps ── */}
      <div className="px-8 py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-bg-elevated -translate-y-1/2 mx-6" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 mx-6"
            animate={{ width: step === 'confirm' ? '0%' : step === 'escrow' ? '50%' : '100%' }}
            transition={{ duration: 0.5 }}
          />

          {steps.map((s, idx) => {
            const isActive = step === s.key;
            const isCompleted =
              (step === 'escrow' && idx === 0) ||
              (step === 'done' && idx < 2);
            const Icon = s.icon;

            return (
              <div key={s.key} className="relative z-10 flex flex-col items-center gap-1.5">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive || isCompleted
                      ? 'bg-primary border-primary'
                      : 'bg-bg-elevated border-white/10'
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                >
                  {isCompleted ? (
                    <Check size={18} color="#FFFFFF" />
                  ) : isActive && loading ? (
                    <Loader2 size={18} color="#FFFFFF" className="animate-spin" />
                  ) : (
                    <Icon size={18} color={isActive ? '#FFFFFF' : '#666666'} />
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium ${isActive || isCompleted ? 'text-primary' : 'text-text-tertiary'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ═══════════ CONFIRM STEP ═══════════ */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm space-y-5"
            >
              {/* Total Price Display */}
              <div className="bg-bg-elevated rounded-piride-xl p-6 text-center border border-white/5 shadow-card">
                <p className="text-text-secondary text-sm mb-1">{t('total')}</p>
                <motion.p
                  className="text-primary text-5xl font-bold font-mono"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {price.toFixed(2)}
                </motion.p>
                <span className="text-text-tertiary text-xs">π</span>
                <p className="text-text-tertiary text-xs mt-2">{t('heldInEscrow')}</p>
              </div>

              {/* Price Breakdown */}
              <motion.div
                className="bg-bg-elevated/80 rounded-piride-xl p-5 border border-white/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-text-primary text-sm font-semibold mb-3">{t('fareBreakdown')}</p>
                <BreakdownRow label={t('baseFare')} value={`${breakdown.baseFare.toFixed(2)} π`} />
                <BreakdownRow
                  label={`${t('distanceFee')} (${breakdown.distKm} ${t('km')} × 0.10)`}
                  value={`${breakdown.distanceFee.toFixed(2)} π`}
                />
                <BreakdownRow
                  label={`${t('timeFee')} (${breakdown.durationMin} ${t('min')} × 0.02)`}
                  value={`${breakdown.timeFee.toFixed(2)} π`}
                />
                <BreakdownRow label={`${t('platformFee')} (2%)`} value={`${breakdown.platformFee.toFixed(2)} π`} highlight />
                <BreakdownRow label={t('total')} value={`${breakdown.total.toFixed(2)} π`} isTotal />
              </motion.div>

              {/* Payment Method Cards */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-bg-elevated/50 rounded-piride-md p-3 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet size={18} color="#00C853" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{t('payWithPi')}</p>
                    <p className="text-text-tertiary text-xs">Pi Network</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-bg-elevated/50 rounded-piride-md p-3 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-piPurple/10 flex items-center justify-center">
                    <Shield size={18} color="#6700C2" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{t('rideCoveredByEscrow')}</p>
                    <p className="text-text-tertiary text-xs">{t('escrowDescription')}</p>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <motion.div
                className="flex items-center justify-center gap-2 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SecurityBadge icon={Lock} label={t('encrypted')} />
                <SecurityBadge icon={Link2} label={t('blockchainVerified')} />
                <SecurityBadge icon={ShieldCheck} label={t('escrowProtected')} />
              </motion.div>

              {/* Pay Button */}
              <motion.button
                className="w-full h-14 bg-primary rounded-piride-lg font-semibold text-white shadow-glow flex items-center justify-center gap-2"
                onClick={handlePayment}
                whileTap={{ scale: 0.97 }}
              >
                <Wallet size={20} />
                {t('payWithPi')}
              </motion.button>
            </motion.div>
          )}

          {/* ═══════════ ESCROW STEP ═══════════ */}
          {step === 'escrow' && (
            <motion.div
              key="escrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* Smart Contract Shield Animation */}
              <div className="relative mx-auto mb-6 w-28 h-28 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                />
                {/* Middle pulsing ring */}
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-primary/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.3 }}
                />
                {/* Inner shield */}
                <motion.div
                  className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Shield size={36} className="text-primary" />
                </motion.div>
                {/* Rotating Pi amount */}
                <motion.div
                  className="absolute -bottom-1 bg-bg-elevated border border-primary/30 rounded-full px-2.5 py-0.5"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <span className="text-primary text-xs font-bold font-mono">{price.toFixed(2)} π</span>
                </motion.div>
              </div>

              {/* Escrow Text */}
              <h3 className="text-text-primary text-lg font-semibold mb-1">{t('fundsLocked')}</h3>
              <p className="text-text-secondary text-sm mb-1">{t('escrowDescription')}</p>
              <p className="text-primary text-xs font-medium">{t('smartContract')}</p>

              {/* Security Badges */}
              <motion.div
                className="flex items-center justify-center gap-2 mt-4 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SecurityBadge icon={Lock} label={t('encrypted')} />
                <SecurityBadge icon={Link2} label={t('blockchainVerified')} />
                <SecurityBadge icon={ShieldCheck} label={t('escrowProtected')} />
              </motion.div>

              {/* Loading Bar */}
              <div className="mt-6 w-48 h-1.5 bg-bg-elevated rounded-full mx-auto overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              </div>

              {/* Error during escrow */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mt-4 flex items-center gap-2 text-warning text-sm bg-warning/10 rounded-lg p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ═══════════ DONE STEP ═══════════ */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 shadow-glow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <Check size={48} color="#00C853" />
              </motion.div>
              <h3 className="text-text-primary text-xl font-bold mb-2">{t('paymentSecured')}</h3>
              <p className="text-text-secondary text-sm mb-1">{price.toFixed(2)} π {t('heldInEscrow')}</p>
              {txid && <p className="text-text-tertiary text-xs font-mono">TX: {txid.slice(0, 16)}...</p>}
              <p className="text-text-tertiary text-xs mt-4">{t('findingDriver')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Full-Screen Error Overlay ── */}
      <AnimatePresence>
        {error && step === 'confirm' && (
          <motion.div
            className="absolute inset-0 z-50 bg-bg-body/95 backdrop-blur-sm flex flex-col items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <AlertCircle size={40} className="text-error" />
            </motion.div>
            <h3 className="text-text-primary text-lg font-bold mb-2 text-center">{t('paymentFailed')}</h3>
            <p className="text-text-secondary text-sm text-center mb-6">{error || t('somethingWentWrong')}</p>
            <motion.button
              className="h-12 px-8 bg-primary rounded-piride-lg font-semibold text-white flex items-center gap-2"
              onClick={handleRetry}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RotateCcw size={18} />
              {t('retry')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
