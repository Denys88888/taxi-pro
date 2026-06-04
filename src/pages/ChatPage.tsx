import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { wsClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

// ─── Types ───────────────────────────────────────────────────

interface WSMessage {
  id: string;
  chatId: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'passenger' | 'driver';
  time: string;
}

// ─── Helpers ─────────────────────────────────────────────────

/** Determine if a sender identifier belongs to the passenger (local user). */
function isPassengerMessage(sender: string): boolean {
  return sender.startsWith('user_');
}

/** Format an ISO timestamp (or any date string) into HH:mm display time. */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    // Fallback: try parsing as-is, otherwise return the raw string
    return timestamp;
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Convert a server-side WS message into our local ChatMessage format. */
function wsMessageToChatMessage(msg: WSMessage): ChatMessage {
  return {
    id: msg.id,
    text: msg.text,
    sender: isPassengerMessage(msg.sender) ? 'passenger' : 'driver',
    time: formatTime(msg.timestamp),
  };
}

// ─── Component ───────────────────────────────────────────────

export default function ChatPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentRide } = useApp();
  const { user } = useAuth();

  // Derived identifiers
  const chatId = currentRide?.id ? `ride_${currentRide.id}` : null;
  const senderId = user?.uid ? `user_${user.uid}` : 'user_anon';
  const driver = currentRide?.driver;

  // Local state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      text: 'Здравствуйте! Я уже в пути.',
      sender: 'driver',
      time: formatTime(new Date(Date.now() - 60000).toISOString()),
    },
    {
      id: 'welcome-2',
      text: 'Отлично, жду вас!',
      sender: 'passenger',
      time: formatTime(new Date().toISOString()),
    },
  ]);
  const [input, setInput] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep a ref to the latest chatId for use in the WS handler
  const chatIdRef = useRef(chatId);
  chatIdRef.current = chatId;

  // ─── WebSocket Integration ─────────────────────────────────

  const handleNewMessage = useCallback((data: { message: WSMessage }) => {
    const currentChatId = chatIdRef.current;
    if (!currentChatId || !data.message) return;

    // Only process messages belonging to this chat room
    if (data.message.chatId === currentChatId) {
      setMessages((prev) => {
        // Deduplicate: don't add if we already have this message ID
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, wsMessageToChatMessage(data.message)];
      });
    }
  }, []);

  useEffect(() => {
    // Connect WebSocket on mount
    wsClient.connect();

    // Subscribe to incoming messages
    wsClient.on('new_message', handleNewMessage);

    // Listen for connection status changes
    const handleConnected = () => setWsConnected(true);
    const handleDisconnected = () => setWsConnected(false);
    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);

    // Join the chat room after a short delay to allow WS handshake
    const joinTimer = setTimeout(() => {
      if (chatId) {
        wsClient.joinChat(chatId);
      }
      // Update initial connection status
      setWsConnected(wsClient.connected);
    }, 500);

    return () => {
      clearTimeout(joinTimer);
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
      // Note: we intentionally do NOT call wsClient.disconnect()
      // because the singleton may be shared with other pages/features.
    };
  }, [chatId, handleNewMessage]);

  // ─── Auto-scroll ───────────────────────────────────────────

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // ─── Send Message ──────────────────────────────────────────

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !chatId) return;

    const now = new Date().toISOString();
    const localId = `${senderId}_${Date.now()}`;

    // Optimistic local update
    const optimisticMsg: ChatMessage = {
      id: localId,
      text,
      sender: 'passenger',
      time: formatTime(now),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');

    // Send via WebSocket
    wsClient.sendMessage(chatId, senderId, text);
  };

  // ─── Fallback UI ───────────────────────────────────────────

  if (!currentRide || !chatId) {
    return (
      <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface/80 backdrop-blur-xl border-b border-white/5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 active:scale-90 transition-transform"
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={20} color="#FFFFFF"/></div>
          </button>
          <div className="flex-1">
            <p className="text-text-primary font-medium">{t('chat')}</p>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
            <Send size={28} className="text-text-tertiary" />
          </div>
          <p className="text-text-primary font-medium text-center">{t('noActiveRide')}</p>
          <p className="text-text-tertiary text-sm text-center mt-1">
            {t('startRideToChat')}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium active:scale-95 transition-transform"
          >
            {t('goHome')}
          </button>
        </div>
      </div>
    );
  }

  // ─── Main UI ───────────────────────────────────────────────

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:scale-90 transition-transform"
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={20} color="#FFFFFF"/></div>
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">
            {driver?.name?.[0] || 'D'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-medium truncate">
            {driver?.name || t('driver')}
          </p>
          <p className="text-primary text-xs">
            {wsConnected ? t('online') : t('connecting')}
          </p>
        </div>
        {driver?.phone && (
          <a
            href={`tel:${driver.phone}`}
            className="p-2 active:scale-90 transition-transform"
            aria-label={t('call')}
          >
            <Phone size={20} color="#00C853" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${msg.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                msg.sender === 'passenger'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-bg-elevated text-text-primary rounded-bl-md'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.sender === 'passenger'
                    ? 'text-white/60'
                    : 'text-text-tertiary'
                }`}
              >
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-bg-surface/80 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('typeAMessage')}
            className="flex-1 h-11 bg-bg-elevated rounded-full px-4 text-text-primary text-sm placeholder:text-text-tertiary outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
            aria-label={t('send')}
          >
            <Send size={18} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );
}
