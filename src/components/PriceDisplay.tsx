import { useTranslation } from '@/lib/i18n';

interface PriceDisplayProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showFee?: boolean;
}

export function PriceDisplay({ amount, size = 'medium', className = '', showFee = false }: PriceDisplayProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    small: 'text-sm font-medium',
    medium: 'text-xl font-semibold',
    large: 'text-4xl font-bold tracking-tight',
  };

  const formattedAmount = amount.toFixed(2);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className={`${sizeClasses[size]} text-text-primary`}>
        <span className="text-emerald mr-1">π</span>
        {formattedAmount}
      </span>
      {showFee && (
        <span className="text-xs text-text-secondary mt-1">
          {t('commission')}
        </span>
      )}
    </div>
  );
}
