import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, X, Clock } from 'lucide-react';

interface ScheduleRideProps {
  onSchedule: (datetime: Date) => void;
  onClose: () => void;
}

export default function ScheduleRide({ onSchedule, onClose }: ScheduleRideProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const now = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return d;
  });

  const times = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const [hours, minutes] = selectedTime.split(':');
    const date = new Date(selectedDate);
    date.setHours(parseInt(hours), parseInt(minutes));
    onSchedule(date);
    onClose();
  };

  const formatDateLabel = (d: Date) => {
    if (d.toDateString() === now.toDateString()) return 'Today';
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en', { weekday: 'short' });
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 z-[50] bg-white rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-[#F5A623]" />
          Schedule Ride
        </h3>
        <button onClick={onClose} className="p-2"><X size={20} className="text-gray-400" /></button>
      </div>

      {/* Date selection */}
      <div>
        <p className="text-gray-400 text-sm mb-2">Date</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {dates.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${
                  isSelected
                    ? 'bg-[#F5A623] text-white'
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <span className="text-xs capitalize">{formatDateLabel(d)}</span>
                <span className="text-xl font-bold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time selection */}
      <div>
        <p className="text-gray-400 text-sm mb-2">Time</p>
        <div className="grid grid-cols-4 gap-2">
          {times.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={`h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                selectedTime === t
                  ? 'bg-[#F5A623] text-white'
                  : 'bg-gray-50 text-gray-900 border border-gray-200'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <Clock size={12} />
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={!selectedDate || !selectedTime}
        className="w-full h-14 bg-[#F5A623] rounded-xl font-semibold text-white disabled:opacity-40 active:scale-[0.97] transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        Confirm Schedule
      </button>
    </motion.div>
  );
}
