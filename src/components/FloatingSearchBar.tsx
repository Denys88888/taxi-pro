import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/lib/i18n';

export function FloatingSearchBar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <motion.div
      className="absolute top-6 left-4 right-4 z-floating"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
    >
      <button
        onClick={() => navigate('/search')}
        className="w-full h-14 bg-bg-elevated/95 backdrop-blur-xl rounded-full border border-white/10 shadow-lg flex items-center gap-3 px-5 text-left select-none active:scale-[0.98] transition-transform"
      >
        <Search size={18} color="#666666" />
        <span className="text-text-secondary text-base">{t('whereTo')}</span>
      </button>
    </motion.div>
  );
}
