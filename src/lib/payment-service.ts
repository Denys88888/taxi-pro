// Payment service that connects to Pi Platform API
// For sandbox testing, we use the Pi Platform API directly
// In production, these calls should go to YOUR backend server

const BASE_URL = 'https://api.minepi.com'; // sandbox uses same endpoint
const PI_API_KEY = 'q4wx5fyaqppmnolphgtelucbpe7v3qwlkemqxcnzgmcva8mkbo5mkfdgqfwk4j63';

const HEADERS = {
  'Authorization': `Key ${PI_API_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * Approve a payment (Step 2 in Pi payment flow)
 * Called from onReadyForServerApproval callback
 */
export async function approvePayment(paymentId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: HEADERS,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Payment approval failed: ${error}`);
  }

  console.log('[PaymentService] Payment approved:', paymentId);
}

/**
 * Complete a payment (Step 3 in Pi payment flow)
 * Called from onReadyForServerCompletion callback
 */
export async function completePayment(paymentId: string, txid: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/v2/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ txid }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Payment completion failed: ${error}`);
  }

  console.log('[PaymentService] Payment completed:', paymentId, 'txid:', txid);
}

/**
 * Get payment details
 */
export async function getPayment(paymentId: string): Promise<unknown> {
  const response = await fetch(`${BASE_URL}/v2/payments/${paymentId}`, {
    method: 'GET',
    headers: HEADERS,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Get payment failed: ${error}`);
  }

  return response.json();
}

/**
 * Cancel a payment server-side
 */
export async function cancelServerPayment(paymentId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/v2/payments/${paymentId}/cancel`, {
    method: 'POST',
    headers: HEADERS,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Payment cancel failed: ${error}`);
  }

  console.log('[PaymentService] Payment cancelled:', paymentId);
}
