import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { StarRating } from '@/components/StarRating';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useApp } from '@/contexts/AppContext';
import { wsClient } from '@/lib/api';

// ─── Tag Data ──────────────────────────────────────────────────

const POSITIVE_TAGS = [
  { key: 'greatDriver', label: 'Great driver' },
  { key: 'cleanCar', label: 'Clean car' },
  { key: 'onTime', label: 'On time' },
  { key: 'friendly', label: 'Friendly' },
  { key: 'safeDriving', label: 'Safe driving' },
];

const NEGATIVE_TAGS = [
  { key: 'lateArrival', label: 'Late arrival' },
  { key: 'rudeBehavior', label: 'Rude behavior' },
  { key: 'dirtyCar', label: 'Dirty car' },
  { key: 'unsafeDriving', label: 'Unsafe driving' },
  { key: 'wrongRoute', label: 'Wrong route' },
];

// ─── Main Component ────────────────────────────────────────────

export default function RateRidePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentRide } = useApp();

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const driverName = currentRide?.driver?.name || t('driver');

  // Determine which tags to show based on rating
  const tags = rating >= 4 ? POSITIVE_TAGS : rating >= 1 ? NEGATIVE_TAGS : [];

  const toggleTag = useCallback((tagKey: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagKey)
        ? prev.filter((k) => k !== tagKey)
        : [...prev, tagKey]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (rating === 0) return;

    // Send rating via WebSocket
    wsClient.send('rate_ride', {
      rideId: currentRide?.id,
      rating,
      tags: selectedTags,
      comment,
      role: 'passenger',
    });

    setSubmitted(true);

    // Navigate home after success animation
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }, [rating, selectedTags, comment, currentRide?.id, navigate]);

  const handleClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Feedback label based on rating
  const feedbackLabel =
    rating === 0
      ? t('tapToRate')
      : rating >= 4
        ? t('greatRide')
        : rating >= 3
          ? t('goodRide')
          : t('wereSorry');

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-text-primary text-lg font-bold">{t('rateRide')}</h1>
        <motion.button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated border border-white/10"
          whileTap={{ scale: 0.9 }}
        >
          <X size={20} color="#FFFFFF" />
        </motion.button>
      </div>

      {/* ─── Content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="rating-form"
              className="flex flex-col items-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Driver avatar + name */}
              <motion.div
                className="flex flex-col items-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-3 border-2 border-primary/20">
                  <User size={36} color="#00C853" />
                </div>
                <p className="text-text-primary text-lg font-semibold">{driverName}</p>
                <p className="text-text-tertiary text-xs mt-0.5">{t('howWasRide')}</p>
              </motion.div>

              {/* Big interactive star rating */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <StarRating
                  rating={rating}
                  onRate={setRating}
                  size={48}
                  interactive
                  showValue={rating > 0}
                />
              </motion.div>

              {/* Feedback label */}
              <motion.p
                className="text-text-secondary text-sm mb-6"
                key={feedbackLabel}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {feedbackLabel}
              </motion.p>

              {/* Tags section */}
              <AnimatePresence>
                {rating > 0 && (
                  <motion.div
                    className="w-full mb-5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3 justify-center">
                      {rating >= 4 ? (
                        <ThumbsUp size={14} color="#00C853" />
                      ) : (
                        <ThumbsDown size={14} color="#FF5252" />
                      )}
                      <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                        {rating >= 4 ? t('whatWasGreat') : t('whatWentWrong')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {tags.map((tag, i) => {
                        const isSelected = selectedTags.includes(tag.key);
                        return (
                          <motion.button
                            key={tag.key}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                              isSelected
                                ? rating >= 4
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/15 border-red-500/30 text-red-400'
                                : 'bg-bg-elevated border-white/10 text-text-secondary'
                            }`}
                            onClick={() => toggleTag(tag.key)}
                            whileTap={{ scale: 0.93 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            {t(tag.key as any)}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comment textarea */}
              <AnimatePresence>
                {rating > 0 && (
                  <motion.div
                    className="w-full mb-6"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <textarea
                      className="w-full bg-bg-elevated border border-white/10 rounded-2xl p-4 text-text-primary text-sm placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary/40 transition-colors"
                      rows={3}
                      placeholder={t('tellUsMore')}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ─── Success State ────────────────────────────── */
            <motion.div
              key="success"
              className="flex flex-col items-center justify-center pt-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              >
                <Check size={48} color="#00C853" />
              </motion.div>
              <motion.h2
                className="text-text-primary text-xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('thanksFeedback')}
              </motion.h2>
              <motion.p
                className="text-text-secondary text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('ratingSubmitted')}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Submit Button ──────────────────────────────────── */}
      {!submitted && (
        <div className="shrink-0 px-4 pb-8 pt-2">
          <PrimaryButton
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            {t('submitRating')}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
