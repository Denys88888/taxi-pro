// Payment service that connects to our backend
// For sandbox testing, we use a mock backend that validates payments

const API_BASE = '/api'; // Will be proxied to backend in production
const PI_API_KEY = 'q4wx5fyaqppmnolphgtelucbpe7v3qwlkemqxcnzgmcva8mkbo5mkfdgqfwk4j63';

// For frontend-only demo (no backend deployed yet):
// We simulate the backend approval using the Pi Platform API directly
// In production, these calls should go to YOUR backend server

export async function approvePayment(paymentId: string): Promise<void> {
  // Call Pi Platform API to approve payment
  const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Payment approval failed: ${error}`);
  }
}

export async function completePayment(paymentId: string, txid: string): Promise<void> {
  const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txid }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Payment completion failed: ${error}`);
  }
}
