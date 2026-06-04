import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Home, Clock, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isHidden = location.pathname.startsWith('/search') ||
    location.pathname.startsWith('/book') ||
    location.pathname.startsWith('/payment') ||
    location.pathname.startsWith('/driver-found') ||
    location.pathname.startsWith('/ride') ||
    location.pathname.startsWith('/complete');

  if (isHidden) return null;

  const navItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: Clock, label: t('rides'), path: '/rides' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-floating" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="mx-4 mb-3 bg-bg-elevated/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-lg flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative select-none"
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                color={isActive ? '#00C853' : '#666666'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className="text-[11px] font-medium"
                style={{ color: isActive ? '#00C853' : '#666666' }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
