import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t, getLang } from '@/lib/i18n';

const STATUS_COLORS: Record<string, string> = {
  completed: '#00C853',
  cancelled: '#FF5252',
  in_progress: '#448AFF',
  driver_found: '#F5A623',
  searching: '#A0A0A0',
};

export default function RidesPage() {
  const navigate = useNavigate();
  const { rideHistory } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group rides by date
  const grouped = rideHistory.reduce<Record<string, typeof rideHistory>>((acc, ride) => {
    const date = new Date(ride.createdAt).toLocaleDateString(getLang() === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(ride);
    return acc;
  }, {});

  // Add mock rides for demo if empty
  const hasRides = rideHistory.length > 0;
  const mockRides = [
    { id: 'mock_1', pickup: { name: 'Union Square' }, destination: { name: 'SFO Airport' }, price: 5.50, status: 'completed' as const, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'mock_2', pickup: { name: 'Mission District' }, destination: { name: 'Fisherman\'s Wharf' }, price: 3.20, status: 'completed' as const, createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'mock_3', pickup: { name: 'Castro' }, destination: { name: 'SOMA' }, price: 2.80, status: 'cancelled' as const, createdAt: new Date(Date.now() - 259200000).toISOString() },
  ];

  const displayRides = hasRides ? Object.entries(grouped) : [];
  const displayMock = !hasRides ? mockRides : [];

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      completed: t('completed'),
      cancelled: t('cancelled'),
      in_progress: t('inProgress'),
      driver_found: t('driverFound'),
      searching: t('searching'),
    };
    return labels[status] || status;
  };

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-bg-elevated/50 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-surface active:bg-bg-elevated"
          
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>
        <h1 className="text-text-primary text-lg font-semibold">{t('rideHistory')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {displayRides.length > 0 ? (
          displayRides.map(([date, rides]) => (
            <div key={date}>
              <h3 className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-3">{date}</h3>
              <div className="space-y-2">
                {rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} isExpanded={expandedId === ride.id} onToggle={() => setExpandedId(expandedId === ride.id ? null : ride.id)} statusLabel={getStatusLabel(ride.status)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-text-tertiary text-xs font-semibold uppercase tracking-wider mb-3">
                {new Date(Date.now() - 86400000).toLocaleDateString(getLang() === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {displayMock.map((ride) => (
                  <RideCard key={ride.id} ride={ride as unknown as typeof rideHistory[0]} isExpanded={expandedId === ride.id} onToggle={() => setExpandedId(expandedId === ride.id ? null : ride.id)} statusLabel={getStatusLabel(ride.status)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {!hasRides && (
          <div className="text-center py-8">
            <p className="text-text-tertiary text-sm">{t('noRides')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RideCard({
  ride,
  isExpanded,
  onToggle,
  statusLabel,
}: {
  ride: { id: string; pickup: { name: string }; destination: { name: string }; price: number; status: string; createdAt: string };
  isExpanded: boolean;
  onToggle: () => void;
  statusLabel: string;
}) {
  const statusColor = STATUS_COLORS[ride.status] || '#A0A0A0';

  return (
    <motion.div
      className="bg-bg-elevated rounded-piride-lg border border-white/5 overflow-hidden"
      layout
    >
      <button
        className="w-full p-4 flex items-center gap-3 text-left"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Circle size={8} fill={statusColor} color={statusColor} />
            <span className="text-text-primary text-sm font-medium truncate">{ride.pickup.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 ml-5">
            <MapPin size={10} color="#FF5252" />
            <span className="text-text-tertiary text-xs truncate">{ride.destination.name}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-primary font-semibold font-mono">{ride.price.toFixed(2)}</p>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
          >
            {statusLabel}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={16} color="#666666" /> : <ChevronDown size={16} color="#666666" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div




            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">ID</span>
                <span className="text-text-secondary font-mono">{ride.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">{t('eta')}</span>
                <span className="text-text-secondary flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
