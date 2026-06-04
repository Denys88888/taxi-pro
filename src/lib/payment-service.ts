// Payment service — thin wrappers around server-side payment API
// NOTE: API key moved to server for security

import { serverApprovePayment, serverCompletePayment } from './api';

/**
 * Approve a payment (Step 2 in Pi payment flow)
 * Called from onReadyForServerApproval callback
 * @deprecated Import from '@/lib/api' instead: use serverApprovePayment()
 */
export async function approvePayment(paymentId: string): Promise<void> {
  await serverApprovePayment(paymentId);
}

/**
 * Complete a payment (Step 3 in Pi payment flow)
 * Called from onReadyForServerCompletion callback
 * @deprecated Import from '@/lib/api' instead: use serverCompletePayment()
 */
export async function completePayment(paymentId: string, txid: string): Promise<void> {
  await serverCompletePayment(paymentId, txid);
}
