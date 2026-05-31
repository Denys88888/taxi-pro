import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'navy' | 'green';
  isLoading?: boolean;
  icon?: ReactNode;
}

export function PrimaryButton({
  children,
  variant = 'navy',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
  const baseStyles = 'w-full h-[52px] rounded-piride-md font-medium text-base text-white flex items-center justify-center gap-2 transition-colors select-none';
  const variantStyles = variant === 'navy'
    ? 'bg-navy active:bg-navy-light'
    : 'bg-emerald active:bg-emerald-light';
  const disabledStyles = (disabled || isLoading)
    ? 'opacity-40 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}
