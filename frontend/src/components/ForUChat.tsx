import { ButtonSecondary as DSButtonSecondary, Textarea as DSTextarea } from './ui/DesignSystem';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { isGeminiConfigured, sendForUChatMessage, type ForUChatMessage } from '../lib/gemini';
import Logo from './Logo';

type ForUChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialMessages: ForUChatMessage[] = [
  {
    role: 'model',
    text: [
      'Hola. Estoy aquí. 🌸',
      '',
      'Puedes contarme cómo te sientes o qué tienes en la cabeza.',
      '',
      'No tienes que ordenarlo antes de decirlo.',
    ].join('\n'),
  },
];

export default function ForUChat({ isOpen, onClose }: ForUChatProps) {
  const [messages, setMessages] = useState<ForUChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isThinking, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isThinking) return;

    const nextMessages: ForUChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setDraft('');
    setIsThinking(true);

    const response = await sendForUChatMessage(nextMessages);
    setMessages([...nextMessages, { role: 'model', text: response }]);
    setIsThinking(false);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          className="foru-chat-shell"
          role="dialog"
          aria-modal="true"
          aria-label="Hablar con For U"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <motion.div
            className="foru-chat-panel"
            initial={{ x: 48, opacity: 0, scale: 0.985 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 36, opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="foru-chat-header">
              <div className="foru-chat-avatar">
                <Logo compact />
              </div>
              <div>
                <span>Refugio de conversación</span>
                <h2>For U</h2>
                {!isGeminiConfigured ? <small>La IA necesita una cuenta conectada.</small> : <small>Ayuda para tu siguiente paso.</small>}
              </div>
              <DSButtonSecondary type="button" onClick={onClose} aria-label="Cerrar chat">
                ×
              </DSButtonSecondary>
            </header>

            <div className="foru-chat-messages">
              {messages.map((message, index) => (
                <motion.article
                  key={`${message.role}-${index}-${message.text.slice(0, 12)}`}
                  className={message.role === 'user' ? 'foru-chat-bubble is-user' : 'foru-chat-bubble is-foru'}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  {message.role === 'model' ? <span className="foru-chat-mini-avatar">U</span> : null}
                  <p>{message.text}</p>
                </motion.article>
              ))}

              {isThinking ? (
                <motion.article
                  className="foru-chat-bubble is-foru is-thinking"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <span className="foru-chat-mini-avatar">U</span>
                  <div className="foru-chat-breathing-dots" aria-label="For U está pensando con calma">
                    <i />
                    <i />
                    <i />
                  </div>
                </motion.article>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <form className="foru-chat-input" onSubmit={handleSubmit}>
              <DSTextarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Cuéntame cómo te sientes o qué tienes en mente..."
                rows={2}
              />
              <DSButtonSecondary type="submit" disabled={!draft.trim() || isThinking}>
                Enviar
              </DSButtonSecondary>
            </form>
          </motion.div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
