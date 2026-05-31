import { Layout } from '@/components/Layout';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div className="flex-1 flex flex-col p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mb-4">
            <User size={40} className="text-navy" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            {user?.username || 'User'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Role: {user?.role || 'Not selected'}
          </p>
        </div>

        <div className="flex-1" />

        <PrimaryButton variant="navy" onClick={logout}>
          Log Out
        </PrimaryButton>
      </div>
    </Layout>
  );
}
