import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { initPiSDK, authenticate, isPiBrowser as checkPiBrowser } from '@/lib/pi-sdk';
import { initFCM, deleteFCMToken } from '@/lib/notifications';

export type UserRole = 'passenger' | 'driver' | null;

export interface User {
  uid: string;
  username: string;
  accessToken: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isPiBrowser: boolean;
  isLoading: boolean;
  error: string | null;
  role: UserRole;
  login: () => Promise<void>;
  logout: () => void;
  setRole: (role: Exclude<UserRole, null>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'taxipro_auth_v2';

function loadStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as User;
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const role = user?.role ?? null;

  // Initialize Pi SDK on mount
  useEffect(() => {
    const piBrowser = checkPiBrowser();
    setIsPiBrowser(piBrowser);
    if (piBrowser) {
      try { initPiSDK(true); } catch (err) { console.warn('Pi SDK init failed:', err); }
    }
  }, []);

  // Persist user
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!checkPiBrowser()) {
        // Demo mode for non-Pi browsers
        const mockUser: User = {
          uid: `demo_${Date.now()}`,
          username: 'demo_user',
          accessToken: 'demo_token',
          role: null,
        };
        setUser(mockUser);
        // Initialize FCM push notifications for demo user
        await initFCM(mockUser.uid);
        return;
      }
      initPiSDK(true);
      const result = await authenticate();
      const loggedInUser: User = {
        uid: result.user.uid,
        username: result.user.username,
        accessToken: result.accessToken,
        role: null,
      };
      setUser(loggedInUser);
      // Initialize FCM push notifications after successful login
      await initFCM(loggedInUser.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Delete FCM token to stop push notifications for this user
    deleteFCMToken();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('pi_incomplete_payment');
  }, []);

  const setRole = useCallback((newRole: Exclude<UserRole, null>) => {
    setUser((prev) => prev ? { ...prev, role: newRole } : null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isPiBrowser, isLoading, error, role, login, logout, setRole, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
