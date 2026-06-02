import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { initPiSDK, authenticate, isPiBrowser as checkPiBrowser } from '@/lib/pi-sdk';
import { saveUser } from '@/lib/firestore-service';
import { initFirebase } from '@/lib/firebase-config';
import { initNotifications } from '@/lib/notifications';

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

  // Initialize Pi SDK and auto-login on mount
  useEffect(() => {
    const piBrowser = checkPiBrowser();
    setIsPiBrowser(piBrowser);
    if (piBrowser) {
      try { initPiSDK(true); } catch { /* Pi SDK not yet loaded */ }
      // Auto-login if in Pi Browser and not authenticated
      if (!loadStoredUser()) {
        // Delay to let Pi SDK fully load
        const timer = setTimeout(() => {
          login().catch(() => { /* auto-login failed, user can tap button */ });
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Save demo user to Firestore (best effort)
        await saveUser({
          uid: mockUser.uid,
          username: mockUser.username,
          role: 'passenger',
          rating: 5.0,
        });

        // Init Firebase notifications for demo user
        if (initFirebase()) {
          await initNotifications(mockUser.uid);
        }
        return;
      }
      initPiSDK(true);
      const result = await authenticate();
      const newUser: User = {
        uid: result.user.uid,
        username: result.user.username,
        accessToken: result.accessToken,
        role: null,
      };
      setUser(newUser);

      // Save user to Firestore after successful Pi login
      await saveUser({
        uid: result.user.uid,
        username: result.user.username,
        role: 'passenger',
        rating: 5.0,
      });

      // Init Firebase notifications
      if (initFirebase()) {
        await initNotifications(result.user.uid);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
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
