import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at 30% 50%, #1e3a8a22 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, #7c3aed22 0%, transparent 60%), #0a0a0f' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl shadow-blue-500/40 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SIMRS</h1>
          <p className="text-slate-400 text-sm mt-1">Smart Incident Monitoring & Response</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your workspace</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={show ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <span className="animate-spin">⏳</span> : <Zap size={16} />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            No account?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create workspace →</a>
          </p>
        </div>

        {/* Demo creds hint */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 text-center">
            💡 Demo: Register a new account to get started instantly
          </p>
        </div>
      </div>
    </div>
  );
}
