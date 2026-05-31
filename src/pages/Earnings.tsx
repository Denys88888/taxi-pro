import { Layout } from '@/components/Layout';
import { DollarSign } from 'lucide-react';

export default function Earnings() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mb-4">
          <DollarSign size={32} className="text-emerald" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Earnings</h1>
        <p className="text-sm text-text-secondary text-center">
          This page will show your shift earnings and payout breakdown.
        </p>
      </div>
    </Layout>
  );
}
