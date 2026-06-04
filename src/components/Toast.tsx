import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const toastConfig: Record<ToastType, { bg: string; icon: typeof CheckCircle }> = {
  success: { bg: 'bg-emerald', icon: CheckCircle },
  error: { bg: 'bg-error', icon: AlertCircle },
  info: { bg: 'bg-info', icon: Info },
  warning: { bg: 'bg-warning', icon: AlertTriangle },
};

function ToastItemComponent({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className={`${config.bg} text-white rounded-taxipro-md shadow-lg px-4 py-3 flex items-center gap-3 min-w-0`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="text-sm font-medium flex-1 truncate">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-toast flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 430, margin: '0 auto' }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItemComponent toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for using toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastComponent = useCallback(() => (
    <ToastContainer toasts={toasts} onDismiss={removeToast} />
  ), [toasts, removeToast]);

  return { addToast, removeToast, ToastComponent, toasts };
}
