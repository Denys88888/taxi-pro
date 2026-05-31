import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, Car, Map, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  icon: typeof MapPin;
  label: string;
  path: string;
}

const passengerNav: NavItem[] = [
  { icon: MapPin, label: 'Ride', path: '/ride' },
  { icon: Clock, label: 'History', path: '/history' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const driverNav: NavItem[] = [
  { icon: Car, label: 'Orders', path: '/driver' },
  { icon: Map, label: 'Map', path: '/driver-nav' },
  { icon: DollarSign, label: 'Earnings', path: '/earnings' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.role) {
    return null;
  }

  const navItems = user.role === 'driver' ? driverNav : passengerNav;
  const activeColor = user.role === 'driver' ? '#27ae60' : '#2c3e50';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-floating border-t border-midgray/50" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="flex items-center justify-around h-16 pb-safe-bottom">
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
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: activeColor }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <Icon
                size={22}
                color={isActive ? activeColor : '#9ca3af'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? activeColor : '#9ca3af' }}
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
