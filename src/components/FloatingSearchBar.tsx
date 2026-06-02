import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe } from 'lucide-react';
import { useNavigate } from 'react-router';
import { t, getLang, setLang, type Lang } from '@/lib/i18n';

export function FloatingSearchBar() {
  const navigate = useNavigate();
  const [lang, setLangState] = useState<Lang>(getLang());

  const toggleLang = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    setLangState(newLang);
    window.location.reload();
  };

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
        <span className="text-text-secondary text-base flex-1">{t('whereTo')}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLang();
          }}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
        >
          <Globe size={16} color="#00C853" />
        </button>
        <span
          className="text-xs font-medium text-primary cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            toggleLang();
          }}
        >
          {lang === 'ru' ? 'RU' : 'EN'}
        </span>
      </button>
    </motion.div>
  );
}
