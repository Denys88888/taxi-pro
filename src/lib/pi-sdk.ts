// Pi SDK TypeScript Wrapper for PiRide
// Provides typed access to the Pi Network SDK

declare global {
  interface Window {
    Pi: PiSDK | undefined;
  }
}

// ─── Pi SDK Types ──────────────────────────────────────────────

export interface PiUser {
  uid: string;
  username: string;
}

export interface AuthResult {
  accessToken: string;
  user: PiUser;
}

export interface PaymentDTO {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  uid: string;
}

export interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (paymentId: string, error: Error) => void;
}

export interface PaymentArgs {
  paymentId: string;
  txid: string;
}

export interface IncompletePayment {
  identifier: string;
  transaction?: {
    txid: string;
  };
  status: 'developer_approved' | 'developer_completed' | 'cancelled' | string;
}

export interface PiConfig {
  version: string;
  sandbox?: boolean;
}

interface PiSDK {
  init(config: PiConfig): void;
  authenticate(
    scopes: string[],
    onIncompletePaymentFound: (payment: IncompletePayment) => void
  ): Promise<AuthResult>;
  createPayment(
    paymentData: PaymentDTO,
    callbacks: PaymentCallbacks
  ): Promise<void>;
  cancelPayment(paymentId: string): Promise<void>;
}

// ─── Constants ─────────────────────────────────────────────────

const PI_APP_ID = 'piride';
const SCOPES = ['username', 'payments'];

// ─── Helper Functions ──────────────────────────────────────────

/**
 * Check if running inside Pi Browser
 */
export function isPiBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.Pi;
}

/**
 * Get the Pi SDK instance
 */
function getPiSDK(): PiSDK {
  if (!window.Pi) {
    throw new Error('Pi SDK not loaded. Make sure to include <script src="https://sdk.minepi.com/pi-sdk.js"></script>');
  }
  return window.Pi;
}

// ─── Public API ────────────────────────────────────────────────

/**
 * Initialize the Pi SDK
 */
export function initPiSDK(sandbox = true): void {
  try {
    const pi = getPiSDK();
    pi.init({
      version: '2.0',
      sandbox,
    });
    console.log('[PiSDK] Initialized (sandbox:', sandbox, ')');
  } catch (error) {
    console.error('[PiSDK] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Authenticate the user with Pi Network
 */
export async function authenticate(): Promise<AuthResult> {
  const pi = getPiSDK();

  return new Promise((resolve, reject) => {
    pi.authenticate(SCOPES, (payment: IncompletePayment) => {
      // Handle incomplete payment found during auth
      console.log('[PiSDK] Incomplete payment found:', payment.identifier);
      // Store for later handling
      localStorage.setItem('pi_incomplete_payment', JSON.stringify(payment));
    })
      .then((auth: AuthResult) => {
        console.log('[PiSDK] Authenticated:', auth.user.username);
        resolve(auth);
      })
      .catch((error: Error) => {
        console.error('[PiSDK] Authentication failed:', error);
        reject(error);
      });
  });
}

/**
 * Create a Pi payment
 */
export async function createPayment(
  amount: number,
  memo: string,
  metadata: Record<string, unknown>,
  callbacks: PaymentCallbacks
): Promise<void> {
  const pi = getPiSDK();

  const paymentData: PaymentDTO = {
    amount,
    memo,
    metadata,
    uid: generatePaymentUid(),
  };

  await pi.createPayment(paymentData, callbacks);
}

/**
 * Cancel a pending payment
 */
export async function cancelPayment(paymentId: string): Promise<void> {
  const pi = getPiSDK();
  await pi.cancelPayment(paymentId);
}

// ─── Utility ───────────────────────────────────────────────────

function generatePaymentUid(): string {
  return `piride_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get incomplete payment from localStorage if any
 */
export function getIncompletePayment(): IncompletePayment | null {
  const stored = localStorage.getItem('pi_incomplete_payment');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as IncompletePayment;
  } catch {
    return null;
  }
}

/**
 * Clear incomplete payment from localStorage
 */
export function clearIncompletePayment(): void {
  localStorage.removeItem('pi_incomplete_payment');
}
