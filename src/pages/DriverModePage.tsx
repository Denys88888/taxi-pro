import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Power,
  Car,
  Star,
  Clock,
  MapPin,
  Navigation,
  X,
  Check,
  TrendingUp,
  Users,
} from 'lucide-react';
import { MapView } from '@/components/MapView';
import { useApp } from '@/contexts/AppContext';


const MOCK_REQUESTS = [
  {
    id: 'req_1',
    pickup: { name: 'Union Square, SF', lat: 37.7879, lng: -122.4075 },
    destination: { name: 'SFO Airport', lat: 37.6213, lng: -122.379 },
    price: 5.50,
    distance: 14.2,
    passenger: 'Alex M.',
    rating: 4.8,
  },
  {
    id: 'req_2',
    pickup: { name: 'Mission District', lat: 37.7594, lng: -122.4214 },
    destination: { name: 'Fisherman\'s Wharf', lat: 37.808, lng: -122.4177 },
    price: 3.80,
    distance: 5.4,
    passenger: 'Lisa K.',
    rating: 4.9,
  },
  {
    id: 'req_3',
    pickup: { name: 'SOMA', lat: 37.7785, lng: -122.4056 },
    destination: { name: 'Golden Gate Park', lat: 37.7694, lng: -122.4862 },
    price: 4.20,
    distance: 6.1,
    passenger: 'John D.',
    rating: 4.7,
  },
];

export default function DriverModePage() {
  const navigate = useNavigate();
  const { driverOnline, setDriverOnline } = useApp();
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [acceptedRequest, setAcceptedRequest] = useState<typeof MOCK_REQUESTS[0] | null>(null);
  const [showEarnings, setShowEarnings] = useState(true);

  const toggleOnline = useCallback(() => {
    setDriverOnline(!driverOnline);
  }, [driverOnline, setDriverOnline]);

  const acceptRequest = useCallback((req: typeof MOCK_REQUESTS[0]) => {
    setAcceptedRequest(req);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  }, []);

  const declineRequest = useCallback((reqId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapView />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-floating safe-area-top">
        <div className="mx-4 mt-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/90 backdrop-blur-xl border border-white/10"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </motion.button>

          {/* Online toggle */}
          <motion.button
            onClick={toggleOnline}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg backdrop-blur-xl ${
              driverOnline
                ? 'bg-primary text-white shadow-glow'
                : 'bg-bg-elevated/90 text-text-secondary border border-white/10'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Power size={16} />
            {driverOnline ? 'Online' : 'Offline'}
          </motion.button>
        </div>
      </div>

      {/* Earnings dashboard */}
      {driverOnline && showEarnings && (
        <motion.div
          className="absolute top-20 left-4 right-4 z-floating"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="bg-bg-elevated/95 backdrop-blur-xl rounded-piride-xl p-4 border border-white/5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-text-primary text-sm font-semibold">Today&apos;s Earnings</h3>
              <button onClick={() => setShowEarnings(false)} className="w-6 h-6 flex items-center justify-center">
                <X size={14} color="#666666" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-primary text-lg font-bold font-mono">24.50</p>
                <p className="text-text-tertiary text-[10px]">Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-text-primary text-lg font-bold">8</p>
                <p className="text-text-tertiary text-[10px]">Trips</p>
              </div>
              <div className="text-center">
                <p className="text-text-primary text-lg font-bold">4.2h</p>
                <p className="text-text-tertiary text-[10px]">Online</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats bar (when online, earnings hidden) */}
      {driverOnline && !showEarnings && (
        <motion.div
          className="absolute top-20 left-4 z-floating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={() => setShowEarnings(true)}
            className="bg-bg-elevated/95 backdrop-blur-xl rounded-full px-4 py-2 border border-white/5 shadow-md flex items-center gap-2"
          >
            <TrendingUp size={14} color="#00C853" />
            <span className="text-primary text-sm font-semibold font-mono">24.50</span>
          </button>
        </motion.div>
      )}

      {/* Bottom sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-piride-xl z-bottom-sheet shadow-sheet border-t border-white/5 max-w-[430px] mx-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-4 pb-8 max-h-[50vh] overflow-y-auto no-scrollbar">
          {!driverOnline ? (
            <div className="text-center py-8">
              <Power size={40} color="#444444" className="mx-auto mb-3" />
              <p className="text-text-secondary text-sm">Go online to see ride requests</p>
            </div>
          ) : acceptedRequest ? (
            /* Active ride navigation */
            <div className="space-y-4">
              <h3 className="text-text-primary font-semibold">Active Ride</h3>
              <div className="bg-bg-surface rounded-piride-md p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <Navigation size={14} color="#00C853" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-tertiary text-[10px]">Pickup</p>
                    <p className="text-text-primary text-sm font-medium truncate">{acceptedRequest.pickup.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} color="#FF5252" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-tertiary text-[10px]">Destination</p>
                    <p className="text-text-primary text-sm font-medium truncate">{acceptedRequest.destination.name}</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-text-secondary text-sm">Fare</span>
                  <span className="text-primary font-bold font-mono">{acceptedRequest.price.toFixed(2)}</span>
                </div>
              </div>
              <motion.button
                className="w-full h-12 bg-primary rounded-piride-lg font-semibold text-white"
                whileTap={{ scale: 0.97 }}
                onClick={() => setAcceptedRequest(null)}
              >
                Complete Ride
              </motion.button>
            </div>
          ) : requests.length > 0 ? (
            /* Incoming requests */
            <div className="space-y-3">
              <h3 className="text-text-primary font-semibold text-sm">Nearby Requests ({requests.length})</h3>
              {requests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  className="bg-bg-surface rounded-piride-md p-4 border border-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users size={14} color="#00C853" />
                      </div>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{req.passenger}</p>
                        <div className="flex items-center gap-1">
                          <Star size={10} fill="#F5A623" color="#F5A623" />
                          <span className="text-text-tertiary text-[10px]">{req.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold font-mono text-sm">{req.price.toFixed(2)}</p>
                      <p className="text-text-tertiary text-[10px] flex items-center gap-0.5">
                        <Clock size={8} /> {req.distance} km
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Navigation size={10} color="#00C853" />
                      <span className="text-text-secondary text-xs truncate">{req.pickup.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={10} color="#FF5252" />
                      <span className="text-text-secondary text-xs truncate">{req.destination.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      className="flex-1 h-10 bg-error/10 rounded-piride-md flex items-center justify-center gap-1"
                      onClick={() => declineRequest(req.id)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={14} color="#FF5252" />
                      <span className="text-error text-sm font-medium">Decline</span>
                    </motion.button>
                    <motion.button
                      className="flex-1 h-10 bg-primary rounded-piride-md flex items-center justify-center gap-1"
                      onClick={() => acceptRequest(req)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check size={14} color="#FFFFFF" />
                      <span className="text-white text-sm font-medium">Accept</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Car size={40} color="#444444" className="mx-auto mb-3" />
              <p className="text-text-secondary text-sm">No requests nearby</p>
              <p className="text-text-tertiary text-xs mt-1">Stay online, requests will appear here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
