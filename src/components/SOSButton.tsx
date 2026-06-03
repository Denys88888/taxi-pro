import { useState, useCallback } from 'react';
import { Shield, Phone, X, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SOSButtonProps {
  visible: boolean;
}

export default function SOSButton({ visible }: SOSButtonProps) {
  const [open, setOpen] = useState(false);

  const handleEmergency = useCallback(() => {
    window.location.href = 'tel:112';
  }, []);

  const handleShareTrip = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Моя поездка Taxi Pro',
          text: `Я на поездке. Следи за моей поездкой!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // User cancelled or clipboard failed
    }
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Floating SOS button — regular <button> for mobile tap compatibility */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[100px] right-4 z-40 w-12 h-12 rounded-full bg-[#FF5252] flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        style={{ touchAction: 'manipulation' }}
        aria-label="Экстренная помощь"
      >
        <Shield size={20} color="#FFFFFF" />
      </button>

      {/* SOS Bottom Sheet Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-end"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-bg-elevated rounded-t-piride-xl p-6 space-y-4 border-t border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-semibold">Безопасность</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>

              {/* Emergency call */}
              <button
                onClick={handleEmergency}
                className="w-full h-14 bg-[#FF5252] rounded-piride-lg flex items-center gap-3 px-4 active:scale-[0.97] transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                <Phone size={20} color="#FFFFFF" />
                <span className="text-white font-semibold">Экстренный вызов (112)</span>
              </button>

              {/* Share trip */}
              <button
                onClick={handleShareTrip}
                className="w-full h-14 bg-bg-surface rounded-piride-lg flex items-center gap-3 px-4 border border-white/5 active:scale-[0.97] transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                <Share2 size={20} color="#00C853" />
                <span className="text-text-primary font-medium">Поделиться поездкой</span>
              </button>

              {/* Cancel */}
              <button
                onClick={() => setOpen(false)}
                className="w-full h-14 bg-transparent rounded-piride-lg flex items-center justify-center active:bg-white/5 transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="text-text-secondary font-medium">Отмена</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
