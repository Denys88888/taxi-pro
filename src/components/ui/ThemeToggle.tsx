import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import type { Theme } from '../../types';
import { cn } from '../../utils/helpers';

const OPTIONS: { value: Theme; labelKey: string; icon: string }[] = [
  { value: 'light', labelKey: 'profile.themeLight', icon: '☀️' },
  { value: 'dark', labelKey: 'profile.themeDark', icon: '🌙' },
  { value: 'auto', labelKey: 'profile.themeAuto', icon: '🅰️' },
];

// Segmented light / dark / auto control.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <div className="inline-flex rounded-xl bg-black/5 dark:bg-white/10 p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setTheme(o.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
            theme === o.value
              ? 'bg-surface-light dark:bg-surface-dark shadow-sm text-primary'
              : 'text-text-light/60 dark:text-text-dark/60'
          )}
        >
          <span className="mr-1">{o.icon}</span>
          {t(o.labelKey)}
        </button>
      ))}
    </div>
  );
}
