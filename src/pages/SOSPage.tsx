import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Share2,
  Plus,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Heart,
  Lightbulb,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { wsClient } from '@/lib/api';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const STORAGE_KEY = 'taxi_pro_emergency_contacts';

const SAFETY_TIPS = [
  { key: 'stayCalm', icon: Heart },
  { key: 'shareYourRide', icon: Share2 },
  { key: 'knowYourLocation', icon: MapPin },
];

function getEmergencyNumber(): string {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  ];
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const region = tz.split('/')[0];
    if (euCountries.includes(region)) return '112';
  } catch { /* noop */ }
  return '911';
}

function loadContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveContacts(contacts: EmergencyContact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export default function SOSPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>(loadContacts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [locationShared, setLocationShared] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const emergencyNumber = getEmergencyNumber();

  useEffect(() => {
    wsClient.connect();
  }, []);

  const handleSOSConfirm = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleSOSCall = useCallback(() => {
    window.location.href = `tel:${emergencyNumber}`;
    setConfirmOpen(false);

    // Send location to all emergency contacts via WebSocket
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          contacts.forEach((contact) => {
            wsClient.send('emergency_location_shared', {
              contactId: contact.id,
              contactPhone: contact.phone,
              lat: latitude,
              lng: longitude,
              timestamp: new Date().toISOString(),
              message: `EMERGENCY: My location is https://maps.google.com/?q=${latitude},${longitude}`,
            });
          });
        },
        () => { /* location error — still make the call */ }
      );
    }
  }, [emergencyNumber, contacts]);

  const handleAddContact = useCallback(() => {
    if (!newName.trim() || !newPhone.trim()) return;
    const contact: EmergencyContact = {
      id: `ec_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
    };
    const updated = [...contacts, contact];
    setContacts(updated);
    saveContacts(updated);
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
  }, [newName, newPhone, contacts]);

  const handleRemoveContact = useCallback(
    (id: string) => {
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
      saveContacts(updated);
    },
    [contacts]
  );

  const handleCallContact = useCallback((phone: string) => {
    window.location.href = `tel:${phone}`;
  }, []);

  const handleShareLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationShared(true);
      setTimeout(() => setLocationShared(false), 2000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        wsClient.send('location_shared', {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString(),
          mapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
        });
        setLocationShared(true);
        setTimeout(() => setLocationShared(false), 2000);
      },
      () => {
        // Fallback: share without GPS
        wsClient.send('location_shared', {
          timestamp: new Date().toISOString(),
          note: 'Location sharing requested (GPS unavailable)',
        });
        setLocationShared(true);
        setTimeout(() => setLocationShared(false), 2000);
      }
    );
  }, []);

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="safe-area-top flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={18} color="#FFFFFF"/></div>
        </button>
        <h1 className="text-text-primary text-lg font-semibold">{t('safety')}</h1>
        <div className="w-10" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* SOS Button Section */}
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <motion.button
            onClick={handleSOSConfirm}
            className="relative w-48 h-48 rounded-full bg-[#FF5252] flex items-center justify-center shadow-2xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileTap={{ scale: 0.95 }}
            style={{ touchAction: 'manipulation' }}
          >
            {/* Pulse rings */}
            <motion.span
              className="absolute inset-0 rounded-full bg-[#FF5252]/30"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-[#FF5252]/20"
              animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.3,
              }}
            />
            <div className="relative flex flex-col items-center gap-1">
              <AlertTriangle size={40} color="#FFFFFF" />
              <span className="text-white text-3xl font-extrabold tracking-wider">SOS</span>
            </div>
          </motion.button>
          <p className="text-text-secondary text-sm mt-6 text-center">
            {t('tapToCallEmergency')}
          </p>
        </div>

        {/* Share My Location Button */}
        <div className="px-4 mb-6">
          <motion.button
            onClick={handleShareLocation}
            className="w-full h-14 bg-primary/10 border border-primary/30 rounded-piride-lg flex items-center justify-center gap-3 active:scale-[0.97] transition-transform"
            whileTap={{ scale: 0.97 }}
            style={{ touchAction: 'manipulation' }}
          >
            <Share2 size={20} color="#00C853" />
            <span className="text-primary font-semibold">
              {locationShared ? t('locationShared') : t('shareMyLocation')}
            </span>
          </motion.button>
        </div>

        {/* Emergency Contacts Section */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-text-primary text-base font-semibold">{t('emergencyContacts')}</h2>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1 text-primary text-sm font-medium active:opacity-70 transition-opacity"
              style={{ touchAction: 'manipulation' }}
            >
              {showAddForm ? <X size={16} /> : <Plus size={16} />}
              {showAddForm ? t('cancel') : t('addContact')}
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-bg-elevated rounded-piride-lg p-4 border border-white/5 mb-3 space-y-3 overflow-hidden"
              >
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('contactName')}
                  className="w-full h-12 bg-bg-surface rounded-piride-md px-4 text-text-primary placeholder-text-tertiary border border-white/5 focus:border-primary/50 outline-none"
                />
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder={t('phoneNumber')}
                  className="w-full h-12 bg-bg-surface rounded-piride-md px-4 text-text-primary placeholder-text-tertiary border border-white/5 focus:border-primary/50 outline-none"
                />
                <button
                  onClick={handleAddContact}
                  className="w-full h-12 bg-primary rounded-piride-lg text-white font-semibold active:scale-[0.97] transition-transform"
                  style={{ touchAction: 'manipulation' }}
                >
                  {t('save')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <AnimatePresence>
              {contacts.length === 0 && !showAddForm && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-text-tertiary text-sm text-center py-4"
                >
                  {t('noEmergencyContacts')}
                </motion.p>
              )}
              {contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 bg-bg-elevated rounded-piride-lg p-3 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User size={18} color="#00C853" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{contact.name}</p>
                    <p className="text-text-tertiary text-xs">{contact.phone}</p>
                  </div>
                  <button
                    onClick={() => handleCallContact(contact.phone)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 active:bg-primary/20 transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Phone size={16} color="#00C853" />
                  </button>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/5 transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X size={16} color="#FF5252" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Safety Tips Expandable */}
        <div className="px-4 mb-8">
          <button
            onClick={() => setTipsOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-bg-elevated rounded-piride-lg p-4 border border-white/5 active:bg-white/5 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={18} color="#F5A623" />
              <span className="text-text-primary text-sm font-medium">{t('safetyTips')}</span>
            </div>
            {tipsOpen ? (
              <ChevronUp size={18} color="#A0A0A0" />
            ) : (
              <ChevronDown size={18} color="#A0A0A0" />
            )}
          </button>

          <AnimatePresence>
            {tipsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-bg-elevated rounded-b-piride-lg p-4 space-y-3 border-x border-b border-white/5">
                  {SAFETY_TIPS.map(({ key, icon: Icon }) => (
                    <div key={key} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={14} color="#00C853" />
                      </div>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{t(key as any)}</p>
                        <p className="text-text-tertiary text-xs mt-0.5">{t((key + 'Desc') as any)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center px-6"
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-bg-elevated rounded-piride-xl p-6 space-y-4 border border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#FF5252]/10 flex items-center justify-center">
                  <Phone size={28} color="#FF5252" />
                </div>
                <h3 className="text-text-primary text-lg font-semibold text-center">
                  {t('callEmergencyServices')}
                </h3>
                <p className="text-text-secondary text-sm text-center">
                  {t('callEmergencyServices') + ' ' + emergencyNumber}
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSOSCall}
                  className="w-full h-14 bg-[#FF5252] rounded-piride-lg text-white font-semibold active:scale-[0.97] transition-transform"
                  style={{ touchAction: 'manipulation' }}
                >
                  {t('call')} {emergencyNumber}
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="w-full h-14 bg-transparent rounded-piride-lg text-text-secondary font-medium active:bg-white/5 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
