import { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary - Catches JavaScript errors in child components,
 * logs them, and displays a user-friendly fallback UI instead of
 * crashing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console for debugging
    console.error('[ErrorBoundary] Caught an error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env.DEV;
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';

      return (
        <div className="mobile-container bg-bg-body flex items-center justify-center p-6">
          <motion.div
            className="flex flex-col items-center text-center gap-5 max-w-xs"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Error Icon */}
            <motion.div
              className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <AlertTriangle size={40} className="text-destructive" />
            </motion.div>

            {/* Title */}
            <div className="space-y-2">
              <motion.h1
                className="text-text-primary text-xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Что-то пошло не так
              </motion.h1>
              <motion.p
                className="text-text-secondary text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                Приложение столкнулось с ошибкой. Не волнуйтесь, ваши данные в безопасности.
              </motion.p>
            </div>

            {/* Error message (dev mode only) */}
            {isDev && (
              <motion.div
                className="w-full bg-bg-surface border border-border rounded-lg p-3 overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-destructive text-xs font-mono break-all text-left">
                  {errorMessage}
                </p>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              className="flex flex-col gap-3 w-full mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 w-full bg-primary text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
              >
                <RefreshCw size={18} />
                Перезагрузить
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 w-full bg-bg-surface text-text-primary font-medium py-3 rounded-xl border border-border active:scale-95 transition-transform"
              >
                <Home size={18} />
                На главную
              </button>
            </motion.div>
          </motion.div>
        </div>
      );
    }

 
    return this.props.children;
  }
}

export default ErrorBoundary;
