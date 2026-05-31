import { Layout } from '@/components/Layout';
import { CreditCard } from 'lucide-react';

export default function Payment() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mb-4">
          <CreditCard size={32} className="text-emerald" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Payment</h1>
        <p className="text-sm text-text-secondary text-center">
          This page will handle Pi payment processing with escrow.
        </p>
      </div>
    </Layout>
  );
}
