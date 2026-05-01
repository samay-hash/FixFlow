import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { FileText, Plus, Bot, Star, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function Postmortems() {
  const [postmortems, setPostmortems] = useState([]);
  const [resolvedIncidents, setResolvedIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState('');

  const load = async () => {
    try {
      const [pmRes, incRes] = await Promise.all([
        api.get('/postmortems'),
        api.get('/incidents?status=resolved&limit=20'),
      ]);
      setPostmortems(pmRes.data.postmortems);
      // Only show resolved incidents that don't have a postmortem yet
      const withPM = new Set(pmRes.data.postmortems.map(p => p.incidentId?._id));
      setResolvedIncidents(incRes.data.incidents.filter(i => !withPM.has(i._id)));
    } catch { toast.error('Failed to load postmortems'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!selectedIncident) return toast.error('Select an incident first');
    setGenerating(true);
    try {
      const { data } = await api.post('/postmortems', { incidentId: selectedIncident });
      setPostmortems(prev => [data.postmortem, ...prev]);
      setSelectedIncident('');
      toast.success('🤖 AI postmortem draft generated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Generation failed'); }
    finally { setGenerating(false); }
  };

  const scoreColor = (s) => s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="page-header flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Postmortems</h1>
            <p className="page-subtitle">{postmortems.length} postmortems • AI-powered incident analysis</p>
          </div>
        </div>

        {/* Generate New */}
        {resolvedIncidents.length > 0 && (
          <div className="card mb-6 border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center gap-3 mb-3">
              <Bot size={18} className="text-purple-400" />
              <h3 className="font-semibold text-white text-sm">Generate AI Postmortem</h3>
              <span className="badge bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">✨ Powered by Gemini AI</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Select a resolved incident and AI will analyze the full timeline, generate root cause analysis, and draft the entire postmortem report.</p>
            <div className="flex gap-3 flex-wrap">
              <select className="input flex-1" value={selectedIncident} onChange={e => setSelectedIncident(e.target.value)}>
                <option value="">Select resolved incident...</option>
                {resolvedIncidents.map(i => (
                  <option key={i._id} value={i._id}>[{i.severity.toUpperCase()}] {i.title}</option>
                ))}
              </select>
              <button onClick={handleGenerate} disabled={generating || !selectedIncident} className="btn bg-purple-600 hover:bg-purple-500 text-white">
                <Bot size={16} />{generating ? 'AI Analyzing...' : 'Generate Draft'}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="card h-24 animate-pulse" />)}</div>
        ) : postmortems.length === 0 ? (
          <div className="card text-center py-16">
            <FileText size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold">No postmortems yet</p>
            <p className="text-slate-400 text-sm mt-1">Resolve an incident and generate an AI postmortem to start learning from failures.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {postmortems.map(pm => (
              <div key={pm._id} className="card">
                <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpanded(expanded === pm._id ? null : pm._id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={clsx('badge text-xs', pm.status === 'published' ? 'badge-low' : 'badge-medium')}>{pm.status}</span>
                      {pm.aiDraftGenerated && <span className="badge bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"><Bot size={10} />AI Draft</span>}
                      {pm.aiQualityScore && (
                        <div className="flex items-center gap-1">
                          <Star size={12} className={scoreColor(pm.aiQualityScore)} />
                          <span className={clsx('text-xs font-bold', scoreColor(pm.aiQualityScore))}>{pm.aiQualityScore}/10</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-sm">{pm.title}</h3>
                    {pm.incidentId && (
                      <p className="text-xs text-slate-500 mt-1">Incident: {pm.incidentId.title}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={10} />{new Date(pm.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><CheckCircle size={10} />{pm.actionItems?.length || 0} action items</span>
                    </div>
                  </div>
                  <div className="text-slate-500">{expanded === pm._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                </div>

                {expanded === pm._id && (
                  <div className="mt-5 pt-5 border-t border-slate-700 space-y-4 animate-fade-in">
                    {pm.aiQualityFeedback && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-xs text-purple-300"><Bot size={10} className="inline mr-1" />AI Feedback: {pm.aiQualityFeedback}</p>
                      </div>
                    )}
                    {[
                      ['Summary', pm.summary],
                      ['Root Cause', pm.rootCause],
                      ['Impact', pm.impact],
                      ['What Went Well', pm.whatWentWell],
                      ['What Went Wrong', pm.whatWentWrong],
                      ['Prevention Steps', pm.preventionSteps],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label}>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</h4>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{value}</p>
                      </div>
                    ))}
                    {pm.actionItems?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Action Items</h4>
                        <div className="space-y-1.5">
                          {pm.actionItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', item.status === 'done' ? 'bg-emerald-500' : item.status === 'in_progress' ? 'bg-yellow-500' : 'bg-slate-500')} />
                              <span className={clsx('flex-1', item.status === 'done' && 'line-through text-slate-500')}>{item.title}</span>
                              <span className="badge badge-medium text-xs">{item.priority}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
