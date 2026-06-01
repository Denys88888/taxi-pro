import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Car, MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarDefault } from '@/components/icons';

type Role = 'passenger' | 'driver' | null;

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user, setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const username = user?.username || 'Pi User';

  const handleSelect = (role: 'passenger' | 'driver') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    setRole(selectedRole);
    localStorage.setItem('taxipro_role', selectedRole);

    if (selectedRole === 'passenger') {
      navigate('/ride');
    } else {
      navigate('/driver');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col px-6 py-8">
      {/* User Welcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center mt-6 mb-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        >
          <AvatarDefault className="w-14 h-14" />
        </motion.div>

        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="text-xl font-semibold text-text-primary mt-4"
        >
          Hi {username}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-base text-text-secondary mt-2 text-center"
        >
          Choose your role
        </motion.p>
      </motion.div>

      {/* Role Cards */}
      <div className="flex-1 flex flex-col gap-4 max-w-[360px] mx-auto w-full">
        {/* Passenger Card */}
        <motion.button
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSelect('passenger')}
          className={`relative w-full rounded-taxipro-lg p-6 flex flex-col items-center text-center transition-all duration-200 cursor-pointer ${
            selectedRole === 'passenger'
              ? 'bg-navy/[0.03] border-2 border-navy shadow-md'
              : 'bg-white border-2 border-transparent shadow-md'
          }`}
        >
          {/* Checkmark overlay when selected */}
          {selectedRole === 'passenger' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-3 right-3"
            >
              <CheckCircle size={22} className="text-navy" />
            </motion.div>
          )}

          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
              selectedRole === 'passenger' ? 'bg-navy/10' : 'bg-lightgray'
            }`}
          >
            <MapPin size={36} className="text-navy" />
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-1">Passenger</h2>
          <p className="text-sm text-text-secondary">Book rides and pay with Pi</p>

          <span
            className={`mt-3 px-4 py-1 rounded-full text-xs font-medium ${
              selectedRole === 'passenger' ? 'bg-navy text-white' : 'bg-lightgray text-text-secondary'
            }`}
          >
            Book a Ride
          </span>
        </motion.button>

        {/* Driver Card */}
        <motion.button
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSelect('driver')}
          className={`relative w-full rounded-taxipro-lg p-6 flex flex-col items-center text-center transition-all duration-200 cursor-pointer ${
            selectedRole === 'driver'
              ? 'bg-emerald/[0.03] border-2 border-emerald shadow-md'
              : 'bg-white border-2 border-transparent shadow-md'
          }`}
        >
          {/* Checkmark overlay when selected */}
          {selectedRole === 'driver' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-3 right-3"
            >
              <CheckCircle size={22} className="text-emerald" />
            </motion.div>
          )}

          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
              selectedRole === 'driver' ? 'bg-emerald/10' : 'bg-lightgray'
            }`}
          >
            <Car size={36} className="text-emerald" />
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-1">Driver</h2>
          <p className="text-sm text-text-secondary">Accept rides and earn Pi</p>

          <span
            className={`mt-3 px-4 py-1 rounded-full text-xs font-medium ${
              selectedRole === 'driver' ? 'bg-emerald text-white' : 'bg-lightgray text-text-secondary'
            }`}
          >
            Start Earning
          </span>
        </motion.button>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="mt-6"
      >
        <motion.button
          whileTap={selectedRole ? { scale: 0.97 } : undefined}
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full h-[52px] rounded-taxipro-md font-medium text-base text-white flex items-center justify-center transition-all duration-200 ${
            selectedRole
              ? selectedRole === 'driver'
                ? 'bg-emerald cursor-pointer'
                : 'bg-navy cursor-pointer'
              : 'bg-midgray cursor-not-allowed opacity-40'
          }`}
        >
          Continue
        </motion.button>
      </motion.div>

      {/* Role switch note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.3 }}
        className="text-center text-xs text-text-tertiary mt-4 flex items-center justify-center gap-1"
      >
        <RefreshCw size={14} />
        You can switch roles anytime from your profile
      </motion.p>
    </div>
  );
}
