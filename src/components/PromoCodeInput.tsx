import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Tag, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// ─── Types ─────────────────────────────────────────────────────

export interface PromoConfig {
  discount: number;
  type: 'percent' | 'fixed';
  maxDiscount: number;
}

export interface PromoCodeInputProps {
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode?: string | null;
  originalPrice: number;
}

// ─── Constants ─────────────────────────────────────────────────

export const PROMO_CODES: Record<string, PromoConfig> = {
  'PIRIDE50': { discount: 0.5, type: 'percent', maxDiscount: 10 },
  'WELCOME': { discount: 3, type: 'fixed', maxDiscount: 3 },
  'FRIEND': { discount: 0.2, type: 'percent', maxDiscount: 5 },
};

// ─── Helpers ───────────────────────────────────────────────────

export function calculatePromoDiscount(code: string, price: number): number {
  const config = PROMO_CODES[code.toUpperCase()];
  if (!config) return 0;

  if (config.type === 'fixed') {
    return Math.min(config.discount, price);
  }

  // percent
  const discount = price * config.discount;
  return Math.min(discount, config.maxDiscount);
}

export function isValidPromoCode(code: string): boolean {
  return code.toUpperCase() in PROMO_CODES;
}

// ─── Component ─────────────────────────────────────────────────

export function PromoCodeInput({
  onApply,
  onRemove,
  appliedCode,
  originalPrice,
}: PromoCodeInputProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(() => {
    const code = inputValue.trim().toUpperCase();
    setError(null);

    if (!code) return;

    if (!isValidPromoCode(code)) {
      setError(t('invalidPromoCode'));
      return;
    }

    const discount = calculatePromoDiscount(code, originalPrice);
    onApply(code, discount);
    setInputValue('');
  }, [inputValue, originalPrice, onApply, t]);

  const handleRemove = useCallback(() => {
    setError(null);
    setInputValue('');
    onRemove();
  }, [onRemove]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleApply();
    },
    [handleApply]
  );

  return (
    <div className="bg-bg-surface rounded-piride-md border border-white/5 overflow-hidden">
      {/* Header — tap to expand */}
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Tag size={14} color="#00C853" />
        </div>
        <div className="flex-1">
          {appliedCode ? (
            <div className="flex items-center gap-2">
              <span className="text-primary text-sm font-medium">
                {appliedCode}
              </span>
              <span className="text-text-tertiary text-xs">
                -
                {calculatePromoDiscount(appliedCode, originalPrice).toFixed(2)}
              </span>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">{t('promoCode')}</p>
          )}
        </div>
        <AnimatePresence mode="wait">
          {appliedCode ? (
            <motion.button
              key="remove"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-6 h-6 rounded-full bg-error/10 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X size={12} color="#FF5252" />
            </motion.button>
          ) : (
            <motion.div
              key="chevron"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: isExpanded ? 180 : 0 }}
              exit={{ opacity: 0 }}
            >
              <ChevronDown size={16} color="#666666" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Expanded input area */}
      <AnimatePresence>
        {isExpanded && !appliedCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t('enterPromoCode')}
                  className="flex-1 bg-bg-elevated rounded-piride-md px-3 py-2 text-text-primary text-sm placeholder:text-text-tertiary border border-white/5 focus:border-primary/40 focus:outline-none transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApply}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-primary rounded-piride-md text-bg-body text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('apply')}
                </motion.button>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-error text-xs flex items-center gap-1"
                  >
                    <X size={12} />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
