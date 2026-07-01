import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../hooks/useChat';
import { useRouter } from '../store/useRouter';
import { useAppStore } from '../store/useAppStore';
import { QUICK_TEMPLATE_KEYS } from '../utils/constants';
import { sanitize } from '../utils/helpers';
import { formatTime } from '../utils/formatters';
import { cn } from '../utils/helpers';

// Real-time chat with message bubbles, quick templates, and a 500-char limit.
export function ChatScreen() {
  const { t } = useTranslation();
  const params = useRouter((s) => s.params);
  const back = useRouter((s) => s.back);
  const uid = useAppStore((s) => s.user?.uid ?? '');
  const chatId = params.chatId ?? '';
  const { messages, send } = useChat(chatId);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (): void => {
    if (!text.trim()) return;
    send(text);
    setText('');
  };

  return (
    <div className="flex h-full flex-col">
      <header className="surface flex items-center gap-3 border-b border-black/5 dark:border-white/10 p-4">
        <button onClick={back} aria-label={t('common.back')}>
          ←
        </button>
        <h3>{t('chat.title')}</h3>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm opacity-50">{t('chat.empty')}</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === uid;
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                  mine
                    ? 'rounded-br-sm bg-primary text-white'
                    : 'rounded-bl-sm surface shadow-card'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{sanitize(m.text)}</p>
                <p className={cn('mt-0.5 text-[10px]', mine ? 'text-white/70' : 'opacity-50')}>
                  {formatTime(m.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
        {QUICK_TEMPLATE_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => send(t(k), true)}
            className="whitespace-nowrap rounded-full bg-black/5 dark:bg-white/10 px-3 py-1.5 text-xs"
          >
            {t(k)}
          </button>
        ))}
      </div>

      <div className="surface flex items-center gap-2 border-t border-black/5 dark:border-white/10 p-3">
        <input
          value={text}
          maxLength={500}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t('chat.typeMessage')}
          className="flex-1 rounded-full border border-[#E0E0E0] dark:border-white/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={submit}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white active:scale-95"
          aria-label={t('chat.send')}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
