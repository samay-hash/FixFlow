import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { CheckCircle2, Shield, Zap } from 'lucide-react';

interface InviteData {
  companyId: {
    name: string;
  };
  name?: string;
  role: string;
  category: string;
  preferences: string[];
  expiresAt: string;
}

const AcceptInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', password: '', preferences: '' });

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const { data } = await apiClient.get(`/auth/invite/${token}`);
        setInvite(data.invite);
        setForm(prev => ({ 
          ...prev, 
          name: data.invite.name || '', 
          preferences: (data.invite.preferences || []).join(', ') 
        }));
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Invite not found');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadInvite();
    }
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        token,
        name: form.name,
        password: form.password,
        preferences: form.preferences.split(',').map(item => item.trim()).filter(Boolean),
      };
      const { data } = await apiClient.post('/auth/invite/accept', payload);
      dispatch(setAuth({ user: data.user, token: data.token, company: data.company }));
      toast.success(`Welcome to ${data.company.name}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)', backgroundImage: 'radial-gradient(circle, var(--border-subtle) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 mb-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-sm">
            <span className="text-lg font-black uppercase tracking-widest text-[var(--text-primary)]">FixFlow</span>
            <span className="text-xs font-bold px-1.5 py-0.5 bg-[var(--accent-primary)] text-white">INVITE</span>
          </div>
          <h1 className="text-4xl font-black uppercase leading-tight text-[var(--text-primary)]">
            ACCEPT
            <span className="bg-[var(--accent-primary)] text-white inline-block px-2 ml-2">
              ORGANIZATION INVITE.
            </span>
          </h1>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
            Join your organization workspace after accepting the invitation.
          </p>
        </div>

        <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
               <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !invite ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">Invite unavailable or expired.</p>
          ) : (
            <>
              <div className="mb-6 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg">
                <p className="text-xs uppercase font-bold mb-2 flex items-center gap-2 text-[var(--accent-primary)]">
                  <Shield size={14} /> {invite.companyId?.name}
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-[var(--text-primary)]">Role: {invite.role} · Category: {invite.category}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">Expires on {new Date(invite.expiresAt).toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">Your Name</label>
                  <input 
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-primary)] transition-colors" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">Create Password</label>
                  <input 
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-primary)] transition-colors" 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">Preferences / Focus Areas</label>
                  <textarea 
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-primary)] transition-colors min-h-[100px] resize-none" 
                    value={form.preferences} 
                    onChange={e => setForm({ ...form, preferences: e.target.value })} 
                    placeholder="incident response, scientific analysis, reliability, dashboards" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full bg-[var(--accent-primary)] text-white font-black py-3 rounded-lg shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  {submitting ? 'JOINING...' : 'ACCEPT INVITE & JOIN'}
                </button>
              </form>
            </>
          )}
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
            <CheckCircle2 size={12} /> Organization member onboarding
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
