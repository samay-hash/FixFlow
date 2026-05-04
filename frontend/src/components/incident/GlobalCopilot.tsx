import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, User, X, Sparkles, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../store/hooks';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

const WELCOME: Message = {
  role: 'assistant',
  ts: new Date(),
  content:
    "Hi! I'm **FixFlow Copilot**. I have access to your system logs and incident history. How can I assist you today?",
};

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function RichText({ text }: { text: string }) {
  const blocks = text.split('```');
  return (
    <>
      {blocks.map((block, bi) => {
        if (bi % 2 === 1) {
          const lines = block.split('\n');
          const lang = lines[0].trim() || 'code';
          const code = lines.slice(1).join('\n').trim();
          return (
            <div
              key={bi}
              className="my-3 overflow-x-auto rounded-xl bg-white/40 backdrop-blur-md p-4 font-mono text-[12px] leading-5 text-[#07111f] ring-1 ring-black/5"
            >
              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-black/40">
                {lang}
              </p>
              <pre className="whitespace-pre">{code}</pre>
            </div>
          );
        }
        const parts = block.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <span key={bi} className="whitespace-pre-wrap">
            {parts.map((part, pi) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pi} className="font-bold">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code
                    key={pi}
                    className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[11px] font-bold text-black/70"
                  >
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return part;
            })}
          </span>
        );
      })}
    </>
  );
}

export function GlobalCopilot() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [incidentTitle, setIncidentTitle] = useState<string>('');
  const [incidentSeverity, setIncidentSeverity] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .get('/incidents?status=open&limit=1')
      .then(({ data }) => {
        const first = data.incidents?.[0];
        if (first) {
          setIncidentId(first._id ?? first.id);
          setIncidentTitle(first.title);
          setIncidentSeverity(first.severity ?? '');
        } else {
          return apiClient.get('/incidents?limit=1').then(({ data: d2 }) => {
            const fb = d2.incidents?.[0];
            if (fb) {
              setIncidentId(fb._id ?? fb.id);
              setIncidentTitle(fb.title);
              setIncidentSeverity(fb.severity ?? '');
            }
          });
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [history, isOpen]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    if (!incidentId) {
      toast.error('No incident found.');
      return;
    }

    const userMsg: Message = { role: 'user', content: trimmed, ts: new Date() };
    setHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await apiClient.post(`/incidents/${incidentId}/chat`, {
        message: trimmed,
        history: history.map(({ role, content }) => ({ role, content })),
      });
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, ts: new Date() },
      ]);
    } catch {
      toast.error('Copilot unreachable.');
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error reaching backend. Please try again.',
          ts: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as FormEvent);
    }
  };

  const severityColor: Record<string, string> = {
    critical: 'bg-rose-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-400',
    low: 'bg-slate-400',
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Floating Trigger Button ────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="global-copilot-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-10 right-10 z-40"
          >
            <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/20 backdrop-blur-2xl ring-1 ring-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <Sparkles size={28} className="text-[#07111f]" strokeWidth={1.5} />
              
              {/* Reference Red Dot Badge */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4f0a] ring-4 ring-white/20 shadow-lg">
                 <span className="absolute h-full w-full animate-ping rounded-full bg-[#ff4f0a] opacity-75" />
                 <span className="relative h-2 w-2 rounded-full bg-white shadow-sm" />
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Pure Glass Chat Window ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="global-copilot-window"
            initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.9, rotateX: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed bottom-10 right-10 z-50 flex w-[440px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden"
            style={{
              maxHeight: 'min(760px, calc(100vh - 8rem))',
              borderRadius: 40,
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 32px 128px -12px rgba(0, 0, 0, 0.1)',
              perspective: '1000px',
            }}
          >
            {/* Header */}
            <div className="shrink-0 px-8 py-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 ring-1 ring-white/50 shadow-inner">
                    <Sparkles size={24} className="text-[#07111f]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-black tracking-tight text-[#07111f]">Copilot</h3>
                      <span className="h-2 w-2 rounded-full bg-[#ff4f0a] animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black tracking-wider text-black/30 uppercase">
                      Investigation Assistant
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-[#07111f]/40 transition hover:bg-black/10 hover:text-[#07111f] hover:rotate-90 duration-300"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              {/* Context Strip */}
              {incidentTitle && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/20 px-5 py-3 ring-1 ring-white/30">
                  <span
                    className={clsx(
                      'h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]',
                      severityColor[incidentSeverity] ?? 'bg-slate-400',
                    )}
                  />
                  <p className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#07111f]/60">
                    {incidentTitle}
                  </p>
                  {incidentId && (
                    <Link
                      to={`/incidents/${incidentId}`}
                      onClick={() => setIsOpen(false)}
                      className="text-[#07111f]/30 transition hover:text-[#ff4f0a]"
                    >
                      <ExternalLink size={16} strokeWidth={1.5} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-2">
              <div className="space-y-8">
                {history.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={clsx('flex gap-4', isUser ? 'flex-row-reverse' : 'flex-row')}
                    >
                      <div
                        className={clsx(
                          'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-black shadow-sm',
                          isUser
                            ? 'bg-[#07111f] text-white'
                            : 'bg-white/40 ring-1 ring-white/50 text-[#07111f]',
                        )}
                      >
                        {isUser
                          ? (user?.name?.[0] ?? <User size={16} />)
                          : <Sparkles size={16} strokeWidth={2} />}
                      </div>

                      <div className={clsx('flex max-w-[85%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
                        <div
                          className={clsx(
                            'rounded-[28px] px-5 py-4 text-[14px] leading-relaxed shadow-[0_8px_20px_rgba(0,0,0,0.03)]',
                            isUser
                              ? 'rounded-tr-sm bg-[#07111f] font-medium text-white'
                              : 'rounded-tl-sm bg-white/30 border border-white/40 font-medium text-[#07111f]',
                          )}
                        >
                          <RichText text={msg.content} />
                        </div>
                        <span className="px-2 text-[10px] font-bold text-black/20 uppercase tracking-widest">
                          {formatTime(msg.ts)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {loading && (
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/30 ring-1 ring-white/50">
                      <Sparkles size={16} className="text-[#07111f]/40 animate-pulse" strokeWidth={2} />
                    </div>
                    <div className="flex items-center gap-2 rounded-[28px] rounded-tl-sm bg-white/20 border border-white/30 px-6 py-5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/10 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/10 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/10" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-8" />
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 px-8 pb-10 pt-4">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={incidentId ? 'Ask anything...' : 'Locked'}
                  disabled={!incidentId || loading}
                  className="w-full rounded-full bg-white/20 border border-white/30 px-7 py-5 pr-16 text-[15px] font-medium text-[#07111f] placeholder:text-black/20 outline-none transition-all focus:bg-white/40 focus:ring-4 focus:ring-white/20 disabled:opacity-30 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim() || !incidentId}
                  className="absolute right-2.5 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#07111f] text-white shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-20"
                >
                  <Send size={20} strokeWidth={2} />
                </button>
              </form>
              <div className="mt-5 text-center">
                   <p className="text-[10px] font-black tracking-[0.2em] uppercase text-black/15">
                     Secure Intelligence Loop
                   </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GlobalCopilot;
