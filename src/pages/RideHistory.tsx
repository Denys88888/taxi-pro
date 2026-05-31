import { Layout } from '@/components/Layout';
import { Clock } from 'lucide-react';

export default function RideHistory() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mb-4">
          <Clock size={32} className="text-navy" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Ride History</h1>
        <p className="text-sm text-text-secondary text-center">
          This page will show your past rides with prices and dates.
        </p>
      </div>
    </Layout>
  );
}
