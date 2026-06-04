import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;                          // 0-5, can be fractional (4.5)
  onRate?: (rating: number) => void;       // called when user taps a star
  size?: number;                           // star size in pixels, default 32
  interactive?: boolean;                   // if true, user can tap to rate
  showValue?: boolean;                     // show numeric value below
}

/**
 * Reusable 5-star rating component with Framer Motion animations.
 *
 * Features:
 * - 5 stars in a row, golden (#F5A623) when filled, gray (#444444) when empty
 * - Interactive mode: tap to set rating, hover preview
 * - Partial fills: 4.5 shows 4 full + 1 half-filled star
 * - Optional numeric value display below stars
 * - Staggered entrance animation from left
 */
export function StarRating({
  rating,
  onRate,
  size = 32,
  interactive = false,
  showValue = false,
}: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [tappedStar, setTappedStar] = useState(0);

  const effectiveRating = hoveredStar || rating;

  const handleTap = (star: number) => {
    if (!interactive) return;
    setTappedStar(star);
    onRate?.(star);
    setTimeout(() => setTappedStar(0), 300);
  };

  // Stagger container variant
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  // Individual star entrance variant
  const starVariants = {
    hidden: { opacity: 0, scale: 0.3, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
    },
  };

  // Compute per-star fill percentage
  const starFills = useMemo(() => {
    return [1, 2, 3, 4, 5].map((star) => {
      const diff = effectiveRating - (star - 1);
      return Math.max(0, Math.min(1, diff));
    });
  }, [effectiveRating]);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="flex items-center gap-1 justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPct = starFills[star - 1];
          const isTapped = star === tappedStar;

          return (
            <motion.button
              key={star}
              className="p-1 select-none relative"
              style={{ width: size + 8, height: size + 8 }}
              onClick={() => handleTap(star)}
              onMouseEnter={() => interactive && setHoveredStar(star)}
              onMouseLeave={() => interactive && setHoveredStar(0)}
              whileTap={interactive ? { scale: 0.8 } : {}}
              animate={isTapped ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.25 }}
              variants={starVariants}
              disabled={!interactive}
              type="button"
            >
              {/* Background star (empty/gray) */}
              <Star
                size={size}
                fill="transparent"
                color="#444444"
                strokeWidth={2}
                className="absolute inset-0 m-auto"
              />
              {/* Foreground star (filled/gold) with clip based on percentage */}
              <div
                className="absolute inset-0 m-auto overflow-hidden"
                style={{
                  width: size * Math.min(fillPct, 1),
                  height: size + 4,
                  top: 2,
                  left: 4,
                }}
              >
                <Star
                  size={size}
                  fill="#F5A623"
                  color="#F5A623"
                  strokeWidth={0}
                  className="absolute"
                  style={{ left: 0, top: 0 }}
                />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Numeric value display */}
      {showValue && (
        <motion.span
          className="text-text-secondary text-sm font-semibold mt-2 font-mono"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {rating.toFixed(1)}
        </motion.span>
      )}
    </div>
  );
}
