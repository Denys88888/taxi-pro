import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export function PrimaryButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
}: PrimaryButtonProps) {
  const baseStyles = 'w-full h-[52px] rounded-piride-lg font-semibold text-base flex items-center justify-center gap-2 select-none transition-colors';

  const variantStyles = {
    primary: 'bg-primary text-white shadow-glow active:bg-primary-dark',
    secondary: 'bg-bg-elevated text-text-primary border border-white/10 active:bg-bg-surface',
    danger: 'bg-error text-white active:bg-red-600',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}
