import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Car, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleSelect = (role: 'passenger' | 'driver') => {
    setRole(role);
    if (role === 'passenger') {
      navigate('/ride');
    } else {
      navigate('/driver');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col px-6 py-12">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <h1 className="text-2xl font-bold text-text-primary mb-2">Choose Your Role</h1>
        <p className="text-base text-text-secondary">
          How would you like to use PiRide?
        </p>
      </motion.div>

      <div className="flex-1 flex flex-col gap-4">
        <motion.button
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect('passenger')}
          className="w-full bg-white border-2 border-navy rounded-piride-lg p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="w-14 h-14 bg-navy/10 rounded-full flex items-center justify-center shrink-0">
            <MapPin size={28} className="text-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Passenger</h2>
            <p className="text-sm text-text-secondary">Book rides and pay with Pi</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect('driver')}
          className="w-full bg-white border-2 border-emerald rounded-piride-lg p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="w-14 h-14 bg-emerald/10 rounded-full flex items-center justify-center shrink-0">
            <Car size={28} className="text-emerald" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Driver</h2>
            <p className="text-sm text-text-secondary">Accept rides and earn Pi</p>
          </div>
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs text-text-tertiary mt-6"
      >
        You can switch roles anytime from your profile
      </motion.p>
    </div>
  );
}
