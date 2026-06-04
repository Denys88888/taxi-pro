import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/lib/i18n';

interface SOSButtonProps {
  visible: boolean;
}

export default function SOSButton({ visible }: SOSButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <button
      onClick={() => navigate('/sos')}
      className="fixed bottom-[100px] right-4 z-40 w-12 h-12 rounded-full bg-[#FF5252] flex items-center justify-center shadow-lg active:scale-90 transition-transform"
      style={{ touchAction: 'manipulation' }}
      aria-label={t('safety')}
    >
      <Shield size={20} color="#FFFFFF" />
    </button>
  );
}
