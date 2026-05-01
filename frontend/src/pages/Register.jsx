import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', companyName: '', category: 'engineering', preferences: '' });
  const [loading, setLoading] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // Dark mode check
  const dark = localStorage.getItem('fixflow-theme') === 'dark';

  const t = {
    bg: dark ? '#0A0A0A' : '#F2EDE4',
    text: dark ? '#F2EDE4' : '#0A0A0A',
    muted: dark ? '#888' : '#666',
    border: dark ? '#333' : '#0A0A0A',
    card: dark ? '#111' : '#EAE4D9',
    inputBg: dark ? '#000' : '#FFF',
    primary: '#0050FF',
    accent: '#FF8C42', // Changed from lime green to light orange
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        preferences: form.preferences.split(',').map(item => item.trim()).filter(Boolean),
      };
      const { data } = await api.post('/auth/register', payload);
      dispatch(setCredentials({ user: data.user, token: data.token, company: data.company }));
      toast.success(`🚀 Workspace "${data.company.name}" created!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const categories = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'science', label: 'Science' },
    { value: 'security', label: 'Security' },
    { value: 'devops', label: 'DevOps' },
    { value: 'operations', label: 'Operations' },
    { value: 'research', label: 'Research' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{
        background: t.bg,
        backgroundImage: `radial-gradient(circle, ${t.border}18 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        color: t.text
      }}
    >
      <div className="w-full max-w-lg">

        {/* ── Brand ────────────────────────────────────────── */}
        <div className="mb-4 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-2"
            style={{ background: dark ? '#222' : '#0A0A0A', boxShadow: `3px 3px 0 ${t.accent}` }}
          >
            <span className="text-base font-black uppercase tracking-widest text-white">FixFlow</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5" style={{ background: t.accent, color: '#0A0A0A' }}>AI</span>
          </div>
          <h1 className="text-3xl font-black uppercase leading-tight">
            CREATE YOUR{' '}
            <span style={{ background: '#FF2D78', color: 'white', display: 'inline-block', padding: '0 6px' }}>
              WORKSPACE
            </span>
          </h1>
        </div>

        {/* ── Form Card ────────────────────────────────────── */}
        <div
          className="p-5 transition-colors duration-300"
          style={{ background: t.card, border: `3px solid ${t.border}`, boxShadow: `6px 6px 0 ${t.border}` }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.text }}>Full Name</label>
                <input 
                  type="text" placeholder="John Doe" required
                  className="w-full px-3 py-2 text-sm border-2 focus:outline-none transition-all"
                  style={{ background: t.inputBg, borderColor: t.border, color: t.text, boxShadow: `2px 2px 0 ${t.border}` }}
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.text }}>Work Email</label>
                <input 
                  type="email" placeholder="john@company.com" required
                  className="w-full px-3 py-2 text-sm border-2 focus:outline-none transition-all"
                  style={{ background: t.inputBg, borderColor: t.border, color: t.text, boxShadow: `2px 2px 0 ${t.border}` }}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} 
                />
              </div>
            </div>

            {/* Row 2: Company & Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.text }}>Company Name</label>
                <input 
                  type="text" placeholder="Acme Corp" required
                  className="w-full px-3 py-2 text-sm border-2 focus:outline-none transition-all"
                  style={{ background: t.inputBg, borderColor: t.border, color: t.text, boxShadow: `2px 2px 0 ${t.border}` }}
                  value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.text }}>Password</label>
                <input 
                  type="password" placeholder="Min 6 chars" required
                  className="w-full px-3 py-2 text-sm border-2 focus:outline-none transition-all"
                  style={{ background: t.inputBg, borderColor: t.border, color: t.text, boxShadow: `2px 2px 0 ${t.border}` }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} 
                />
              </div>
            </div>

            {/* Row 3: Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.text }}>Organization Category</label>
              <select 
                className="w-full px-3 py-2 text-sm border-2 focus:outline-none transition-all cursor-pointer"
                style={{ background: t.inputBg, borderColor: t.border, color: t.text, boxShadow: `2px 2px 0 ${t.border}` }}
                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>

            {/* Row 4: Preferences */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: t.text }}>Preferences / Focus Areas</label>
              <textarea
                className="w-full px-3 py-2 text-sm border-2 focus:outline-none transition-all min-h-12 resize-none"
                style={{ background: t.inputBg, borderColor: t.border, color: t.text, boxShadow: `2px 2px 0 ${t.border}` }}
                placeholder="incident response, backend, scaling..."
                value={form.preferences}
                onChange={e => setForm({ ...form, preferences: e.target.value })}
              />
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-sm font-black uppercase tracking-wide border-2 transition-transform active:translate-y-1 active:translate-x-1"
              style={{ 
                background: t.accent, 
                borderColor: t.border, 
                color: '#0A0A0A',
                boxShadow: `4px 4px 0 ${t.border}` 
              }}
            >
              {loading ? '⏳' : <Zap size={16} />}
              {loading ? 'SETTING UP...' : 'CREATE WORKSPACE'}
            </button>
          </form>

          <p className="text-center text-xs font-medium mt-4" style={{ color: t.muted }}>
            Already have a workspace?{' '}
            <a href="/login" className="font-bold hover:underline" style={{ color: t.primary }}>
              Sign in →
            </a>
          </p>
        </div>

        {/* ── Feature Pills ─────────────────────────────────── */}
        <div className="mt-4 flex justify-center gap-2">
          {[
            { label: 'Real-time Alerts', bg: t.accent, color: '#0A0A0A' },
            { label: 'AI Postmortems',   bg: t.primary, color: 'white' },
            { label: 'Team Collab',      bg: '#FF2D78', color: 'white' },
          ].map(f => (
            <div key={f.label}
              className="text-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide border-2"
              style={{ background: f.bg, borderColor: t.border, boxShadow: `2px 2px 0 ${t.border}`, color: f.color }}
            >
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
