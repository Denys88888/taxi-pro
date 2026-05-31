import { Layout } from '@/components/Layout';
import { LayoutDashboard } from 'lucide-react';

export default function DriverDashboard() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mb-4">
          <LayoutDashboard size={32} className="text-emerald" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Driver Dashboard</h1>
        <p className="text-sm text-text-secondary text-center">
          This page will show available ride requests and map overview.
        </p>
      </div>
    </Layout>
  );
}
