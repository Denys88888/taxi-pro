import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Wallet, Loader2, AlertCircle } from 'lucide-react';
import { createPayment } from '@/lib/pi-sdk';
import { approvePayment, completePayment } from '@/lib/payment-service';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

type PaymentStep = 'confirm' | 'escrow' | 'done';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { price, pickup, destination, selectedTariff, setCurrentRide, findMockDriver } = useApp();

  const [step, setStep] = useState<PaymentStep>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txid, setTxid] = useState<string>('');

  const steps: { key: PaymentStep; label: string; icon: typeof Check }[] = [
    { key: 'confirm', label: 'Confirm', icon: Check },
    { key: 'escrow', label: 'Escrow', icon: Shield },
    { key: 'done', label: 'Done', icon: Check },
  ];

  const handlePayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStep('escrow');

    try {
      await createPayment(
        price,
        `Taxi Pro ride from ${pickup.name} to ${destination?.name}`,
        {
          rideId: `ride_${Date.now()}`,
          pickup: pickup.name,
          destination: destination?.name,
          tariff: selectedTariff,
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('[Payment] Ready for approval:', paymentId);
            try {
              await approvePayment(paymentId);
            } catch (err) {
              console.error('Approval failed:', err);
              setError('Payment approval failed. Please try again.');
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('[Payment] Ready for completion:', paymentId, txid);
            setTxid(txid);
            try {
              await completePayment(paymentId, txid);
              setStep('done');
              const driver = findMockDriver();
              setCurrentRide({
                id: `ride_${Date.now()}`,
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
              setError('Payment completion failed. Please contact support.');
            }
          },
          onCancel: (paymentId: string) => {
            console.log('[Payment] Cancelled:', paymentId);
            setError('Payment was cancelled.');
            setStep('confirm');
          },
          onError: (paymentId: string, err: Error) => {
            console.error('[Payment] Error:', paymentId, err);
            setError(err.message || 'Payment failed. Please try again.');
            setStep('confirm');
          },
        }
      );
    } catch (err) {
      console.error('Payment creation failed:', err);
      setError('Could not initiate payment. Using demo mode...');
      setTimeout(() => {
        setStep('done');
        const driver = findMockDriver();
        setCurrentRide({
          id: `ride_${Date.now()}`,
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
  }, [price, pickup, destination, selectedTariff, user, findMockDriver, setCurrentRide, navigate]);

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="pt-6 px-4 pb-4">
        <h1 className="text-text-primary text-xl font-bold text-center">Payment</h1>
        <p className="text-text-tertiary text-sm text-center mt-1">Ride fare held in escrow</p>
      </div>

      {/* Progress Steps */}
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="bg-bg-elevated rounded-piride-xl p-6 text-center border border-white/5 shadow-card">
                <p className="text-text-secondary text-sm mb-1">Total Fare</p>
                <motion.p
                  className="text-primary text-5xl font-bold font-mono"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {price.toFixed(2)}
                </motion.p>
                <p className="text-text-tertiary text-xs mt-2">Pi held in escrow until ride complete</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-bg-elevated/50 rounded-piride-md p-3 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet size={18} color="#00C853" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">Pi Payment</p>
                    <p className="text-text-tertiary text-xs">Pay with Pi cryptocurrency</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-bg-elevated/50 rounded-piride-md p-3 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-piPurple/10 flex items-center justify-center">
                    <Shield size={18} color="#6700C2" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">Escrow Protected</p>
                    <p className="text-text-tertiary text-xs">Funds released after ride completion</p>
                  </div>
                </div>
              </div>

              <motion.button
                className="w-full h-14 bg-primary rounded-piride-lg font-semibold text-white shadow-glow flex items-center justify-center gap-2"
                onClick={handlePayment}
                whileTap={{ scale: 0.97 }}
              >
                <Wallet size={20} />
                Pay with Pi
              </motion.button>
            </motion.div>
          )}

          {step === 'escrow' && (
            <motion.div
              key="escrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Shield size={36} color="#00C853" />
              </motion.div>
              <h3 className="text-text-primary text-lg font-semibold mb-2">Processing Payment</h3>
              <p className="text-text-secondary text-sm">Hold tight while we secure your payment in escrow...</p>

              <div className="mt-6 w-48 h-1.5 bg-bg-elevated rounded-full mx-auto overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-warning text-sm bg-warning/10 rounded-lg p-3">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </motion.div>
          )}

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
              <h3 className="text-text-primary text-xl font-bold mb-2">Payment Secured!</h3>
              <p className="text-text-secondary text-sm mb-1">{price.toFixed(2)} Pi held in escrow</p>
              {txid && <p className="text-text-tertiary text-xs font-mono">TX: {txid.slice(0, 16)}...</p>}
              <p className="text-text-tertiary text-xs mt-4">Finding your driver...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
