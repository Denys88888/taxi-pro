import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Onboarding1 } from '@/components/icons/Onboarding1';
import { Onboarding2 } from '@/components/icons/Onboarding2';
import { Onboarding3 } from '@/components/icons/Onboarding3';
import { MapPin, Navigation, Car, Wallet, Shield, Radio, Share2, SkipForward, ChevronRight } from 'lucide-react';

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
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.1,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
};

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = [
    {
      id: 'welcome',
      title: t('onboardingWelcomeTitle'),
      subtitle: t('onboardingWelcomeSubtitle'),
      icon: (
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-piPurple flex items-center justify-center shadow-glow-purple">
            <span className="text-6xl font-bold text-white font-mono">&pi;</span>
          </div>
          <motion.div
            className="absolute -inset-4 rounded-full border-2 border-primary/20"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      ),
      bgGradient: 'from-primary/20 via-piPurple/10 to-bg-body',
    },
    {
      id: 'how-to-book',
      title: t('onboardingBookTitle'),
      bullets: [
        { icon: <MapPin className="w-5 h-5 text-primary" />, text: t('onboardingBookBullet1') },
        { icon: <Navigation className="w-5 h-5 text-info" />, text: t('onboardingBookBullet2') },
        { icon: <Car className="w-5 h-5 text-piPurple" />, text: t('onboardingBookBullet3') },
      ],
      icon: (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Onboarding1 className="w-48 h-48 drop-shadow-lg" />
        </motion.div>
      ),
      bgGradient: 'from-primary/10 via-bg-body to-bg-body',
    },
    {
      id: 'pi-payment',
      title: t('onboardingPaymentTitle'),
      subtitle: t('onboardingPaymentSubtitle'),
      icon: (
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Onboarding2 className="w-48 h-48 drop-shadow-lg" />
        </motion.div>
      ),
      icons: [
        { icon: <Wallet className="w-6 h-6 text-primary" />, label: t('wallet') },
        { icon: <Shield className="w-6 h-6 text-info" />, label: t('security') },
      ],
      bgGradient: 'from-piPurple/15 via-bg-body to-bg-body',
    },
    {
      id: 'safety',
      title: t('onboardingSafetyTitle'),
      bullets: [
        { icon: <Radio className="w-5 h-5 text-error" />, text: t('onboardingSafetyBullet1') },
        { icon: <Share2 className="w-5 h-5 text-info" />, text: t('onboardingSafetyBullet2') },
        { icon: <Navigation className="w-5 h-5 text-primary" />, text: t('onboardingSafetyBullet3') },
      ],
      icon: (
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Onboarding3 className="w-48 h-48 drop-shadow-lg" />
        </motion.div>
      ),
      bgGradient: 'from-primary/10 via-bg-body to-bg-body',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('taxipro_onboarded', 'true');
    navigate('/');
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className={`mobile-container w-full h-full min-h-[100dvh] relative overflow-hidden bg-gradient-to-b ${slide.bgGradient} flex flex-col`}>
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-50">
        <motion.button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bg-elevated/60 backdrop-blur-md text-text-secondary text-sm font-medium"
          whileTap={{ scale: 0.95 }}
        >
          <SkipForward className="w-4 h-4" />
          <span>{t('skip')}</span>
        </motion.button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Icon */}
            <motion.div
              custom={0}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              {slide.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              custom={1}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="text-2xl font-bold text-text-primary mb-3"
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <motion.p
                custom={2}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="text-base text-text-secondary leading-relaxed max-w-[280px]"
              >
                {slide.subtitle}
              </motion.p>
            )}

            {/* Bullets */}
            {slide.bullets && (
              <motion.div
                custom={2}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3 mt-4 w-full max-w-[280px]"
              >
                {slide.bullets.map((bullet, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.12, duration: 0.35 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-surface/80 backdrop-blur-sm"
                  >
                    {bullet.icon}
                    <span className="text-sm text-text-primary text-left">{bullet.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Extra icons row for payment slide */}
            {slide.icons && (
              <motion.div
                custom={3}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-6 mt-6"
              >
                {slide.icons.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-full bg-bg-surface/80 flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-xs text-text-secondary">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="pb-10 pt-4 px-8 flex flex-col items-center gap-6">
        {/* Dots indicator */}
        <div className="flex items-center gap-2.5">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-colors duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2.5 bg-text-tertiary/40'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        <motion.button
          onClick={handleNext}
          className={`w-full max-w-[320px] py-4 rounded-full font-semibold text-base flex items-center justify-center gap-2 transition-colors duration-300 ${
            isLastSlide
              ? 'bg-primary text-white shadow-glow'
              : 'bg-bg-elevated text-text-primary border border-border'
          }`}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
        >
          {isLastSlide ? t('getStarted') : t('next')}
          <ChevronRight className={`w-5 h-5 ${isLastSlide ? '' : 'text-text-secondary'}`} />
        </motion.button>
      </div>
    </div>
  );
}
