import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { initPiSDK, authenticate, isPiBrowser as checkPiBrowser } from '@/lib/pi-sdk';
import type { IncompletePayment } from '@/lib/pi-sdk';

export type UserRole = 'passenger' | 'driver' | null;

export interface User {
  uid: string;
  username: string;
  accessToken: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPiBrowser: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  setRole: (role: Exclude<UserRole, null>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'piride_auth';
const ONBOARDING_KEY = 'piride_has_seen_onboarding';

function loadStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as User;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize Pi SDK on mount
  useEffect(() => {
    const piBrowser = checkPiBrowser();
    setIsPiBrowser(piBrowser);

    if (piBrowser) {
      try {
        initPiSDK(true);
      } catch (err) {
        console.warn('Pi SDK init failed:', err);
      }
    }
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const handleIncompletePayment = useCallback((payment: IncompletePayment) => {
    console.log('[Auth] Incomplete payment found:', payment.identifier);
    localStorage.setItem('pi_incomplete_payment', JSON.stringify(payment));
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!checkPiBrowser()) {
        // For development/demo: create a mock user
        const mockUser: User = {
          uid: `demo_${Date.now()}`,
          username: 'demo_user',
          accessToken: 'demo_token',
          role: null,
        };
        setUser(mockUser);
        return;
      }

      // Initialize SDK if needed
      initPiSDK(true);

      const result = await authenticate();

      const newUser: User = {
        uid: result.user.uid,
        username: result.user.username,
        accessToken: result.accessToken,
        role: null, // Role selection comes after auth
      };

      setUser(newUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      console.error('[Auth] Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem('pi_incomplete_payment');
  }, []);

  const setRole = useCallback((role: Exclude<UserRole, null>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, role };
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isPiBrowser,
        isLoading,
        error,
        login,
        logout,
        setRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}
