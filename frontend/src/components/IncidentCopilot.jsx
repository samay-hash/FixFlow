import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Zap } from 'lucide-react';
import clsx from 'clsx';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function IncidentCopilot({ incidentId, incidentStatus }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    { role: 'assistant', content: 'Hi, I am your Groq-powered Incident Copilot. How can I help you resolve this issue?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [history, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = { role: 'user', content: message };
    setHistory(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post(`/incidents/${incidentId}/chat`, {
        message: userMsg.content,
        history: history.filter(h => h.role !== 'system') // send visible history
      });
      
      setHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      toast.error('Failed to get AI response');
      setHistory(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // The chat window (only rendered when open)
  if (isOpen) {
    return (
      <div 
        className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-50 flex flex-col shadow-2xl animate-fade-in"
        style={{ background: 'white', border: '4px solid var(--black)', boxShadow: '8px 8px 0 var(--black)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3" style={{ background: 'var(--black)', color: 'white' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
              <Zap size={16} color="var(--black)" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wider text-sm">Groq Copilot</h3>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Llama-3.3 Powered</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-[var(--cream)]" style={{ backgroundImage: 'radial-gradient(circle, #0A0A0A18 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
          <div className="space-y-4">
            {history.map((msg, i) => (
              <div key={i} className={clsx('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center border-2 border-black bg-white">
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div 
                  className={clsx(
                    'p-3 text-sm font-medium leading-relaxed max-w-[80%]',
                    msg.role === 'user' 
                      ? 'bg-black text-white border-2 border-black rounded-bl-lg rounded-tl-lg rounded-tr-lg' 
                      : 'bg-white text-black border-2 border-black rounded-br-lg rounded-tr-lg rounded-tl-lg'
                  )}
                  style={msg.role === 'user' ? {} : { boxShadow: '3px 3px 0 var(--black)' }}
                >
                  {/* Basic markdown parsing for code blocks */}
                  {msg.content.split('```').map((part, index) => {
                    if (index % 2 === 1) {
                      // It's a code block
                      const codeLines = part.split('\n');
                      const lang = codeLines[0].trim() ? codeLines[0] : 'code';
                      const code = codeLines.slice(1).join('\n');
                      return (
                        <div key={index} className="my-2 p-2 bg-gray-900 text-green-400 font-mono text-xs rounded border-2 border-black">
                          <p className="text-gray-500 text-[10px] mb-1 uppercase">{lang}</p>
                          <pre className="whitespace-pre-wrap">{code}</pre>
                        </div>
                      );
                    }
                    return <span key={index} className="whitespace-pre-wrap">{part}</span>;
                  })}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center border-2 border-black bg-white"><Bot size={12} /></div>
                <div className="p-3 text-sm bg-white border-2 border-black rounded-br-lg rounded-tr-lg rounded-tl-lg" style={{ boxShadow: '3px 3px 0 var(--black)' }}>
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t-4 border-black flex gap-2">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Copilot..." 
            className="flex-1 px-3 py-2 text-sm font-bold border-2 border-black outline-none focus:bg-[var(--cream-2)] transition-colors"
          />
          <button 
            type="submit" 
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-black text-white border-2 border-black hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    );
  }

  // The floating button
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40 transition-transform hover:scale-110 active:scale-95 group"
      style={{ background: '#C8FF00', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}
      title="Ask AI Copilot"
    >
      <Bot size={24} className="text-black group-hover:animate-bounce" />
      {/* Red dot badge to draw attention */}
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
    </button>
  );
}
