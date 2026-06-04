import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Loader2 } from 'lucide-react';
import { getCurrentPosition, reverseGeocode } from '@/lib/geocoding';

interface Location {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

interface LocateMeButtonProps {
  onLocate: (location: Location) => void;
  className?: string;
}

export function LocateMeButton({ onLocate, className = '' }: LocateMeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      const address = await reverseGeocode(pos.lat, pos.lng);
      onLocate({
        lat: pos.lat,
        lng: pos.lng,
        address: address || `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`,
        name: address?.split(',')[0] || 'Мое местоположение',
      });
    } catch (err) {
      console.warn('[LocateMe] failed:', err);
    } finally {
      setLoading(false);
    }
  }, [onLocate]);

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading}
      className={`absolute bottom-[42%] right-4 z-map-overlay w-12 h-12 rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10 shadow-lg flex items-center justify-center active:scale-90 transition-transform ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 }}
      whileTap={{ scale: 0.9 }}
      title="Мое местоположение"
    >
      {loading ? (
        <Loader2 size={20} color="#00C853" className="animate-spin" />
      ) : (
        <Crosshair size={20} color="#00C853" />
      )}
    </motion.button>
  );
}
