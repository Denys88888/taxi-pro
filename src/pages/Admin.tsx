import { Layout } from '@/components/Layout';
import { Shield } from 'lucide-react';

export default function Admin() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-purple/10 rounded-full flex items-center justify-center mb-4">
          <Shield size={32} className="text-purple" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Admin Panel</h1>
        <p className="text-sm text-text-secondary text-center">
          This page will show ride payouts management and QR transfers.
        </p>
      </div>
    </Layout>
  );
}
