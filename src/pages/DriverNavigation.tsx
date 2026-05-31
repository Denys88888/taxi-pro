import { Layout } from '@/components/Layout';
import { Navigation } from 'lucide-react';

export default function DriverNavigation() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mb-4">
          <Navigation size={32} className="text-emerald" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Navigation</h1>
        <p className="text-sm text-text-secondary text-center">
          This page will show turn-by-turn navigation to passenger and destination.
        </p>
      </div>
    </Layout>
  );
}
