import { Layout } from '@/components/Layout';
import { MapPin } from 'lucide-react';

export default function Ride() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mb-4">
          <MapPin size={32} className="text-navy" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Passenger Map</h1>
        <p className="text-sm text-text-secondary text-center">
          This page will show the map with ride booking functionality.
        </p>
      </div>
    </Layout>
  );
}
