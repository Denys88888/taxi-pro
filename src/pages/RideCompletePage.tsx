import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Check, MapPin, Navigation } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';

const TIP_AMOUNTS = [0, 0.5, 1, 2];

export default function RideCompletePage() {
  const navigate = useNavigate();
  const { price, pickup, destination, setCurrentRide, firestoreRideId, updateRideInFirestore } = useApp();
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Update Firestore ride status to completed on mount
  useEffect(() => {
    if (firestoreRideId) {
      updateRideInFirestore(firestoreRideId, 'completed', { paymentStatus: 'confirmed' })
        .catch((err) => console.error('[RideComplete] Firestore update failed:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreRideId]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setTimeout(() => {
      setCurrentRide(null);
      navigate('/');
    }, 2000);
  }, [navigate, setCurrentRide]);

  const ratingText = () => {
    if (rating === 0) return t('tapToRate');
    if (rating >= 4) return t('greatRide');
    if (rating >= 3) return t('goodRide');
    return t('wereSorry');
  };

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Success header */}
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <motion.div
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 shadow-glow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Check size={40} color="#00C853" />
        </motion.div>
        <motion.h1
          className="text-text-primary text-2xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {t('rideComplete')}
        </motion.h1>
        <motion.p
          className="text-text-secondary text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('thankYou')}
        </motion.p>
      </div>

      {/* Fare summary */}
      <motion.div
        className="mx-4 bg-bg-elevated rounded-piride-xl p-5 border border-white/5 shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">{t('tripSummary')}</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Navigation size={14} color="#00C853" className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm truncate">{pickup.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={14} color="#FF5252" className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm truncate">{destination?.name}</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center">
            <span className="text-text-secondary text-sm">{t('totalPaid')}</span>
            <span className="text-primary text-2xl font-bold font-mono">{price.toFixed(2)}</span>
          </div>
          {tip > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">{t('tip')}</span>
              <span className="text-piGold font-mono">+{tip.toFixed(2)}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Rating */}
      <motion.div
        className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-5 border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 text-center">{t('rateYourDriver')}</h3>
        <StarRating rating={rating} onRate={setRating} />
        <p className="text-text-tertiary text-xs text-center mt-2">
          {ratingText()}
        </p>
      </motion.div>

      {/* Tip */}
      <motion.div
        className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-5 border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3 text-center">{t('addATip')}</h3>
        <div className="flex gap-2 justify-center">
          {TIP_AMOUNTS.map((amount) => (
            <button
              key={amount}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                tip === amount
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-bg-surface text-text-secondary border border-white/5'
              }`}
              onClick={() => setTip(amount)}
            >
              {amount === 0 ? t('none') : `+${amount.toFixed(1)}`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Submit */}
      <div className="px-4 pb-8 pt-4">
        {submitted ? (
          <motion.div
            className="text-center py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Check size={24} color="#00C853" className="mx-auto mb-2" />
            <p className="text-primary text-sm font-medium">{t('thanksFeedback')}</p>
          </motion.div>
        ) : (
          <PrimaryButton onClick={handleSubmit}>
            {t('submitGoHome')}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
