import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Car,
  Navigation,
  Check,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { wsClient } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

type CancelReason =
  | 'changedMind'
  | 'driverTooFar'
  | 'wrongPickup'
  | 'foundAnother'
  | 'other';

interface ReasonOption {
  value: CancelReason;
  icon: React.ReactNode;
}

function getCancellationFee(createdAt: string | undefined, status: string | undefined): number {
  if (!createdAt) return 0;
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const minutesSinceBooking = (now - created) / 60000;

  // No fee if cancelled within 2 minutes of booking
  if (minutesSinceBooking <= 2) return 0;
  // 50% fee if driver already arrived
  if (status === 'driver_arriving' || status === 'driver_found') return 50;
  // 100% fee if ride in progress
  if (status === 'in_progress') return 100;
  // Default: no fee for other statuses
  return 0;
}

function formatFeePercent(fee: number): string {
  if (fee === 0) return '0%';
  return `${fee}%`;
}

export default function CancelRidePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentRide, setCurrentRide } = useApp();
  const [selectedReason, setSelectedReason] = useState<CancelReason | null>(null);
  const [comment, setComment] = useState('');

  const feePercent = useMemo(
    () => getCancellationFee(currentRide?.createdAt, currentRide?.status),
    [currentRide?.createdAt, currentRide?.status]
  );

  const feeAmount = useMemo(() => {
    if (!currentRide?.price || feePercent === 0) return 0;
    return (currentRide.price * feePercent) / 100;
  }, [currentRide?.price, feePercent]);

  const reasons: ReasonOption[] = [
    { value: 'changedMind', icon: <Clock size={18} color="#448AFF" /> },
    { value: 'driverTooFar', icon: <Navigation size={18} color="#F5A623" /> },
    { value: 'wrongPickup', icon: <AlertTriangle size={18} color="#FF5252" /> },
    { value: 'foundAnother', icon: <Car size={18} color="#00C853" /> },
  ];

  const handleCancel = useCallback(() => {
    if (!selectedReason) return;

    wsClient.send('ride_cancelled', {
      rideId: currentRide?.id,
      reason: selectedReason,
      comment: comment.trim() || undefined,
      feePercent,
      feeAmount,
      timestamp: new Date().toISOString(),
    });

    // Update ride status in context
    if (currentRide) {
      setCurrentRide({
        ...currentRide,
        status: 'cancelled',
      });
    }

    navigate('/');
  }, [selectedReason, comment, currentRide, feePercent, feeAmount, setCurrentRide, navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="safe-area-top flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <button
          onClick={handleGoBack}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={18} color="#FFFFFF"/></div>
        </button>
        <h1 className="text-text-primary text-lg font-semibold">{t('cancelRide')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning/10 border border-warning/30 rounded-piride-lg p-4 flex items-start gap-3"
        >
          <AlertTriangle size={20} color="#F5A623" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-warning text-sm font-medium">{t('cancellationWarning')}</p>
            <p className="text-text-secondary text-xs mt-1">
              {t('cancellationFee') + ': ' + formatFeePercent(feePercent)}
            </p>
          </div>
        </motion.div>

        {/* Reason Selection */}
        <div>
          <h2 className="text-text-primary text-sm font-semibold mb-3 uppercase tracking-wide">
            {t('reasonForCancellation')}
          </h2>
          <div className="space-y-2">
            {reasons.map((reason) => (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                className={`w-full flex items-center gap-3 p-4 rounded-piride-lg border transition-colors text-left ${
                  selectedReason === reason.value
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-bg-elevated border-white/5 active:bg-white/5'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedReason === reason.value
                      ? 'bg-primary border-primary'
                      : 'border-text-tertiary'
                  }`}
                >
                  {selectedReason === reason.value && <Check size={14} color="#FFFFFF" />}
                </div>
                {reason.icon}
                <span className="text-text-primary text-sm font-medium">{t(reason.value as any)}</span>
              </button>
            ))}

            {/* Other option */}
            <button
              onClick={() => setSelectedReason('other')}
              className={`w-full flex items-center gap-3 p-4 rounded-piride-lg border transition-colors text-left ${
                selectedReason === 'other'
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-bg-elevated border-white/5 active:bg-white/5'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selectedReason === 'other'
                    ? 'bg-primary border-primary'
                    : 'border-text-tertiary'
                }`}
              >
                {selectedReason === 'other' && <Check size={14} color="#FFFFFF" />}
              </div>
              <span className="text-text-primary text-sm font-medium">{t('otherReason')}</span>
            </button>
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <h2 className="text-text-primary text-sm font-semibold mb-3 uppercase tracking-wide">
            {t('additionalComments')}
          </h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('commentPlaceholder')}
            className="w-full h-24 bg-bg-elevated rounded-piride-lg p-4 text-text-primary placeholder-text-tertiary border border-white/5 focus:border-primary/50 outline-none resize-none text-sm"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="safe-area-bottom px-4 py-4 space-y-2 border-t border-white/5 bg-bg-body">
        <button
          onClick={handleCancel}
          disabled={!selectedReason}
          className={`w-full h-14 rounded-piride-lg font-semibold text-sm active:scale-[0.97] transition-all ${
            selectedReason
              ? 'bg-[#FF5252] text-white'
              : 'bg-bg-elevated text-text-tertiary cursor-not-allowed'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          {feeAmount > 0
            ? t('cancelRide') + ' (' + feeAmount.toFixed(2) + 'π)'
            : t('cancelRide')}
        </button>
        <button
          onClick={handleGoBack}
          className="w-full h-12 rounded-piride-lg text-text-secondary font-medium active:bg-white/5 transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          {t('goBack')}
        </button>
      </div>
    </div>
  );
}
