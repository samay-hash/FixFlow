import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Shield, Building2, User, Mail, Lock, Zap } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      dispatch(setCredentials({ user: data.user, token: data.token, company: data.company }));
      toast.success(`🚀 Workspace "${data.company.name}" created!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'John Doe' },
    { key: 'email', label: 'Work Email', icon: Mail, type: 'email', placeholder: 'john@company.com' },
    { key: 'companyName', label: 'Company / Team Name', icon: Building2, type: 'text', placeholder: 'Acme Corp' },
    { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Min. 6 characters' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at 70% 50%, #1e3a8a22 0%, transparent 60%), radial-gradient(ellipse at 30% 20%, #7c3aed22 0%, transparent 60%), #0a0a0f' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl shadow-blue-500/40 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">Set up your monitoring workspace in seconds</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" type={type} placeholder={placeholder}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <span className="animate-spin">⏳</span> : <Zap size={16} />}
              {loading ? 'Setting up workspace...' : 'Create Workspace & Start Monitoring'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have a workspace?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in →</a>
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Real-time Alerts', 'AI Postmortems', 'Team Collaboration'].map(f => (
            <div key={f} className="text-center p-2 bg-dark-700/50 rounded-lg border border-slate-700/30">
              <p className="text-xs text-slate-400">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
