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

  const fields = [
    { key: 'name',        label: 'Full Name',              type: 'text',     placeholder: 'John Doe' },
    { key: 'email',       label: 'Work Email',             type: 'email',    placeholder: 'john@company.com' },
    { key: 'companyName', label: 'Company / Team Name',    type: 'text',     placeholder: 'Acme Corp' },
    { key: 'password',    label: 'Password',               type: 'password', placeholder: 'Min. 6 characters' },
  ];

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
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: '#F2EDE4',
        backgroundImage: 'radial-gradient(circle, #0A0A0A18 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-md">

        {/* ── Brand ────────────────────────────────────────── */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-3 px-4 py-2 mb-4"
            style={{ background: '#0A0A0A', boxShadow: '4px 4px 0 #C8FF00' }}
          >
            <span className="text-lg font-black uppercase tracking-widest text-white">FixFlow</span>
            <span className="text-xs font-bold px-1.5 py-0.5" style={{ background: '#C8FF00', color: '#0A0A0A' }}>AI</span>
          </div>
          <h1 className="text-4xl font-black uppercase leading-tight" style={{ color: '#0A0A0A' }}>
            CREATE YOUR<br />
            <span style={{ background: '#FF2D78', color: 'white', display: 'inline-block', padding: '0 8px' }}>
              WORKSPACE.
            </span>
          </h1>
          <p className="mt-3 text-sm font-medium" style={{ color: '#666' }}>
            Set up monitoring in seconds. No credit card required.
          </p>
        </div>

        {/* ── Form Card ────────────────────────────────────── */}
        <div
          className="p-5"
          style={{ background: '#EAE4D9', border: '3px solid #0A0A0A', boxShadow: '6px 6px 0 #0A0A0A' }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" type={type} placeholder={placeholder}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
              </div>
            ))}

            <div>
              <label className="label">Organization Category</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Preferences / Focus Areas</label>
              <textarea
                className="input min-h-16"
                placeholder="incident response, scientific analysis, backend reliability"
                value={form.preferences}
                onChange={e => setForm({ ...form, preferences: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? '⏳' : <Zap size={16} />}
              {loading ? 'SETTING UP...' : 'CREATE WORKSPACE & START MONITORING'}
            </button>
          </form>
          <p className="text-center text-sm font-medium mt-4" style={{ color: '#555' }}>
            Already have a workspace?{' '}
            <a href="/login" className="font-bold" style={{ color: '#0050FF', textDecoration: 'underline' }}>
              Sign in →
            </a>
          </p>
        </div>

        {/* ── Feature Pills ─────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Real-time Alerts', bg: '#C8FF00', color: '#0A0A0A' },
            { label: 'AI Postmortems',   bg: '#0050FF', color: 'white' },
            { label: 'Team Collab',      bg: '#FF2D78', color: 'white' },
          ].map(f => (
            <div key={f.label}
              className="text-center px-2 py-2 text-xs font-bold uppercase tracking-wide"
              style={{ background: f.bg, border: '2px solid #0A0A0A', boxShadow: '2px 2px 0 #0A0A0A', color: f.color }}
            >
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
