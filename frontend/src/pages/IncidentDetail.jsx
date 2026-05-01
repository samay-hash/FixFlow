import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Send, Bot, UserCircle, ArrowLeft, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import AutoRemediation from '../components/AutoRemediation';

const typeColors = { system: 'text-[#666]', observation: 'text-[#444]', action_taken: 'text-[var(--blue)]', status_change: 'text-[var(--pink)]', ai_insight: 'text-purple-600' };
const typeIcons = { system: '⚙️', observation: '👁', action_taken: '🔧', status_change: '🔄', ai_insight: '🤖' };

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [incident, setIncident] = useState(null);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('observation');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [sitrep, setSitrep] = useState('');
  const [sitrepLoading, setSitrepLoading] = useState(false);
  const [team, setTeam] = useState([]);

  const load = async () => {
    try {
      const [incRes, teamRes] = await Promise.all([api.get(`/incidents/${id}`), api.get('/auth/team')]);
      setIncident(incRes.data.incident);
      setTeam(teamRes.data.team);
      setSitrep(incRes.data.incident.aiSitrep || '');
    } catch { toast.error('Failed to load incident'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const postUpdate = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/incidents/${id}/timeline`, { message, type: msgType });
      setIncident(prev => ({ ...prev, timeline: data.timeline }));
      setMessage('');
      toast.success('Update posted');
    } catch { toast.error('Failed to post update'); }
    finally { setPosting(false); }
  };

  const updateStatus = async (status) => {
    try {
      const { data } = await api.put(`/incidents/${id}`, { status });
      setIncident(data.incident);
      toast.success(`Status → ${status.replace('_', ' ')}`);
    } catch { toast.error('Failed to update status'); }
  };

  const assignSelf = async () => {
    const currentIds = incident.assignedTo?.map(u => u._id || u) || [];
    if (currentIds.includes(user._id)) return toast('Already assigned');
    try {
      const { data } = await api.put(`/incidents/${id}`, { assignedTo: [...currentIds, user._id] });
      setIncident(data.incident);
      toast.success('You are now a responder');
    } catch { toast.error('Failed to assign'); }
  };

  const getSitrep = async () => {
    setSitrepLoading(true);
    try {
      // SITREP via AI service (calls backend which calls Gemini)
      const { data } = await api.put(`/incidents/${id}`, { status: incident.status }); // triggers sitrep in service
      setSitrep(data.incident.aiSitrep || 'Generating...');
      toast.success('SITREP updated by AI');
    } catch { toast.error('SITREP failed'); }
    finally { setSitrepLoading(false); }
  };

  if (loading) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 ml-64 flex items-center justify-center"><div className="animate-spin text-4xl">⏳</div></main></div>;
  if (!incident) return null;

  const isResolved = incident.status === 'resolved';
  const canEdit = user?.role !== 'viewer';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Back */}
        <button onClick={() => navigate('/incidents')} className="btn-ghost btn-sm mb-6"><ArrowLeft size={14} />All Incidents</button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={clsx('badge', { 'badge-critical': incident.severity === 'critical', 'badge-high': incident.severity === 'high', 'badge-medium': incident.severity === 'medium', 'badge-low': incident.severity === 'low' })}>{incident.severity}</span>
              <span className={clsx('text-sm font-medium', isResolved ? 'text-emerald-400' : incident.status === 'in_progress' ? 'text-yellow-400' : 'text-red-400')}>
                {incident.status.replace('_', ' ').toUpperCase()}
              </span>
              {incident.source === 'auto' && <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">🤖 Auto-detected</span>}
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: 'var(--black)' }}>{incident.title}</h1>
            {incident.description && <p className="font-bold text-sm mt-2" style={{ color: '#666' }}>{incident.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs font-bold" style={{ color: '#555' }}>
              <span className="flex items-center gap-1"><Clock size={12} />Created: {new Date(incident.createdAt).toLocaleString()}</span>
              {incident.siteId && <span className="flex items-center gap-1"><AlertTriangle size={12} />Site: {incident.siteId.name}</span>}
              {incident.mttr && <span className="flex items-center gap-1"><CheckCircle size={12} />MTTR: {Math.round(incident.mttr / 60)}m</span>}
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-2 flex-wrap">
              {!isResolved && <button onClick={assignSelf} className="btn-ghost btn-sm"><Users size={14} />Assign Self</button>}
              {incident.status === 'open' && <button onClick={() => updateStatus('in_progress')} className="btn-sm btn bg-yellow-600 hover:bg-yellow-500 text-white">▶ Start Working</button>}
              {incident.status === 'in_progress' && <button onClick={() => updateStatus('resolved')} className="btn-success btn-sm"><CheckCircle size={14} />Resolve</button>}
              {isResolved && (
                <button onClick={() => navigate('/postmortems')} className="btn-primary btn-sm"><Bot size={14} />Write Postmortem</button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* War Room - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI SITREP */}
            <div className="p-5" style={{ background: '#E9D5FF', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot size={18} style={{ color: 'var(--black)' }} />
                  <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--black)' }}>AI Situation Report (SITREP)</h3>
                </div>
                {!isResolved && canEdit && (
                  <button onClick={getSitrep} disabled={sitrepLoading} className="btn-ghost btn-sm" style={{ border: '2px solid var(--black)', background: 'white', color: 'var(--black)' }}>
                    <Bot size={12} />{sitrepLoading ? 'Analyzing...' : 'Update SITREP'}
                  </button>
                )}
              </div>
              {sitrep ? (
                <p className="text-sm font-medium leading-relaxed" style={{ color: '#222' }}>{sitrep}</p>
              ) : (
                <p className="text-sm font-medium italic" style={{ color: '#666' }}>Click "Update SITREP" to generate an AI situation report based on timeline activity.</p>
              )}
            </div>
            
            {/* AI Auto Remediation Script */}
            {!isResolved && <AutoRemediation incident={incident} sitrep={sitrep} />}

            {/* Timeline */}
            <div className="p-6" style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '6px 6px 0 var(--black)' }}>
              <h3 className="font-black uppercase tracking-wider mb-4 text-sm" style={{ color: 'var(--black)' }}>Incident Timeline</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {incident.timeline?.length === 0 && <p className="text-[#666] font-bold text-sm text-center py-4">No updates yet</p>}
                {incident.timeline?.map((entry, i) => (
                  <div key={i} className="flex gap-3 animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border-[2px] flex items-center justify-center text-sm"
                         style={{ background: 'white', borderColor: 'var(--black)', boxShadow: '2px 2px 0 var(--black)' }}>
                      {typeIcons[entry.type] || '💬'}
                    </div>
                    <div className="flex-1">
                      <p className={clsx('text-sm font-medium', typeColors[entry.type] || 'text-[#222]')}>{entry.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#666]">{entry.updatedBy?.name || 'System'}</span>
                        <span className="text-xs font-bold text-[#666]">·</span>
                        <span className="text-xs font-bold text-[#666]">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Post Update */}
              {canEdit && !isResolved && (
                <form onSubmit={postUpdate} className="mt-5 pt-5" style={{ borderTop: '3px solid var(--black)' }}>
                  <div className="flex gap-2 mb-3">
                    {['observation', 'action_taken', 'status_change'].map(t => (
                      <button key={t} type="button" onClick={() => setMsgType(t)}
                        className={clsx('btn-sm btn text-xs font-black uppercase tracking-wider', msgType === t ? 'bg-black text-white' : 'bg-white text-black')}
                        style={{ border: '2px solid var(--black)' }}>
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={message} onChange={e => setMessage(e.target.value)} 
                           placeholder="Describe what you observed or did..." 
                           className="input flex-1 text-sm font-medium" 
                           style={{ background: 'white' }} />
                    <button type="submit" disabled={posting || !message.trim()} 
                            className="btn-sm" 
                            style={{ background: '#C8FF00', color: 'var(--black)', border: '3px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Health Score */}
            <div className="p-6 text-center" style={{ background: 'white', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#666' }}>Incident Health Score</p>
              <div className="relative inline-block">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#EAE4D9" strokeWidth="6" fill="none" />
                  <circle cx="48" cy="48" r="40"
                    stroke={incident.healthScore >= 70 ? '#10b981' : incident.healthScore >= 40 ? '#f59e0b' : '#FF2D78'}
                    strokeWidth="6" fill="none"
                    strokeDasharray={`${(incident.healthScore / 100) * 251} 251`}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={clsx('text-3xl font-black', incident.healthScore >= 70 ? 'text-emerald-500' : incident.healthScore >= 40 ? 'text-yellow-500' : 'text-[var(--pink)]')}>
                    {incident.healthScore}
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#888' }}>/100</span>
                </div>
              </div>
              <p className="text-xs font-bold mt-2" style={{ color: '#888' }}>Score drops with age, rises with action</p>
            </div>

            {/* Assigned Responders */}
            <div className="p-5" style={{ background: 'white', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
              <h4 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--black)' }}><Users size={14} />Responders</h4>
              {incident.assignedTo?.length === 0 ? (
                <p className="text-xs font-bold" style={{ color: '#888' }}>No responders assigned yet</p>
              ) : (
                <div className="space-y-3">
                  {incident.assignedTo?.map(u => (
                    <div key={u._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-[var(--black)] flex-shrink-0"
                           style={{ background: '#C8FF00', border: '2px solid var(--black)' }}>
                        {u.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-black" style={{ color: 'var(--black)' }}>{u.name}</p>
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#666' }}>{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="p-5" style={{ background: 'white', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
              <h4 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: 'var(--black)' }}>Details</h4>
              <dl className="space-y-3 text-xs">
                {[
                  ['Source', incident.source],
                  ['Created', new Date(incident.createdAt).toLocaleString()],
                  ['Last Update', incident.updatedAt ? new Date(incident.updatedAt).toLocaleString() : 'N/A'],
                  ['Timeline Entries', incident.timeline?.length || 0],
                  ['MTTR', incident.mttr ? `${Math.round(incident.mttr / 60)} min` : 'Ongoing'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <dt className="font-bold" style={{ color: '#666' }}>{k}</dt>
                    <dd className="font-mono font-bold" style={{ color: 'var(--black)' }}>{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
