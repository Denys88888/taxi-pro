import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showHandle?: boolean;
  expandable?: boolean;
  collapsedHeight?: string;
  expandedHeight?: string;
  defaultExpanded?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  showHandle = true,
  expandable = true,
  collapsedHeight = '30vh',
  expandedHeight = '85vh',
  defaultExpanded = false,
}: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const dragY = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      const threshold = 80;
      const velocityThreshold = 500;

      if (info.offset.y > threshold || info.velocity.y > velocityThreshold) {
        if (isExpanded && expandable) {
          setIsExpanded(false);
          dragY.set(0);
        } else {
          onClose();
        }
      } else if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
        if (expandable && !isExpanded) {
          setIsExpanded(true);
          dragY.set(0);
        }
      } else {
        dragY.set(0);
      }
    },
    [isExpanded, expandable, onClose, dragY]
  );

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(defaultExpanded);
      dragY.set(0);
    }
  }, [isOpen, defaultExpanded, dragY]);

  const currentHeight = isExpanded ? expandedHeight : collapsedHeight;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-modal-overlay"
            style={{ opacity: backdropOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-piride-xl z-bottom-sheet flex flex-col overflow-hidden"
            style={{
              y: dragY,
              maxWidth: 430,
              margin: '0 auto',
              height: currentHeight,
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag={expandable ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            dragSnapToOrigin
          >
            {/* Drag Handle */}
            {showHandle && (
              <div className="w-full flex justify-center pt-3 pb-2 shrink-0">
                <div
                  className="w-10 h-1 bg-midgray rounded-full"
                  onClick={() => expandable && setIsExpanded(!isExpanded)}
                  style={{ cursor: expandable ? 'pointer' : 'default' }}
                />
              </div>
            )}

            {/* Title */}
            {title && (
              <div className="px-4 pb-3 shrink-0">
                <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
