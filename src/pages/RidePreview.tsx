import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Circle,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { MapContainer } from '@/components/MapContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { LatLngTuple } from 'leaflet';

// ─── Types ─────────────────────────────────────────────────────

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

interface PriceBreakdown {
  base: number;
  distancePrice: number;
  subtotal: number;
  commission: number;
  total: number;
  driverGets: number;
}

interface RouteInfo {
  distance: number;
  duration: number;
}

// ─── Animation Config ──────────────────────────────────────────

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const stagger = (index: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut, delay: 0.1 + index * 0.1 },
});

// ─── Main Page ─────────────────────────────────────────────────

export default function RidePreview() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // ── Load data from sessionStorage ──
  useEffect(() => {
    const pickupData = sessionStorage.getItem('taxipro_preview_pickup');
    const destData = sessionStorage.getItem('taxipro_preview_destination');
    const routeData = sessionStorage.getItem('taxipro_preview_route');
    const priceData = sessionStorage.getItem('taxipro_preview_price');

    if (!pickupData || !destData || !routeData || !priceData) {
      navigate('/ride');
      return;
    }

    try {
      setPickup(JSON.parse(pickupData));
      setDestination(JSON.parse(destData));
      setRouteInfo(JSON.parse(routeData));
      setPriceBreakdown(JSON.parse(priceData));
    } catch {
      navigate('/ride');
    }
  }, [navigate]);

  // ── Confirm & Pay ──
  const handleConfirm = useCallback(() => {
    if (!pickup || !destination || !priceBreakdown || !routeInfo) return;

    setIsConfirming(true);

    // Store payment data for payment screen
    const paymentData = {
      amount: priceBreakdown.total,
      memo: `Ride from ${pickup.address.split(',')[0]} to ${destination.address.split(',')[0]}`,
      metadata: {
        rideId: `ride_${Date.now()}`,
        from: { lat: pickup.lat, lng: pickup.lng },
        to: { lat: destination.lat, lng: destination.lng },
        distance: routeInfo.distance,
      },
    };

    sessionStorage.setItem('taxipro_payment_data', JSON.stringify(paymentData));
    sessionStorage.setItem('taxipro_payment_price', JSON.stringify(priceBreakdown));

    // Small delay for button feedback
    setTimeout(() => {
      navigate('/payment');
    }, 400);
  }, [pickup, destination, priceBreakdown, routeInfo, navigate]);

  // ── Go back ──
  const goBack = useCallback(() => {
    navigate('/ride');
  }, [navigate]);

  const pickupTuple = pickup
    ? ([pickup.lat, pickup.lng] as LatLngTuple)
    : undefined;
  const destTuple = destination
    ? ([destination.lat, destination.lng] as LatLngTuple)
    : undefined;

  if (!pickup || !destination || !routeInfo || !priceBreakdown) {
    return null;
  }

  return (
    <div className="mobile-container bg-offwhite relative flex flex-col min-h-[100dvh]">
      {/* ── Header ── */}
      <motion.div
        className="shrink-0 bg-white shadow-sm z-floating flex items-center h-14 px-4 gap-3"
        {...stagger(0)}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          className="shrink-0"
        >
          <ChevronLeft size={24} className="text-text-primary" />
        </motion.button>
        <h1 className="text-lg font-semibold text-text-primary">Confirm Ride</h1>
      </motion.div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        {/* ── Mini Route Map ── */}
        <motion.div
          className="h-[200px] relative mx-4 mt-4 rounded-taxipro-lg overflow-hidden shadow-sm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: easeOut, delay: 0.1 }}
        >
          <div className="absolute inset-0">
            <MapContainer
              center={
                [
                  (pickup.lat + destination.lat) / 2,
                  (pickup.lng + destination.lng) / 2,
                ] as LatLngTuple
              }
              pickupLocation={pickupTuple}
              destinationLocation={destTuple}
              showUserLocation={false}
            />
          </div>
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
        </motion.div>

        {/* ── Addresses Card ── */}
        <motion.div
          className="mx-4 mt-4 bg-white rounded-taxipro-lg shadow-sm p-4"
          {...stagger(2)}
        >
          {/* Pickup Row */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <Circle size={10} fill="#27ae60" color="#27ae60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-emerald mb-0.5">Pickup</p>
              <p className="text-base text-text-primary">
                {pickup.name || pickup.address}
              </p>
            </div>
          </div>

          {/* Connector */}
          <div className="ml-[4px] my-1 border-l-2 border-dashed border-midgray h-6" />

          {/* Destination Row */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <Circle size={10} fill="#e74c3c" color="#e74c3c" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-error mb-0.5">Destination</p>
              <p className="text-base text-text-primary">
                {destination.name || destination.address}
              </p>
            </div>
            {/* Distance badge */}
            <span className="shrink-0 text-xs font-medium bg-navy/10 text-navy px-2 py-1 rounded-taxipro-sm">
              {routeInfo.distance.toFixed(1)} km
            </span>
          </div>
        </motion.div>

        {/* ── Price Breakdown Card ── */}
        <motion.div
          className="mx-4 mt-3 bg-white rounded-taxipro-lg shadow-sm p-5"
          {...stagger(3)}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Price Breakdown
          </h2>

          {/* Base fare */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">Base fare</span>
            <span className="text-sm text-text-secondary">
              π {priceBreakdown.base.toFixed(2)}
            </span>
          </div>

          {/* Distance */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">
              Distance ({routeInfo.distance.toFixed(1)} km × π 1.20/km)
            </span>
            <span className="text-sm text-text-secondary">
              π {priceBreakdown.distancePrice.toFixed(2)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-midgray my-2" />

          {/* Subtotal */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-medium text-text-primary">Subtotal</span>
            <span className="text-base font-medium text-text-primary">
              π {priceBreakdown.subtotal.toFixed(2)}
            </span>
          </div>

          {/* Platform fee */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-text-secondary">Platform fee (2%)</span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => setShowTooltip(!showTooltip)}
                className="relative"
              >
                <Info size={16} className="text-text-tertiary" />
              </motion.button>
            </div>
            <span className="text-sm text-text-secondary">
              π {priceBreakdown.commission.toFixed(2)}
            </span>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <motion.div
              className="mb-3 bg-white shadow-md rounded-taxipro-md p-3 border border-navy/10 relative"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-text-secondary max-w-[200px]">
                This 2% fee helps maintain the Taxi Pro platform and ensure secure
                escrow payments.
              </p>
            </motion.div>
          )}

          {/* Divider */}
          <div className="border-t-2 border-navy/20 my-3" />

          {/* Total */}
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <span className="text-xl font-bold text-text-primary">Total</span>
            <span className="text-2xl font-bold text-navy">
              π {priceBreakdown.total.toFixed(2)}
            </span>
          </motion.div>
        </motion.div>

        {/* ── Payment Method Card ── */}
        <motion.div
          className="mx-4 mt-3 bg-white rounded-taxipro-lg shadow-sm p-4"
          {...stagger(4)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">π</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-text-primary">Pay with Pi</p>
              <p className="text-sm text-text-secondary">π 150.00 available</p>
            </div>
            <Check size={20} className="text-emerald shrink-0" />
          </div>
        </motion.div>

        {/* ── Escrow Info Card ── */}
        <motion.div
          className="mx-4 mt-3 bg-[#f8f9ff] border border-navy/15 rounded-taxipro-lg p-4"
          {...stagger(5)}
        >
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-navy shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                Secure Escrow Payment
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Your payment is held safely until your ride is completed.
              </p>
            </div>
          </div>

          {/* Mini escrow flow */}
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-text-secondary">
            <span>You pay</span>
            <span className="text-navy">→</span>
            <span className="font-medium text-navy">Held</span>
            <span className="text-navy">→</span>
            <span>Driver gets 98%</span>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom CTA ── */}
      <motion.div
        className="shrink-0 fixed bottom-0 left-0 right-0 bg-white shadow-lg z-modal-content p-4 safe-area-bottom"
        style={{ maxWidth: 430, margin: '0 auto' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, delay: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-xs text-text-secondary">Total</p>
            <p className="text-2xl font-bold text-navy">
              π {priceBreakdown.total.toFixed(2)}
            </p>
          </div>
          <div className="flex-1">
            <PrimaryButton
              onClick={handleConfirm}
              isLoading={isConfirming}
              className="bg-gradient-to-r from-navy to-navy-light"
            >
              Confirm & Pay π {priceBreakdown.total.toFixed(2)}
            </PrimaryButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
