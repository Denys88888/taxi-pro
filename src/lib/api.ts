// Taxi Pro — API Client
// REST API + WebSocket for real-time features

// Production server on Render
const API_BASE = 'https://taxi-pro-server.onrender.com';
const WS_URL = 'wss://taxi-pro-server.onrender.com';

// ─── REST API ──────────────────────────────────────────────

interface RideData {
  pickup: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  distance: number;
  duration: number;
  price: number;
  tariff: string;
  status: string;
}

export async function createRide(data: RideData) {
  const res = await fetch(`${API_BASE}/api/rides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getRide(rideId: string) {
  const res = await fetch(`${API_BASE}/api/rides/${rideId}`);
  return res.json();
}

export async function updateRide(rideId: string, updates: Partial<RideData>) {
  const res = await fetch(`${API_BASE}/api/rides/${rideId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function getRides() {
  const res = await fetch(`${API_BASE}/api/rides`);
  return res.json();
}

export async function sendMessage(chatId: string, sender: string, text: string) {
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, sender, text }),
  });
  return res.json();
}

export async function getMessages(chatId: string) {
  const res = await fetch(`${API_BASE}/api/messages?chatId=${chatId}`);
  return res.json();
}

// ─── Payment API ────────────────────────────────────────────

export async function serverApprovePayment(paymentId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Payment approval failed');
  return res.json();
}

export async function serverCompletePayment(paymentId: string, txid: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txid }),
  });
  if (!res.ok) throw new Error('Payment completion failed');
  return res.json();
}

export async function createPaymentRecord(data: {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  rideId: string;
}): Promise<{ id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── WebSocket Client ──────────────────────────────────────

type WSMessageHandler = (data: any) => void;

class TaxiProWS {
  private ws: WebSocket | null = null;
  private handlers: Map<string, WSMessageHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;

  get connected() {
    return this._connected;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this._connected = true;
        console.log('[WS] Connected to Taxi Pro server');
        this.emit('connected', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (e) {
          console.error('[WS] Error parsing message:', e);
        }
      };

      this.ws.onclose = () => {
        this._connected = false;
        console.log('[WS] Disconnected, reconnecting in 3s...');
        this.emit('disconnected', {});
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        this._connected = false;
      };
    } catch (e) {
      console.error('[WS] Failed to connect:', e);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this._connected = false;
  }

  send(type: string, data: Record<string, any>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('[WS] Not connected, message dropped:', type);
    }
  }

  on(event: string, handler: WSMessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: WSMessageHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event);
    handlers?.forEach((h) => {
      try { h(data); } catch (e) { console.error(e); }
    });
  }

  // Convenience methods
  joinChat(chatId: string) {
    this.send('join_chat', { chatId });
  }

  sendMessage(chatId: string, sender: string, text: string) {
    this.send('send_message', { chatId, sender, text });
  }

  sendRideStatus(rideId: string, status: string, data?: any) {
    this.send('ride_status', { rideId, status, data });
  }

  sendDriverLocation(rideId: string, lat: number, lng: number) {
    this.send('driver_location', { rideId, lat, lng });
  }
}

export const wsClient = new TaxiProWS();
export default wsClient;
