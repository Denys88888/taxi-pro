import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Onboarding1, Onboarding2, Onboarding3 } from '@/components/icons';
import { markOnboardingComplete } from '@/contexts/AuthContext';

interface Slide {
  id: number;
  illustration: typeof Onboarding1;
  headline: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: 0,
    illustration: Onboarding1,
    headline: 'Ride Anywhere',
    description: "Book a ride in seconds. Set your pickup and destination, and we'll connect you with a nearby driver.",
  },
  {
    id: 1,
    illustration: Onboarding2,
    headline: 'Pay with Pi',
    description: 'Use your Pi cryptocurrency for seamless payments. No cash, no cards — just Pi.',
  },
  {
    id: 2,
    illustration: Onboarding3,
    headline: 'Safe & Secure',
    description: 'Your payment is held in escrow until your ride is complete. Drivers are verified, and every trip is protected.',
  },
];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  // Show CTA after reaching last slide
  useEffect(() => {
    if (current === slides.length - 1) {
      setShowCTA(true);
    }
  }, [current]);

  const paginate = useCallback(
    (newDirection: number) => {
      const next = current + newDirection;
      if (next >= 0 && next < slides.length) {
        setDirection(newDirection);
        setCurrent(next);
      }
    },
    [current]
  );

  const goToSlide = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const handleDragEnd = useCallback(
    (_: unknown, { offset, velocity }: PanInfo) => {
      const swipe = swipePower(offset.x, velocity.x);

      if (swipe < -swipeConfidenceThreshold) {
        paginate(1);
      } else if (swipe > swipeConfidenceThreshold) {
        paginate(-1);
      }
    },
    [paginate]
  );

  const handleGetStarted = useCallback(() => {
    markOnboardingComplete();
    navigate('/auth');
  }, [navigate]);

  const handleSkip = useCallback(() => {
    markOnboardingComplete();
    navigate('/auth');
  }, [navigate]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    }),
  };

  const currentSlide = slides[current];
  const Illustration = currentSlide.illustration;

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col relative overflow-hidden">
      {/* Skip Button */}
      {current > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 z-10 text-sm font-medium text-text-secondary select-none"
          onClick={handleSkip}
        >
          Skip
        </motion.button>
      )}

      {/* Carousel Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full h-[70dvh] relative flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute w-full flex flex-col items-center px-8"
            >
              {/* Illustration */}
              <motion.div
                custom={0}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <Illustration className="w-44 h-44" />
              </motion.div>

              {/* Headline */}
              <motion.h1
                custom={1}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="text-[32px] font-bold text-text-primary text-center leading-tight tracking-tight mb-4"
              >
                {currentSlide.headline}
              </motion.h1>

              {/* Description */}
              <motion.p
                custom={2}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="text-base text-text-secondary text-center max-w-[300px] leading-relaxed"
              >
                {currentSlide.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page Indicators */}
        <div className="flex items-center gap-2 mb-8">
          {slides.map((slide, index) => (
            <motion.button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className="rounded-full"
              animate={{
                width: index === current ? 24 : 8,
                height: 8,
                backgroundColor: index === current ? '#2c3e50' : '#e1e4e8',
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA Area */}
      <div className="px-5 pb-8 pt-4">
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="flex flex-col items-center"
            >
              <PrimaryButton
                onClick={handleGetStarted}
                icon={
                  <span className="text-lg font-bold">π</span>
                }
              >
                Get Started with Pi
              </PrimaryButton>

              <button
                onClick={() => window.open('https://minepi.com', '_blank')}
                className="mt-3 text-sm font-medium text-info hover:underline"
              >
                What is Pi Network?
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!showCTA && (
          <div className="h-[100px] flex items-center justify-center">
            <span className="text-sm text-text-tertiary">Swipe to continue</span>
          </div>
        )}
      </div>
    </div>
  );
}
