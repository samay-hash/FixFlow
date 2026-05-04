import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, User, X, Sparkles, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { DashboardPanel } from '../dashboard/DashboardPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IncidentCopilotProps {
  incidentId: string;
  variant?: 'floating' | 'panel';
}

const initialMessage: Message = {
  role: 'assistant',
  content: 'Hi, I am your Incident Copilot. How can I assist you in resolving this issue?',
};

const IncidentCopilot = ({ incidentId, variant = 'floating' }: IncidentCopilotProps) => {
  const [isOpen, setIsOpen] = useState(variant === 'panel');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([initialMessage]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [history, isOpen]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: message };
    setHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await apiClient.post(`/incidents/${incidentId}/chat`, {
        message: userMsg.content,
        history,
      });

      setHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      toast.error('Failed to get AI response');
      setHistory((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className={clsx('flex-1 overflow-y-auto px-6 py-4 space-y-6', variant === 'panel' ? 'max-h-[500px]' : 'min-h-[400px]')}>
        {history.map((msg, index) => (
          <div key={`${msg.role}-${index}`} className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={clsx('mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black shadow-sm', msg.role === 'user' ? 'bg-[#07111f] text-white' : 'bg-white ring-1 ring-black/5 text-[#ff4f0a]')}>
              {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
            </div>
            <div className={clsx('flex flex-col gap-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={clsx('max-w-[90%] rounded-[20px] px-4 py-3 text-[13px] leading-relaxed shadow-sm', msg.role === 'user' ? 'rounded-tr-sm bg-[#07111f] text-white' : 'rounded-tl-sm bg-white/50 border border-white/80 text-[#07111f]')}>
                {msg.content.split('```').map((part, partIndex) => {
                  if (partIndex % 2 === 1) {
                    const codeLines = part.split('\n');
                    const lang = codeLines[0].trim() || 'code';
                    const code = codeLines.slice(1).join('\n');
                    return (
                      <div key={partIndex} className="my-2 overflow-x-auto rounded-xl bg-black/5 backdrop-blur-sm p-3 font-mono text-xs text-[#07111f]">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-black/40">{lang}</p>
                        <pre className="whitespace-pre">{code}</pre>
                      </div>
                    );
                  }
                  return <span key={partIndex} className="whitespace-pre-wrap">{part}</span>;
                })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
                <Sparkles size={14} className="text-[#ff4f0a]/50 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 rounded-[20px] rounded-tl-sm bg-white/40 border border-white px-4 py-3">
                <span className="h-1 w-1 animate-bounce rounded-full bg-black/20 [animation-delay:-0.3s]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-black/20 [animation-delay:-0.15s]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-black/20" />
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-white/30">
        <div className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type message..."
            className="w-full rounded-full bg-white/30 border border-white/50 px-6 py-3 pr-12 text-[13px] font-medium text-[#07111f] placeholder:text-black/20 outline-none transition-all focus:bg-white/50 focus:ring-4 focus:ring-black/5"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="absolute right-1.5 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#07111f] text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            <Send size={14} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );

  if (variant === 'panel') {
    return (
      <DashboardPanel title="Copilot" description="Investigation Assistant" className="overflow-hidden border-none bg-white/10 backdrop-blur-md">
        {content}
      </DashboardPanel>
    );
  }

  if (isOpen) {
    return (
      <div 
        className="fixed bottom-24 right-10 z-50 flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out fill-mode-both"
        style={{
          maxHeight: 'min(700px, calc(100vh - 10rem))',
          borderRadius: 32,
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 ring-1 ring-black/5">
              <Sparkles size={18} className="text-[#ff4f0a]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[15px] font-black tracking-tight text-[#07111f]">Copilot</h3>
              <div className="flex items-center gap-1.5">
                 <span className="h-1.5 w-1.5 rounded-full bg-[#ff4f0a] animate-pulse" />
                 <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Active</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-[#07111f]/40 transition hover:bg-black/10 hover:text-[#07111f]">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-10 right-10 z-40 group"
    >
      <div className="relative flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white/30 backdrop-blur-xl border border-white/50 shadow-xl transition-all duration-300 hover:scale-110">
        <Bot size={24} className="text-[#07111f]" strokeWidth={1.5} />
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#ff4f0a]">
           <span className="absolute h-full w-full animate-ping rounded-full bg-[#ff4f0a] opacity-75" />
        </span>
      </div>
    </button>
  );
};

export default IncidentCopilot;
