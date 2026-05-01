import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Send, Bot, UserCircle, ArrowLeft, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import AutoRemediation from '../components/AutoRemediation';

const typeColors = { system: 'text-slate-500', observation: 'text-slate-300', action_taken: 'text-blue-300', status_change: 'text-yellow-300', ai_insight: 'text-purple-300' };
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
            <h1 className="text-2xl font-bold text-white">{incident.title}</h1>
            {incident.description && <p className="text-slate-400 text-sm mt-2">{incident.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
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
          <div className="lg:col-span-2 space-y-4">
            {/* AI SITREP */}
            <div className="card border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-300">AI Situation Report (SITREP)</h3>
                </div>
                {!isResolved && canEdit && (
                  <button onClick={getSitrep} disabled={sitrepLoading} className="btn-ghost btn-sm text-purple-400 border-purple-500/30">
                    <Bot size={12} />{sitrepLoading ? 'Analyzing...' : 'Update SITREP'}
                  </button>
                )}
              </div>
              {sitrep ? (
                <p className="text-sm text-slate-300 leading-relaxed">{sitrep}</p>
              ) : (
                <p className="text-sm text-slate-500 italic">Click "Update SITREP" to generate an AI situation report based on timeline activity.</p>
              )}
            </div>
            
            {/* AI Auto Remediation Script */}
            {!isResolved && <AutoRemediation incident={incident} sitrep={sitrep} />}

            {/* Timeline */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4 text-sm">Incident Timeline</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {incident.timeline?.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No updates yet</p>}
                {incident.timeline?.map((entry, i) => (
                  <div key={i} className="flex gap-3 animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-800 border border-slate-700 flex items-center justify-center text-sm">
                      {typeIcons[entry.type] || '💬'}
                    </div>
                    <div className="flex-1">
                      <p className={clsx('text-sm', typeColors[entry.type] || 'text-slate-300')}>{entry.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-600">{entry.updatedBy?.name || 'System'}</span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-600">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Post Update */}
              {canEdit && !isResolved && (
                <form onSubmit={postUpdate} className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex gap-2 mb-2">
                    {['observation', 'action_taken', 'status_change'].map(t => (
                      <button key={t} type="button" onClick={() => setMsgType(t)}
                        className={clsx('btn-sm btn text-xs capitalize', msgType === t ? 'btn-primary' : 'btn-ghost')}>
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe what you observed or did..." className="input flex-1 text-sm" />
                    <button type="submit" disabled={posting || !message.trim()} className="btn-primary btn-sm"><Send size={14} /></button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            {/* Health Score */}
            <div className="card text-center">
              <p className="text-xs text-slate-400 mb-3">Incident Health Score</p>
              <div className="relative inline-block">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="none" />
                  <circle cx="48" cy="48" r="40"
                    stroke={incident.healthScore >= 70 ? '#10b981' : incident.healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6" fill="none"
                    strokeDasharray={`${(incident.healthScore / 100) * 251} 251`}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={clsx('text-2xl font-bold', incident.healthScore >= 70 ? 'text-emerald-400' : incident.healthScore >= 40 ? 'text-yellow-400' : 'text-red-400')}>
                    {incident.healthScore}
                  </span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Score drops with age, rises with action</p>
            </div>

            {/* Assigned Responders */}
            <div className="card">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Users size={14} />Responders</h4>
              {incident.assignedTo?.length === 0 ? (
                <p className="text-xs text-slate-500">No responders assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {incident.assignedTo?.map(u => (
                    <div key={u._id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {u.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-300">{u.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="card">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Details</h4>
              <dl className="space-y-2 text-xs">
                {[
                  ['Source', incident.source],
                  ['Created', new Date(incident.createdAt).toLocaleString()],
                  ['Last Update', incident.updatedAt ? new Date(incident.updatedAt).toLocaleString() : 'N/A'],
                  ['Timeline Entries', incident.timeline?.length || 0],
                  ['MTTR', incident.mttr ? `${Math.round(incident.mttr / 60)} min` : 'Ongoing'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-slate-300 capitalize font-mono">{String(v)}</dd>
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
