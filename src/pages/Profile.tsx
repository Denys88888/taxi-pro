import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Moon,
  Globe,
  HelpCircle,
  FileText,
  Shield,
  ChevronRight,
  LogOut,
  AlertTriangle,
  MapPin,
  Car,
  X,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarDefault, LogoPiRide } from '@/components/icons';
import type { UserRole } from '@/contexts/AuthContext';

type Language = 'en' | 'es' | 'pt' | 'ru';

const languages: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  ru: 'Russian',
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setRole } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState<UserRole>(null);
  const [switchingRole, setSwitchingRole] = useState(false);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showLangPicker, setShowLangPicker] = useState(false);

  const username = user?.username || 'Pi User';
  const uid = user?.uid || 'unknown';
  const role = user?.role;
  const isAdmin = false; // In production, check from user data

  const handleRoleSwitch = useCallback(
    (newRole: Exclude<UserRole, null>) => {
      setSwitchingRole(true);
      setRole(newRole);
      localStorage.setItem('piride_role', newRole);

      setTimeout(() => {
        setSwitchingRole(false);
        setShowRoleConfirm(null);
        navigate(newRole === 'passenger' ? '/ride' : '/driver');
      }, 500);
    },
    [setRole, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Stats
  const totalRides = 12;
  const totalSpent = 98.50;
  const rating = 4.8;
  const daysActive = 15;

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      {/* Header */}
      <div className="shrink-0 bg-white shadow-sm z-floating">
        <div className="flex items-center justify-center h-14">
          <h1 className="text-xl font-semibold text-text-primary">Profile</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay: 0.1 }}
          className="mx-4 mt-4 rounded-piride-xl p-6 shadow-md"
          style={{ background: 'linear-gradient(135deg, #2c3e50, #34495e)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 border-[3px] border-white flex items-center justify-center shrink-0 overflow-hidden">
              <AvatarDefault className="w-14 h-14" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xl font-semibold text-white truncate">@{username}</p>
              <p className="text-sm text-white/70 mt-0.5">Pi Network User</p>
              <p className="text-xs text-white/50 mt-0.5 font-mono">UID: {uid.slice(0, 12)}...</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
              <span className="text-base font-bold text-navy">&#960;</span>
            </div>
          </div>
        </motion.div>

        {/* Role Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mx-4 mt-3 bg-white rounded-piride-lg shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-lg font-semibold text-text-primary">Current Role</h3>
          </div>

          {/* Passenger Row */}
          <button
            onClick={() => {
              if (role !== 'passenger') setShowRoleConfirm('passenger');
            }}
            className={`w-full text-left flex items-center gap-3 p-4 transition-colors cursor-pointer ${
              role === 'passenger' ? 'bg-navy/[0.03]' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-navy" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-text-primary">Passenger</p>
              <p className="text-sm text-text-secondary">Book rides with Pi</p>
            </div>
            {role === 'passenger' ? (
              <div className="w-5 h-5 rounded-full bg-navy flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-midgray" />
            )}
          </button>

          <div className="mx-4 border-t border-midgray" />

          {/* Driver Row */}
          <button
            onClick={() => {
              if (role !== 'driver') setShowRoleConfirm('driver');
            }}
            className={`w-full text-left flex items-center gap-3 p-4 transition-colors cursor-pointer ${
              role === 'driver' ? 'bg-emerald/[0.03]' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
              <Car size={20} className="text-emerald" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-text-primary">Driver</p>
              <p className="text-sm text-text-secondary">Accept rides and earn Pi</p>
            </div>
            {role === 'driver' ? (
              <div className="w-5 h-5 rounded-full bg-emerald flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-midgray" />
            )}
          </button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mx-4 mt-3 bg-white rounded-piride-lg shadow-sm p-4"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="py-2">
              <p className="text-xl font-bold text-navy">{totalRides}</p>
              <p className="text-sm text-text-secondary mt-0.5">Total Rides</p>
            </div>
            <div className="py-2">
              <p className="text-xl font-bold text-navy">
                <span className="text-emerald">&#960;</span> {totalSpent.toFixed(2)}
              </p>
              <p className="text-sm text-text-secondary mt-0.5">Total Spent</p>
            </div>
            <div className="py-2">
              <p className="text-xl font-bold text-navy">{rating}</p>
              <p className="text-sm text-text-secondary mt-0.5">Avg Rating</p>
            </div>
            <div className="py-2">
              <p className="text-xl font-bold text-navy">{daysActive}</p>
              <p className="text-sm text-text-secondary mt-0.5">Days Active</p>
            </div>
          </div>
        </motion.div>

        {/* Settings List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mx-4 mt-3 bg-white rounded-piride-lg shadow-sm overflow-hidden"
        >
          <motion.div variants={listVariants} initial="hidden" animate="show">
            {/* Notifications Toggle */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-4 py-3.5 border-b border-midgray">
              <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
                <Bell size={18} className="text-text-primary" />
              </div>
              <span className="flex-1 text-base text-text-primary">Notifications</span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer relative ${
                  notifications ? 'bg-navy' : 'bg-midgray'
                }`}
              >
                <motion.div
                  animate={{ x: notifications ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-1"
                />
              </button>
            </motion.div>

            {/* Dark Mode Toggle */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-4 py-3.5 border-b border-midgray">
              <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
                <Moon size={18} className="text-text-primary" />
              </div>
              <span className="flex-1 text-base text-text-primary">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer relative ${
                  darkMode ? 'bg-navy' : 'bg-midgray'
                }`}
              >
                <motion.div
                  animate={{ x: darkMode ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-1"
                />
              </button>
            </motion.div>

            {/* Language Selector */}
            <motion.button
              variants={itemVariants}
              onClick={() => setShowLangPicker(true)}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-midgray cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
                <Globe size={18} className="text-text-primary" />
              </div>
              <span className="flex-1 text-base text-text-primary">Language</span>
              <span className="text-sm text-text-secondary mr-1">{languages[language]}</span>
              <ChevronRight size={16} className="text-text-tertiary" />
            </motion.button>

            {/* Help & Support */}
            <motion.button
              variants={itemVariants}
              onClick={() => {}}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-midgray cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
                <HelpCircle size={18} className="text-text-primary" />
              </div>
              <span className="flex-1 text-base text-text-primary">Help &amp; Support</span>
              <ChevronRight size={16} className="text-text-tertiary" />
            </motion.button>

            {/* Terms of Service */}
            <motion.button
              variants={itemVariants}
              onClick={() => {}}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-midgray cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
                <FileText size={18} className="text-text-primary" />
              </div>
              <span className="flex-1 text-base text-text-primary">Terms of Service</span>
              <ChevronRight size={16} className="text-text-tertiary" />
            </motion.button>

            {/* Privacy Policy */}
            <motion.button
              variants={itemVariants}
              onClick={() => {}}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-lightgray flex items-center justify-center shrink-0">
                <Shield size={18} className="text-text-primary" />
              </div>
              <span className="flex-1 text-base text-text-primary">Privacy Policy</span>
              <ChevronRight size={16} className="text-text-tertiary" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Admin Access */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mx-4 mt-3 rounded-piride-lg p-4 border border-navy/[0.15] cursor-pointer"
            style={{ backgroundColor: '#f8f9ff' }}
            onClick={() => navigate('/admin')}
          >
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-navy" />
              <span className="flex-1 text-base font-medium text-text-primary">Admin Panel</span>
              <ChevronRight size={16} className="text-text-tertiary" />
            </div>
            <p className="text-xs text-text-secondary mt-1 ml-8">
              Manage ride payouts and driver commissions
            </p>
          </motion.div>
        )}

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mx-4 mt-3 bg-white rounded-piride-lg shadow-sm p-4"
        >
          {/* Logo row */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <LogoPiRide className="w-8 h-8" />
            <span className="text-base font-medium text-text-primary">PiRide</span>
          </div>
          <p className="text-center text-sm text-text-secondary">Version 1.0.0</p>
          <p className="text-center text-xs text-text-tertiary mt-1">Built for Pi Browser</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs text-info cursor-pointer hover:underline">About Pi</span>
            <span className="text-xs text-text-tertiary">&middot;</span>
            <span className="text-xs text-info cursor-pointer hover:underline">Pi Network</span>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="mx-4 mt-4 mb-8"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-12 rounded-piride-md bg-error/10 text-error font-medium text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={18} />
            Log Out
          </motion.button>
        </motion.div>
      </div>

      {/* Role Switch Confirmation Dialog */}
      <AnimatePresence>
        {showRoleConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-modal-overlay"
              onClick={() => !switchingRole && setShowRoleConfirm(null)}
              style={{ maxWidth: 430, margin: '0 auto' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-piride-xl z-modal-content p-6"
              style={{ maxWidth: 430, margin: '0 auto' }}
            >
              <div className="w-10 h-1 bg-midgray rounded-full mx-auto mb-5" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Switch to {showRoleConfirm === 'passenger' ? 'Passenger' : 'Driver'}?
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                You&apos;ll be taken to the {showRoleConfirm} dashboard.
              </p>

              {switchingRole ? (
                <div className="flex items-center justify-center gap-2 py-3">
                  <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  <span className="text-sm text-text-secondary">Switching...</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRoleConfirm(null)}
                    className="flex-1 h-12 rounded-piride-md border-2 border-navy text-navy font-medium text-base cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleRoleSwitch(showRoleConfirm)}
                    className="flex-1 h-12 rounded-piride-md bg-navy text-white font-medium text-base cursor-pointer"
                  >
                    Switch
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language Picker Bottom Sheet */}
      <AnimatePresence>
        {showLangPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-modal-overlay"
              onClick={() => setShowLangPicker(false)}
              style={{ maxWidth: 430, margin: '0 auto' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-piride-xl z-modal-content p-6"
              style={{ maxWidth: 430, margin: '0 auto' }}
            >
              <div className="w-10 h-1 bg-midgray rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Select Language</h3>
                <button onClick={() => setShowLangPicker(false)} className="p-1 cursor-pointer">
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
              {(Object.entries(languages) as [Language, string][]).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code);
                    setShowLangPicker(false);
                  }}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-piride-md mb-1 cursor-pointer ${
                    language === code ? 'bg-navy/5' : ''
                  }`}
                >
                  <span className={`text-base ${language === code ? 'font-medium text-navy' : 'text-text-primary'}`}>
                    {label}
                  </span>
                  {language === code && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6.5 11.5L13 4.5" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-modal-overlay"
              onClick={() => setShowLogoutConfirm(false)}
              style={{ maxWidth: 430, margin: '0 auto' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-piride-xl z-modal-content p-6"
              style={{ maxWidth: 430, margin: '0 auto' }}
            >
              <div className="w-10 h-1 bg-midgray rounded-full mx-auto mb-5" />
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle size={24} className="text-error" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Log Out?</h3>
                <p className="text-sm text-text-secondary text-center">
                  You will need to authenticate again to use PiRide.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-12 rounded-piride-md border-2 border-navy text-navy font-medium text-base cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="flex-1 h-12 rounded-piride-md bg-error text-white font-medium text-base cursor-pointer"
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
