import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { LogoPiRide } from '@/components/icons';

export default function Auth() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    await login();
    navigate('/role-select');
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="flex flex-col items-center"
      >
        <LogoPiRide className="w-28 h-28 mb-6" />

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-2xl font-bold text-text-primary mb-2"
        >
          Welcome to PiRide
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="text-base text-text-secondary text-center mb-10 max-w-[280px]"
        >
          Your ride-hailing app powered by Pi Network. Authenticate to get started.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="w-full max-w-[320px]"
        >
          <PrimaryButton
            onClick={handleLogin}
            isLoading={isLoading}
            icon={<span className="text-lg font-bold">π</span>}
          >
            Authenticate with Pi
          </PrimaryButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xs text-text-tertiary text-center"
        >
          You will be redirected to Pi Browser for authentication
        </motion.p>
      </motion.div>
    </div>
  );
}
