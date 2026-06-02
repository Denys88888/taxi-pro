import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Wallet, Loader2, AlertCircle, MapPin, Navigation, X } from 'lucide-react';
import { createPayment } from '@/lib/pi-sdk';
import { approvePayment, completePayment } from '@/lib/payment-service';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';

type PaymentStep = 'confirm' | 'escrow' | 'done';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { price, pickup, destination, selectedTariff, setCurrentRide, findMockDriver, saveRideToFirestore } = useApp();

  const [step, setStep] = useState<PaymentStep>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txid, setTxid] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const steps: { key: PaymentStep; label: string; icon: typeof Check }[] = [
    { key: 'confirm', label: t('confirm'), icon: Check },
    { key: 'escrow', label: t('safety'), icon: Shield },
    { key: 'done', label: t('complete'), icon: Check },
  ];

  // Auto-start payment if coming from book page
  useEffect(() => {
    if (step === 'confirm' && !loading && !error) {
      // Don't auto-start, let user click the button
    }
  }, [step, loading, error]);

  const completeRideSetup = useCallback(async (paymentIdParam?: string) => {
    const driver = findMockDriver();
    const rideId = `ride_${Date.now()}`;

    // Set local ride state
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

    // Save ride to Firestore (best effort, don't block on failure)
    try {
      await saveRideToFirestore({
        passengerUid: user?.uid || 'demo_user',
        pickup,
        destination: destination!,
        price,
        paymentId: paymentIdParam,
      });
    } catch (err) {
      console.error('[Payment] Firestore save failed (non-critical):', err);
    }
  }, [findMockDriver, setCurrentRide, user, pickup, destination, price, selectedTariff, saveRideToFirestore]);

  const handlePayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStep('escrow');
    setStatusMsg(t('creatingPayment'));

    try {
      // ALWAYS try real Pi payment first - Pi Browser will handle it
      createPayment(
        {
          amount: Number(price.toFixed(2)),
          memo: `Taxi Pro: ${pickup.name} to ${destination?.name || 'destination'}`,
          metadata: {
            rideId: `ride_${Date.now()}`,
            pickup: pickup.name,
            destination: destination?.name,
            tariff: selectedTariff,
            price: price,
          },
        },
        {
          onReadyForServerApproval: async (pid: string) => {
            console.log('[Payment] onReadyForServerApproval:', pid);
            setPaymentId(pid);
            setStatusMsg(t('approvingPayment'));
            try {
              await approvePayment(pid);
              setStatusMsg(t('paymentApproved'));
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Approval failed';
              console.error('Approval error:', msg);
              setError(`Approval: ${msg}`);
            }
          },
          onReadyForServerCompletion: async (pid: string, tx: string) => {
            console.log('[Payment] onReadyForServerCompletion:', pid, tx);
            setPaymentId(pid);
            setTxid(tx);
            setStatusMsg(t('completingPayment'));
            try {
              await completePayment(pid, tx);
              setStep('done');
              setStatusMsg(t('paymentComplete'));
              await completeRideSetup(pid);
              setTimeout(() => navigate('/driver-found'), 2000);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Completion failed';
              console.error('Completion error:', msg);
              setError(`Completion: ${msg}`);
            }
          },
          onCancel: (pid: string) => {
            console.log('[Payment] onCancel:', pid);
            setError(t('paymentCancelled'));
            setStep('confirm');
            setLoading(false);
          },
          onError: (err: Error) => {
            console.error('[Payment] onError:', err);
            // If Pi Browser error, fall back to demo mode
            setStatusMsg('Pi Browser not detected. Running demo...');
            setTimeout(() => {
              setStep('done');
              completeRideSetup();
              setTimeout(() => navigate('/driver-found'), 2000);
            }, 3000);
          },
        }
      );
      setStatusMsg(t('waitingForPiBrowser'));
    } catch (err: unknown) {
      // createPayment threw - Pi SDK not available, use demo mode
      const msg = err instanceof Error ? err.message : 'Payment failed';
      console.error('[Payment] createPayment threw:', msg);
      setStatusMsg('Pi SDK not available. Demo mode...');
      setTimeout(() => {
        setStep('done');
        completeRideSetup();
        setTimeout(() => navigate('/driver-found'), 2000);
      }, 3000);
    }
  }, [price, pickup, destination, selectedTariff, completeRideSetup, navigate]);

  const handleCancel = useCallback(() => {
    setStep('confirm');
    setLoading(false);
    setError(null);
    setStatusMsg('');
  }, []);

  const isCompleted = (idx: number) => {
    if (step === 'escrow' && idx === 0) return true;
    if (step === 'done' && idx < 2) return true;
    return false;
  };

  const isActive = (idx: number) => {
    const stepIdx = steps.findIndex(s => s.key === step);
    return idx === stepIdx;
  };

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="pt-6 px-4 pb-2 safe-area-top">
        <h1 className="text-text-primary text-xl font-bold text-center">{t('price')}</h1>
        <p className="text-text-tertiary text-sm text-center mt-1">{t('rideCoveredByEscrow')}</p>
      </div>

      {/* Progress Steps */}
      <div className="px-8 py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-bg-elevated -translate-y-1/2 mx-6" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 mx-6"
            animate={{
              width: step === 'confirm' ? '0%' : step === 'escrow' ? '50%' : '100%',
            }}
            transition={{ duration: 0.5 }}
            style={{ width: step === 'confirm' ? '0%' : step === 'escrow' ? '50%' : '100%' }}
          />

          {steps.map((s, idx) => {
            const completed = isCompleted(idx);
            const active = isActive(idx);
            const Icon = s.icon;

            return (
              <div key={s.key} className="relative z-10 flex flex-col items-center gap-1.5">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    completed || active
                      ? 'bg-primary border-primary'
                      : 'bg-bg-elevated border-white/10'
                  }`}
                  animate={active && loading ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: active && loading ? Infinity : 0, duration: 1 }}
                >
                  {completed ? (
                    <Check size={18} color="#FFFFFF" />
                  ) : active && loading ? (
                    <Loader2 size={18} color="#FFFFFF" className="animate-spin" />
                  ) : (
                    <Icon size={18} color={active ? '#FFFFFF' : '#666666'} />
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium ${completed || active ? 'text-primary' : 'text-text-tertiary'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: CONFIRM */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm mx-auto space-y-4 pb-8"
            >
              {/* Price card */}
              <div className="bg-bg-elevated rounded-piride-xl p-6 text-center border border-white/5 shadow-card">
                <p className="text-text-secondary text-sm mb-1">{t('total')}</p>
                <p className="text-primary text-5xl font-bold font-mono">{price.toFixed(2)}</p>
                <p className="text-text-tertiary text-xs mt-2">π Pi</p>
              </div>

              {/* Route info */}
              <div className="bg-bg-elevated/50 rounded-piride-lg p-4 space-y-3 border border-white/5">
                <div className="flex items-center gap-3">
                  <Navigation size={14} color="#00C853" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-tertiary text-[10px]">{t('pickup')}</p>
                    <p className="text-text-primary text-sm truncate">{pickup.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} color="#FF5252" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-tertiary text-[10px]">{t('destination')}</p>
                    <p className="text-text-primary text-sm truncate">{destination?.name || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Info cards */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-bg-elevated/50 rounded-piride-md p-3 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet size={18} color="#00C853" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">Pi {t('wallet')}</p>
                    <p className="text-text-tertiary text-xs">{t('payWithPi')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-bg-elevated/50 rounded-piride-md p-3 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-piPurple/10 flex items-center justify-center">
                    <Shield size={18} color="#6700C2" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{t('safety')}</p>
                    <p className="text-text-tertiary text-xs">{t('rideCoveredByEscrow')}</p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-warning text-sm bg-warning/10 rounded-lg p-3">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                className="w-full h-14 bg-primary rounded-piride-lg font-semibold text-white shadow-glow flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                onClick={handlePayment}
                disabled={loading}
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Wallet size={20} />
                )}
                {t('bookWithPi')}
              </button>
            </motion.div>
          )}

          {/* STEP 2: ESCROW */}
          {step === 'escrow' && (
            <motion.div
              key="escrow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm mx-auto space-y-4 pb-8"
            >
              {/* Price card - ALWAYS visible */}
              <div className="bg-bg-elevated rounded-piride-xl p-5 text-center border border-white/5 shadow-card">
                <p className="text-text-secondary text-sm mb-1">{t('total')}</p>
                <p className="text-primary text-4xl font-bold font-mono">{price.toFixed(2)}</p>
                <p className="text-text-tertiary text-xs mt-1">π Pi</p>
                {/* Route mini */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-xs">
                  <Navigation size={12} color="#00C853" />
                  <span className="text-text-secondary truncate max-w-[120px]">{pickup.name}</span>
                  <span className="text-text-tertiary">→</span>
                  <MapPin size={12} color="#FF5252" />
                  <span className="text-text-secondary truncate max-w-[120px]">{destination?.name}</span>
                </div>
              </div>

              {/* Shield animation */}
              <div className="flex flex-col items-center py-4">
                <motion.div
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Shield size={40} color="#00C853" />
                </motion.div>
              </div>

              {/* Status messages */}
              <div className="text-center space-y-2">
                <h3 className="text-text-primary text-lg font-semibold">{t('processing')}</h3>
                <p className="text-text-secondary text-sm">{statusMsg || t('securingPayment')}</p>
                {paymentId && (
                  <p className="text-text-tertiary text-[10px] font-mono">ID: {paymentId.slice(0, 20)}...</p>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: txid ? '90%' : paymentId ? '50%' : '20%' }}
                  transition={{ duration: 0.8 }}
                />
              </div>

              {/* Route mini */}
              <div className="bg-bg-elevated/50 rounded-piride-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  <Navigation size={12} color="#00C853" />
                  <span className="text-text-secondary truncate">{pickup.name}</span>
                  <span className="text-text-tertiary">→</span>
                  <MapPin size={12} color="#FF5252" />
                  <span className="text-text-secondary truncate">{destination?.name}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-warning text-sm bg-warning/10 rounded-lg p-3"
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Cancel button */}
              <button
                type="button"
                className="w-full h-12 bg-transparent border border-white/20 rounded-piride-lg font-medium text-text-secondary flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                onClick={handleCancel}
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                <X size={18} />
                {t('cancel')}
              </button>
            </motion.div>
          )}

          {/* STEP 3: DONE */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm mx-auto text-center space-y-4 pb-8"
            >
              {/* Success animation */}
              <motion.div
                className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto shadow-glow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Check size={48} color="#00C853" />
              </motion.div>

              {/* Price */}
              <div>
                <p className="text-text-primary text-xl font-bold mb-1">{t('paymentSecured')}</p>
                <p className="text-primary text-3xl font-bold font-mono">{price.toFixed(2)} <span className="text-base">π</span></p>
                <p className="text-text-tertiary text-xs">{t('heldInEscrow')}</p>
              </div>

              {txid && (
                <p className="text-text-tertiary text-xs font-mono bg-bg-elevated rounded p-2">
                  TX: {txid.slice(0, 24)}...
                </p>
              )}

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
                <Loader2 size={16} className="animate-spin text-primary" />
                {t('findingDriver')}
              </div>

              {/* Route */}
              <div className="bg-bg-elevated/50 rounded-piride-lg p-3 border border-white/5">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <Navigation size={12} color="#00C853" />
                  <span className="text-text-secondary">{pickup.name}</span>
                  <span className="text-text-tertiary">→</span>
                  <MapPin size={12} color="#FF5252" />
                  <span className="text-text-secondary">{destination?.name}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
