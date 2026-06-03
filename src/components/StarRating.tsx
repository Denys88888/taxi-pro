import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, onRate, size = 32 }: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [tappedStar, setTappedStar] = useState(0);

  const handleTap = (star: number) => {
    setTappedStar(star);
    onRate(star);
    setTimeout(() => setTappedStar(0), 300);
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoveredStar || rating);
        const isTapped = star === tappedStar;

        return (
          <motion.button
            key={star}
            className="p-1 select-none"
            onClick={() => handleTap(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            whileTap={{ scale: 0.8 }}
            animate={isTapped ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.25 }}
          >
            <Star
              size={size}
              fill={isFilled ? '#F5A623' : 'transparent'}
              color={isFilled ? '#F5A623' : '#444444'}
              strokeWidth={isFilled ? 0 : 2}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
