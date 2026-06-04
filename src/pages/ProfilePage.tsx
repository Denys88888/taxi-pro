import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Wallet,
  Car,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Moon,
  Sun,
  Globe,
  Monitor,
  Check,
  X,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { useTranslation, LANGUAGES, type Lang } from '@/lib/i18n';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setRole } = useAuth();
  const { driverMode, setDriverMode } = useApp();
  const { t, lang, setLang } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const currentLangInfo = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const themeLabel = theme === 'system' ? t('system') : theme === 'dark' ? t('dark') : t('light');
  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

  const menuItems = [
    { icon: Globe, label: t('language'), subtitle: currentLangInfo.nativeName, action: () => setShowLangPicker(true) },
    { icon: Wallet, label: t('wallet'), subtitle: 'Pi Network', action: () => {} },
    { icon: Tag, label: t('promoCode'), subtitle: t('availablePromos'), action: () => setShowPromoModal(true) },
    { icon: Bell, label: t('notifications'), subtitle: notifications ? t('enabled') : t('disabled'), action: () => setNotifications(!notifications), toggle: notifications },
    { icon: Shield, label: t('security'), subtitle: '2FA, PIN', action: () => {} },
    { icon: HelpCircle, label: t('helpSupport'), subtitle: t('faqContact'), action: () => {} },
  ];

  const availablePromos = [
    { code: 'PIRIDE50', description: '50% off your ride', discount: '50%' },
    { code: 'WELCOME', description: 'Free ride up to 3\u03C0', discount: '3\u03C0' },
    { code: 'FRIEND', description: '20% off for referrals', discount: '20%' },
  ];

  const handleRoleToggle = () => {
    const newMode = !driverMode;
    setDriverMode(newMode);
    setRole(newMode ? 'driver' : 'passenger');
    if (newMode) navigate('/driver');
  };

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
        <motion.button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={18} color="#FFFFFF"/></div>
        </motion.button>
        <h1 className="text-text-primary text-lg font-semibold">{t('profile')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* User card */}
        <motion.div
          className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-5 border border-white/5 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-piPurple/30 flex items-center justify-center border-2 border-primary/20">
              <User size={28} color="#00C853" />
            </div>
            <div className="flex-1">
              <h2 className="text-text-primary font-semibold text-lg">{user?.username || t('guestUser')}</h2>
              <p className="text-text-tertiary text-xs font-mono mt-0.5 truncate">
                {user?.uid ? `${user.uid.slice(0, 12)}...` : t('notConnected')}
              </p>
              {user?.accessToken && user.accessToken !== 'demo_token' && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-primary text-[10px] font-medium">{t('piAuthenticated')}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Wallet */}
        <motion.div
          className="mx-4 mt-4 bg-gradient-to-r from-piPurple/20 to-primary/20 rounded-piride-xl p-5 border border-piPurple/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs">{t('wallet')}</p>
              <p className="text-text-primary font-mono text-sm mt-1">GAB63...9X2M</p>
            </div>
            <div className="text-right">
              <p className="text-text-tertiary text-xs">{t('balance')}</p>
              <p className="text-primary font-bold text-xl font-mono mt-1">124.50</p>
            </div>
          </div>
        </motion.div>

        {/* Driver mode toggle */}
        <motion.div
          className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-4 border border-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            className="w-full flex items-center gap-3 text-left"
            onClick={handleRoleToggle}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car size={18} color="#00C853" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary text-sm font-medium">{t('driverMode')}</p>
              <p className="text-text-tertiary text-xs">{driverMode ? t('online') : t('offline')}</p>
            </div>
            {driverMode ? (
              <ToggleRight size={28} color="#00C853" />
            ) : (
              <ToggleLeft size={28} color="#666666" />
            )}
          </button>
        </motion.div>

        {/* Theme toggle */}
        <motion.div
          className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-4 border border-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button className="w-full flex items-center gap-3 text-left" onClick={() => setShowThemePicker(true)}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ThemeIcon size={18} color="#00C853" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary text-sm font-medium">{t('theme')}</p>
              <p className="text-text-tertiary text-xs">{themeLabel}</p>
            </div>
            <ChevronRight size={16} color="#666666" />
          </button>
        </motion.div>

        {/* Menu items */}
        <div className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl border border-white/5 overflow-hidden">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                className={`w-full flex items-center gap-3 p-4 text-left ${
                  idx < menuItems.length - 1 ? 'border-b border-white/5' : ''
                }`}
                onClick={item.action}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center">
                  <Icon size={18} color="#A0A0A0" />
                </div>
                <div className="flex-1">
                  <p className="text-text-primary text-sm font-medium">{item.label}</p>
                  <p className="text-text-tertiary text-xs">{item.subtitle}</p>
                </div>
                {'toggle' in item && item.toggle !== undefined ? (
                  item.toggle ? <ToggleRight size={24} color="#00C853" /> : <ToggleLeft size={24} color="#666666" />
                ) : (
                  <ChevronRight size={16} color="#666666" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Logout */}
        <motion.button
          className="w-full flex items-center gap-3 p-4 mx-4 mt-4 mb-8 text-left"
          onClick={logout}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
            <LogOut size={18} color="#FF5252" />
          </div>
          <span className="text-error text-sm font-medium">{t('logout')}</span>
        </motion.button>
      </div>

      {/* ─── Language Picker Modal ─────────────────────────── */}
      <AnimatePresence>
        {showLangPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-end"
            onClick={() => setShowLangPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-bg-elevated rounded-t-piride-xl p-6 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary text-lg font-semibold">{t('language')}</h3>
                <button onClick={() => setShowLangPicker(false)} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10">
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
              <div className="space-y-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as Lang); setShowLangPicker(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-piride-lg text-left transition-colors ${
                      lang === l.code ? 'bg-primary/10 border border-primary/20' : 'hover:bg-bg-surface'
                    }`}
                  >
                    <span className="text-xl">{l.flag}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${lang === l.code ? 'text-primary' : 'text-text-primary'}`}>{l.nativeName}</p>
                      <p className="text-text-tertiary text-xs">{l.name}</p>
                    </div>
                    {lang === l.code && <Check size={18} color="#00C853" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Theme Picker Modal ───────────────────────────── */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-end"
            onClick={() => setShowThemePicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-bg-elevated rounded-t-piride-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary text-lg font-semibold">{t('theme')}</h3>
                <button onClick={() => setShowThemePicker(false)} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10">
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'light' as const, icon: Sun, label: t('light') },
                  { key: 'dark' as const, icon: Moon, label: t('dark') },
                  { key: 'system' as const, icon: Monitor, label: t('system') },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setTheme(opt.key); setShowThemePicker(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-piride-lg text-left transition-colors ${
                      theme === opt.key ? 'bg-primary/10 border border-primary/20' : 'hover:bg-bg-surface'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center">
                      <opt.icon size={18} color={theme === opt.key ? '#00C853' : '#A0A0A0'} />
                    </div>
                    <span className={`flex-1 text-sm font-medium ${theme === opt.key ? 'text-primary' : 'text-text-primary'}`}>{opt.label}</span>
                    {theme === opt.key && <Check size={18} color="#00C853" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Promo Codes Modal ────────────────────────────── */}
      <AnimatePresence>
        {showPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-end"
            onClick={() => setShowPromoModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-bg-elevated rounded-t-piride-xl p-6 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary text-lg font-semibold">{t('availablePromos')}</h3>
                <button onClick={() => setShowPromoModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10">
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
              <div className="space-y-3">
                {availablePromos.map((promo, idx) => (
                  <motion.div
                    key={promo.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-bg-surface rounded-piride-lg p-4 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Tag size={18} color="#00C853" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-mono font-semibold text-sm">{promo.code}</span>
                          <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-full">-{promo.discount}</span>
                        </div>
                        <p className="text-text-secondary text-xs mt-0.5">{promo.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
