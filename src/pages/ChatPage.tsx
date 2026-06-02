import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'passenger' | 'driver';
  time: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { currentRide } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Hello! I am on my way.', sender: 'driver', time: '14:30' },
    { id: '2', text: 'Great, see you soon!', sender: 'passenger', time: '14:31' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'passenger',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');

    // Auto-reply from driver after 2 seconds
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Got it! Almost there.',
        sender: 'driver',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 2000);
  };

  const driver = currentRide?.driver;

  return (
    <div className="absolute inset-0 z-modal-content bg-bg-body flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft size={22} color="#FFFFFF" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">{driver?.name?.[0] || 'D'}</span>
        </div>
        <div className="flex-1">
          <p className="text-text-primary font-medium">{driver?.name || 'Driver'}</p>
          <p className="text-primary text-xs">Online</p>
        </div>
        <button className="p-2 active:scale-90 transition-transform">
          <Phone size={20} color="#00C853" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              msg.sender === 'passenger'
                ? 'bg-primary text-white rounded-br-md'
                : 'bg-bg-elevated text-text-primary rounded-bl-md'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === 'passenger' ? 'text-white/60' : 'text-text-tertiary'}`}>
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
          >
            <Send size={18} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );
}
