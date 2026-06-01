import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Check } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────

interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

interface PriceBreakdown {
  base: number;
  distancePrice: number;
  subtotal: number;
  commission: number;
  total: number;
  driverGets: number;
}

type PaymentStep = 0 | 1 | 2 | 3;
type PaymentStatus = 'processing' | 'approved' | 'completed' | 'error';

// ─── Step Configuration ────────────────────────────────────────

const STEP_CONFIG = [
  {
    title: 'Initiating Payment...',
    description: "We're connecting to the Pi Network to start your payment.",
    label: 'Initiate',
  },
  {
    title: 'Waiting for Approval...',
    description: 'Taxi Pro is verifying and approving your payment. This may take a few seconds.',
    label: 'Approve',
  },
  {
    title: 'Confirming on Blockchain...',
    description: 'Your transaction is being recorded on the Pi blockchain. Almost there...',
    label: 'Confirm',
  },
  {
    title: 'Payment Complete!',
    description: 'Your payment is secure in escrow. Finding your driver now!',
    label: 'Complete',
  },
];

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

// ─── Animated Pi Symbol ────────────────────────────────────────

function PiAnimation({ status, step }: { status: PaymentStatus; step: PaymentStep }) {
  return (
    <div className="relative w-[100px] h-[100px] flex items-center justify-center">
      {/* Rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-navy/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{
          borderStyle: step === 3 ? 'solid' : 'dashed',
          borderColor: step === 3 ? '#27ae60' : 'rgba(44, 62, 80, 0.4)',
        }}
      />

      {/* Pi symbol */}
      <motion.span
        className="text-6xl font-bold select-none"
        style={{ color: step === 3 ? '#27ae60' : '#2c3e50' }}
        animate={
          status === 'processing'
            ? { scale: [1, 1.05, 1] }
            : status === 'completed'
              ? { scale: [1, 1.15, 1] }
              : {}
        }
        transition={{ duration: 1.5, repeat: status === 'processing' ? Infinity : 0 }}
      >
        {step === 3 ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Check size={48} strokeWidth={3} />
          </motion.span>
        ) : (
          'π'
        )}
      </motion.span>

      {/* Green dot */}
      {step >= 1 && (
        <motion.div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// ─── Stepper ───────────────────────────────────────────────────

function ProgressStepper({
  currentStep,
  status,
}: {
  currentStep: PaymentStep;
  status: PaymentStatus;
}) {
  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Nodes and connecting lines */}
      <div className="flex items-center justify-between relative">
        {/* Connecting lines background */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-midgray -z-10" />

        {/* Active connecting lines */}
        <motion.div
          className="absolute top-4 left-4 h-0.5 bg-navy -z-10"
          initial={{ width: 0 }}
          animate={{
            width: `${(currentStep / 3) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: easeOut }}
        />

        {STEP_CONFIG.map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isError = status === 'error' && isCurrent;

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              {/* Node */}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-navy text-white' : ''}
                  ${isCurrent && !isError ? 'bg-navy text-white' : ''}
                  ${isError ? 'bg-error text-white' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-midgray text-text-tertiary' : ''}
                `}
                animate={
                  isCurrent && status === 'processing'
                    ? { scale: [1, 1.15, 1] }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs ${
                  index <= currentStep
                    ? 'font-medium text-text-primary'
                    : 'text-text-tertiary'
                }`}
              >
                {STEP_CONFIG[index].label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function Payment() {
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [currentStep, setCurrentStep] = useState<PaymentStep>(0);
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load payment data ──
  useEffect(() => {
    const paymentJson = sessionStorage.getItem('taxipro_payment_data');
    const priceJson = sessionStorage.getItem('taxipro_payment_price');

    if (!paymentJson || !priceJson) {
      navigate('/ride');
      return;
    }

    try {
      setPaymentData(JSON.parse(paymentJson));
      setPriceBreakdown(JSON.parse(priceJson));
    } catch {
      navigate('/ride');
    }
  }, [navigate]);

  // ── Simulate payment flow ──
  useEffect(() => {
    if (!paymentData) return;

    // Step 1: Initiating (already active)
    const t1 = setTimeout(() => {
      setCurrentStep(1);

      // Step 2: Approval
      const t2 = setTimeout(() => {
        setCurrentStep(2);

        // Step 3: Blockchain confirmation
        const t3 = setTimeout(() => {
          setCurrentStep(3);
          setStatus('completed');

          // Auto-navigate to Ride Status
          const t4 = setTimeout(() => {
            // Store ride data for status screen
            const rideData = {
              rideId: paymentData.metadata.rideId as string,
              paymentId: `payment_${Date.now()}`,
              amount: paymentData.amount,
            };
            sessionStorage.setItem('taxipro_ride_data', JSON.stringify(rideData));
            navigate('/status');
          }, 1500);

          timerRef.current = t4;
        }, 2500);

        timerRef.current = t3;
      }, 2500);

      timerRef.current = t2;
    }, 2000);

    timerRef.current = t1;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paymentData, navigate]);

  // ── Handle cancel ──
  const handleCancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate('/preview');
  }, [navigate]);

  // ── Close / cancel button ──
  const isCancellable = currentStep <= 1 && status === 'processing';

  if (!paymentData || !priceBreakdown) {
    return null;
  }

  return (
    <div className="mobile-container bg-offwhite relative flex flex-col min-h-[100dvh]">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-center h-14 px-4 relative">
        <h1 className="text-lg font-semibold text-text-primary">
          Processing Payment
        </h1>
        {isCancellable && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="absolute right-4"
            onClick={() => setShowCancelConfirm(true)}
          >
            <X size={24} className="text-text-secondary" />
          </motion.button>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        {/* Pi Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <PiAnimation status={status} step={currentStep} />
        </motion.div>

        {/* Status Title */}
        <div className="mt-8 text-center min-h-[60px]">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStep}
              className="text-xl font-semibold text-text-primary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {STEP_CONFIG[currentStep].title}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${currentStep}`}
              className="text-base text-text-secondary mt-2 max-w-[300px] mx-auto"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {STEP_CONFIG[currentStep].description.replace(
                '{amount}',
                paymentData.amount.toFixed(2)
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Stepper */}
        <motion.div
          className="mt-8 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ProgressStepper currentStep={currentStep} status={status} />
        </motion.div>

        {/* Escrow Banner (steps 2-4) */}
        <AnimatePresence>
          {currentStep >= 1 && (
            <motion.div
              className="mt-8 w-full mx-6 bg-[#f8f9ff] border border-navy/10 rounded-taxipro-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-navy shrink-0" />
                <span className="text-sm font-medium text-text-primary">
                  Your π {paymentData.amount.toFixed(2)} is held in escrow
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Released to driver only after ride completion
              </p>

              {/* Breakdown */}
              <div className="mt-3 pt-3 border-t border-navy/10 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-text-secondary">Ride Amount</span>
                  <span className="text-xs text-text-primary">
                    π {priceBreakdown.driverGets.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-secondary">Platform Fee (2%)</span>
                  <span className="text-xs text-text-primary">
                    π {priceBreakdown.commission.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-secondary">Driver Receives</span>
                  <span className="text-xs font-medium text-emerald">
                    π {priceBreakdown.driverGets.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-navy/10">
                  <span className="text-xs font-medium text-text-primary">
                    Total Charged
                  </span>
                  <span className="text-xs font-bold text-navy">
                    π {priceBreakdown.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Cancel Button (early stages) ── */}
      {isCancellable && (
        <motion.div
          className="shrink-0 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full h-[52px] rounded-taxipro-md border-2 border-navy text-navy font-medium text-base active:bg-navy/5 transition-colors"
          >
            Cancel Payment
          </button>
        </motion.div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            className="fixed inset-0 z-modal-overlay bg-black/50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-taxipro-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Cancel Payment?
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Are you sure you want to cancel this payment? Your ride will not be
                booked.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 h-12 rounded-taxipro-md border-2 border-midgray text-text-secondary font-medium"
                >
                  No, Continue
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 h-12 rounded-taxipro-md bg-error text-white font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
