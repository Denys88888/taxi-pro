import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
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
  Globe,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { t, getLang, setLang, type Lang } from '@/lib/i18n';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout, setRole, isLoading } = useAuth();
  const { driverMode, setDriverMode } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [lang, setLangState] = useState<Lang>(getLang());

  const menuItems = [
    { icon: Wallet, label: t('wallet'), subtitle: 'Pi Network Wallet', action: () => {} },
    { icon: Bell, label: t('notifications'), subtitle: notifications ? t('enabled') : t('disabled'), action: () => setNotifications(!notifications), toggle: notifications },
    { icon: Shield, label: t('security'), subtitle: '2FA, PIN', action: () => {} },
    { icon: HelpCircle, label: t('helpSupport'), subtitle: t('faqContact'), action: () => {} },
  ];

  const handleRoleToggle = () => {
    const newMode = !driverMode;
    setDriverMode(newMode);
    setRole(newMode ? 'driver' : 'passenger');
    if (newMode) navigate('/driver');
  };

  const toggleLang = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    setLangState(newLang);
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
          
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>
        <h1 className="text-text-primary text-lg font-semibold">{t('profile')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* User card */}
        <motion.div
          className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-5 border border-white/5 shadow-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-piPurple/30 flex items-center justify-center border-2 border-primary/20">
              {isAuthenticated ? (
                <span className="text-2xl font-bold text-primary">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
              ) : (
                <User size={28} color="#00C853" />
              )}
            </div>
            <div className="flex-1">
              {isAuthenticated ? (
                <>
                  <h2 className="text-text-primary font-semibold text-lg">{user?.username}</h2>
                  <p className="text-text-tertiary text-xs font-mono mt-0.5 truncate">
                    {user?.uid ? `${user.uid.slice(0, 12)}...` : ''}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-text-primary font-semibold text-lg">{t('guestUser')}</h2>
                  <p className="text-text-tertiary text-xs mt-0.5">{t('notConnected')}</p>
                </>
              )}
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



        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-xs">{t('wallet')}</p>
              <p className="text-text-primary font-mono text-sm mt-1">GAB63...9X2M</p>
            </div>
            <div className="text-right">
              <p className="text-text-tertiary text-xs">{t('total')}</p>
              <p className="text-primary font-bold text-xl font-mono mt-1">124.50</p>
            </div>
          </div>
        </motion.div>

        {/* Driver mode toggle */}
        <motion.div
          className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-4 border border-white/5"



        >
          <button
            className="w-full flex items-center gap-3 text-left"
            onClick={handleRoleToggle}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car size={18} color="#00C853" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary text-sm font-medium">Driver Mode</p>
              <p className="text-text-tertiary text-xs">{driverMode ? t('online') : t('offline')}</p>
            </div>
            {driverMode ? (
              <ToggleRight size={28} color="#00C853" />
            ) : (
              <ToggleLeft size={28} color="#666666" />
            )}
          </button>
        </motion.div>

        {/* Language toggle */}
        <motion.div
          className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl p-4 border border-white/5"



        >
          <button
            className="w-full flex items-center gap-3 text-left"
            onClick={toggleLang}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe size={18} color="#00C853" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary text-sm font-medium">{t('language')}</p>
              <p className="text-text-tertiary text-xs">{lang === 'ru' ? 'Русский' : 'English'}</p>
            </div>
            <span className="text-primary text-sm font-medium">{lang === 'ru' ? 'RU' : 'EN'}</span>
          </button>
        </motion.div>

        {/* Menu items */}
        <div className="mx-4 mt-4 bg-bg-elevated rounded-piride-xl border border-white/5 overflow-hidden">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 p-4 text-left ${
                  idx < menuItems.length - 1 ? 'border-b border-white/5' : ''
                }`}
                onClick={item.action}



                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
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
              </button>
            );
          })}
        </div>

        {/* Login / Logout */}
        {isAuthenticated ? (
          <button
            className="w-full flex items-center gap-3 p-4 mx-4 mt-4 mb-8 text-left"
            onClick={logout}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
              <LogOut size={18} color="#FF5252" />
            </div>
            <span className="text-error text-sm font-medium">{t('logout')}</span>
          </button>
        ) : (
          <button
            className="w-full flex items-center gap-3 p-4 mx-4 mt-4 mb-8 bg-primary rounded-piride-xl text-left active:scale-[0.97] transition-transform"
            onClick={login}
            disabled={isLoading}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <User size={18} color="#FFFFFF" />
              )}
            </div>
            <span className="text-white text-sm font-semibold">
              {isLoading ? t('connecting') : t('loginWithPi')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
