import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      dispatch(setCredentials({ user: data.user, token: data.token, company: data.company }));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'var(--cream)',
        backgroundImage: 'radial-gradient(circle, var(--black)18 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-md">

        {/* ── Brand ────────────────────────────────────────── */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-3 px-4 py-2 mb-6"
            style={{ background: 'var(--black)', boxShadow: '4px 4px 0 var(--accent)' }}
          >
            <span className="text-lg font-black uppercase tracking-widest text-white">FixFlow</span>
            <span
              className="text-xs font-bold px-1.5 py-0.5"
              style={{ background: 'var(--accent)', color: 'var(--black)' }}
            >AI</span>
          </div>
          <h1 className="text-4xl font-black uppercase leading-tight" style={{ color: 'var(--black)' }}>
            SIGN IN<br />
            <span style={{ background: 'var(--accent)', display: 'inline-block', padding: '0 8px' }}>
              TO YOUR WORKSPACE.
            </span>
          </h1>
          <p className="mt-3 text-sm font-medium" style={{ color: '#666' }}>
            Smart Incident Monitoring &amp; Response System
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#888' }}>
            Organization login for admins and invited engineers
          </p>
        </div>

        {/* ── Form Card ────────────────────────────────────── */}
        <div
          className="p-6"
          style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '6px 6px 0 var(--black)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={show ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#888' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? '⏳' : <Zap size={16} />}
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <p className="text-center text-sm font-medium mt-4" style={{ color: '#555' }}>
            No account?{' '}
            <a href="/register" className="font-bold" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>
              Create workspace →
            </a>
          </p>
        </div>

        {/* ── Hint ─────────────────────────────────────────── */}
        <div
          className="mt-4 px-4 py-3 flex items-center gap-2"
          style={{ background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}
        >
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--black)' }}>
            💡 Demo: Register a new account to get started instantly
          </span>
        </div>
      </div>
    </div>
  );
}
