import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle2, Shield, Zap } from 'lucide-react';

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', password: '', preferences: '' });

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const { data } = await api.get(`/auth/invite/${token}`);
        setInvite(data.invite);
        setForm(prev => ({ ...prev, name: data.invite.name || '', preferences: (data.invite.preferences || []).join(', ') }));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Invite not found');
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        token,
        name: form.name,
        password: form.password,
        preferences: form.preferences.split(',').map(item => item.trim()).filter(Boolean),
      };
      const { data } = await api.post('/auth/invite/accept', payload);
      dispatch(setCredentials({ user: data.user, token: data.token, company: data.company }));
      toast.success(`Welcome to ${data.company.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F2EDE4', backgroundImage: 'radial-gradient(circle, #0A0A0A18 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 mb-6" style={{ background: '#0A0A0A', boxShadow: '4px 4px 0 #C8FF00' }}>
            <span className="text-lg font-black uppercase tracking-widest text-white">FixFlow</span>
            <span className="text-xs font-bold px-1.5 py-0.5" style={{ background: '#C8FF00', color: '#0A0A0A' }}>INVITE</span>
          </div>
          <h1 className="text-4xl font-black uppercase leading-tight" style={{ color: '#0A0A0A' }}>
            ACCEPT
            <span style={{ background: '#0050FF', color: 'white', display: 'inline-block', padding: '0 8px' }}>
              ORGANIZATION INVITE.
            </span>
          </h1>
          <p className="mt-3 text-sm font-medium" style={{ color: '#666' }}>
            Join your organization workspace after accepting the invitation.
          </p>
        </div>

        <div className="p-6" style={{ background: '#EAE4D9', border: '3px solid #0A0A0A', boxShadow: '6px 6px 0 #0A0A0A' }}>
          {loading ? (
            <p className="text-sm text-slate-400">Loading invite...</p>
          ) : !invite ? (
            <p className="text-sm text-slate-400">Invite unavailable.</p>
          ) : (
            <>
              <div className="mb-4 p-3" style={{ background: '#0A0A0A', color: 'white' }}>
                <p className="text-xs uppercase font-bold mb-1 flex items-center gap-2"><Shield size={12} />{invite.companyId?.name}</p>
                <p className="text-sm">Role: {invite.role} · Category: {invite.category}</p>
                <p className="text-xs text-slate-300 mt-1">Invite expires on {new Date(invite.expiresAt).toLocaleString()}</p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Your Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Create Password</label>
                  <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Preferences / Focus Areas</label>
                  <textarea className="input min-h-24" value={form.preferences} onChange={e => setForm({ ...form, preferences: e.target.value })} placeholder="incident response, scientific analysis, reliability, dashboards" />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 mt-2">
                  {submitting ? '⏳' : <Zap size={16} />}
                  {submitting ? 'JOINING...' : 'ACCEPT INVITE & JOIN'}
                </button>
              </form>
            </>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: '#666' }}>
            <CheckCircle2 size={12} /> Organization member onboarding
          </div>
        </div>
      </div>
    </div>
  );
}