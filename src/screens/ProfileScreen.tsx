import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/useAppStore';
import { useRouter } from '../store/useRouter';

// Profile + settings: identity, language, theme, driver onboarding, logout.
export function ProfileScreen() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const user = useAppStore((s) => s.user);
  const health = useAppStore((s) => s.health);
  const navigate = useRouter((s) => s.navigate);

  if (!user) return null;

  const roleKey =
    user.role === 'admin' ? 'roleAdmin' : user.role === 'driver' ? 'roleDriver' : 'rolePassenger';

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="surface p-4">
        <h2>{t('profile.title')}</h2>
      </header>

      <div className="space-y-4 p-4">
        <Card className="flex items-center gap-4">
          <Avatar name={user.name} src={user.avatar} size={64} />
          <div className="flex-1">
            <p className="text-lg font-semibold">{user.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone="primary">{t(`profile.${roleKey}`)}</Badge>
              <span className="text-sm opacity-60">
                ⭐ {user.rating.toFixed(1)} ({user.ratingCount})
              </span>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('profile.language')}</span>
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('profile.theme')}</span>
            <ThemeToggle />
          </div>
        </Card>

        {user.role === 'passenger' && (
          <Button variant="outline" fullWidth onClick={() => navigate('register')}>
            🚗 {t('driver.register')}
          </Button>
        )}

        <Button variant="ghost" fullWidth className="!text-danger" onClick={logout}>
          {t('auth.logout')}
        </Button>

        {health && (
          <p className="text-center text-xs opacity-40">
            {health.sandbox ? 'Testnet · Sandbox' : 'Mainnet'} · {health.firebase ? 'Firestore' : 'In-memory'}
          </p>
        )}
      </div>
    </div>
  );
}
