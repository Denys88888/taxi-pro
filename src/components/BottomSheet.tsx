import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  snapPoints?: number[]; // percentages
  initialSnap?: number;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [25, 55, 90],
  initialSnap = 0,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const snapToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(snapPoints.length - 1, index));
      setCurrentSnap(clamped);
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    },
    [snapPoints.length, y]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      if (velocity > 300 || offset > 80) {
        if (currentSnap === 0) {
          onClose();
        } else {
          snapToIndex(currentSnap - 1);
        }
      } else if (velocity < -300 || offset < -80) {
        snapToIndex(currentSnap + 1);
      } else {
        snapToIndex(currentSnap);
      }
    },
    [currentSnap, onClose, snapToIndex]
  );

  const heightPercent = snapPoints[currentSnap];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => currentSnap === 0 ? onClose() : snapToIndex(0)}
      />

      {/* Sheet */}
      <motion.div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 bg-bg-elevated rounded-t-piride-xl z-bottom-sheet shadow-sheet border-t border-white/5"
        style={{
          maxWidth: 430,
          margin: '0 auto',
          height: `${heightPercent}vh`,
          y,
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {/* Grabber handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-full no-scrollbar px-4 pb-8">
          {children}
        </div>
      </motion.div>
    </>
  );
}
