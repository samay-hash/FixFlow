import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { FileText, Bot, Star, ChevronDown, ChevronUp, CheckCircle, Clock, Download, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import ConfirmModal from '../components/ConfirmModal';

export default function Postmortems() {
  const [postmortems, setPostmortems]           = useState([]);
  const [resolvedIncidents, setResolvedIncidents] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [generating, setGenerating]             = useState(false);
  const [expanded, setExpanded]                 = useState(null);
  const [selectedIncident, setSelectedIncident] = useState('');
  const [confirmModal, setConfirmModal]         = useState({ isOpen: false, id: null });
  const { user } = useSelector(s => s.auth);

  const load = async () => {
    try {
      const [pmRes, incRes] = await Promise.all([
        api.get('/postmortems'),
        api.get('/incidents?status=resolved&limit=20'),
      ]);
      setPostmortems(pmRes.data.postmortems);
      const withPM = new Set(pmRes.data.postmortems.map(p => p.incidentId?._id));
      setResolvedIncidents(incRes.data.incidents.filter(i => !withPM.has(i._id)));
    } catch { toast.error('Failed to load postmortems'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!selectedIncident) return toast.error('Select a resolved incident first');
    setGenerating(true);
    try {
      const { data } = await api.post('/postmortems', { incidentId: selectedIncident });
      setPostmortems(prev => [data.postmortem, ...prev]);
      setSelectedIncident('');
      // Refresh resolved incidents list
      const pmRes = await api.get('/postmortems');
      const incRes = await api.get('/incidents?status=resolved&limit=20');
      const withPM = new Set(pmRes.data.postmortems.map(p => p.incidentId?._id));
      setResolvedIncidents(incRes.data.incidents.filter(i => !withPM.has(i._id)));
      toast.success('🤖 AI postmortem draft generated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Generation failed'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/postmortems/${confirmModal.id}`);
      setPostmortems(prev => prev.filter(p => p._id !== confirmModal.id));
      toast.success('Postmortem deleted');
    } catch { toast.error('Failed to delete postmortem'); }
  };

  const scoreAccent = (s) => s >= 8 ? 'var(--accent)' : s >= 6 ? 'var(--yellow)' : 'var(--pink)';

  const sections = [
    ['Summary',          'summary'],
    ['Root Cause',       'rootCause'],
    ['Impact',           'impact'],
    ['What Went Well',   'whatWentWell'],
    ['What Went Wrong',  'whatWentWrong'],
    ['Prevention Steps', 'preventionSteps'],
  ];

  const downloadMarkdown = (pm) => {
    let md = `# Postmortem: ${pm.title}\n`;
    if (pm.incidentId) md += `**Incident:** ${pm.incidentId.title}\n`;
    md += `**Date:** ${new Date(pm.createdAt).toLocaleDateString()}\n\n`;

    sections.forEach(([label, key]) => {
      if (pm[key]) {
        md += `## ${label}\n${pm[key]}\n\n`;
      }
    });

    if (pm.actionItems?.length > 0) {
      md += `## Action Items\n`;
      pm.actionItems.forEach(item => {
        md += `- [${item.status === 'done' ? 'x' : ' '}] ${item.title} (Priority: ${item.priority})\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postmortem-${pm._id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 page-enter">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="page-header flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase px-2 py-0.5"
                style={{ background: '#5500CC', border: '2px solid var(--black)', color: 'white' }}>
                // AI-POWERED
              </span>
            </div>
            <h1 className="page-title">Postmortems</h1>
            <p className="page-subtitle">{postmortems.length} postmortems • AI-powered incident analysis</p>
          </div>
        </div>

        {/* ── Generate Panel ── always visible ──────────────── */}
        <div className="mb-6 p-5 animate-fade-in anim-up"
          style={{ background: 'var(--card-bg)', border: '3px solid #5500CC', boxShadow: '4px 4px 0 #5500CC' }}>
          <div className="flex items-center gap-3 mb-2">
            <Bot size={18} style={{ color: '#5500CC' }} />
            <h3 className="font-black text-sm uppercase tracking-wide" style={{ color: 'var(--text)' }}>
              Generate AI Postmortem
            </h3>
            <span className="badge" style={{ background: '#5500CC', color: 'white', borderColor: 'var(--black)' }}>
              ✨ Gemini / Groq AI
            </span>
          </div>
          <p className="text-xs font-medium mb-4" style={{ color: 'var(--muted)' }}>
            Select a resolved incident — AI will analyze the full timeline, generate root cause analysis,
            and draft the entire postmortem report automatically.
          </p>
          <div className="flex gap-3 flex-wrap">
            <select className="input flex-1" value={selectedIncident}
              onChange={e => setSelectedIncident(e.target.value)}>
              <option value="">Select resolved incident...</option>
              {resolvedIncidents.map(i => (
                <option key={i._id} value={i._id}>[{i.severity.toUpperCase()}] {i.title}</option>
              ))}
            </select>
            <button onClick={handleGenerate} disabled={generating || !selectedIncident}
              className="btn" style={{ background: '#5500CC', color: 'white', border: '3px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>
              <Bot size={16} />{generating ? 'AI Analyzing...' : resolvedIncidents.length === 0 ? 'No Pending Incidents' : 'Generate Draft'}
            </button>
          </div>
          {resolvedIncidents.length === 0 && (
            <p className="text-xs mt-3 font-medium" style={{ color: 'var(--muted)' }}>
              ✅ All resolved incidents already have postmortems. Resolve a new incident to generate another.
            </p>
          )}
        </div>

        {/* ── List ────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="h-24 animate-pulse"
                style={{ background: 'var(--cream-2)', border: '3px solid var(--black)' }} />
            ))}
          </div>
        ) : postmortems.length === 0 ? (
          <div className="p-16 text-center"
            style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <FileText size={40} className="mx-auto mb-3" style={{ color: '#888' }} />
            <p className="font-black text-lg uppercase" style={{ color: 'var(--black)' }}>No postmortems yet</p>
            <p className="text-sm font-medium mt-1" style={{ color: '#666' }}>
              Resolve an incident and generate an AI postmortem to start learning from failures.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {postmortems.map(pm => (
              <div key={pm._id} className="p-5"
                style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>

                {/* Card Header */}
                <div className="flex items-start justify-between gap-4 cursor-pointer group"
                  onClick={() => setExpanded(expanded === pm._id ? null : pm._id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={clsx('badge', pm.status === 'published' ? 'badge-low' : 'badge-medium')}>
                        {pm.status}
                      </span>
                      {pm.aiDraftGenerated && (
                        <span className="badge" style={{ background: '#EDE0FF', color: '#5500CC', borderColor: '#5500CC' }}>
                          <Bot size={10} />AI Draft
                        </span>
                      )}
                      {pm.aiQualityScore && (
                        <div className="flex items-center gap-1 px-2 py-0.5"
                          style={{ background: scoreAccent(pm.aiQualityScore), border: '2px solid var(--black)' }}>
                          <Star size={11} style={{ color: 'var(--black)' }} />
                          <span className="text-xs font-black" style={{ color: 'var(--black)' }}>
                            {pm.aiQualityScore}/10
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-black text-sm" style={{ color: 'var(--black)' }}>{pm.title}</h3>
                    {pm.incidentId && (
                      <p className="text-xs font-medium mt-1" style={{ color: '#666' }}>
                        Incident: {pm.incidentId.title}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#888' }}>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />{new Date(pm.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={10} />{pm.actionItems?.length || 0} action items
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: '#888' }}>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: pm._id }); }}
                        className="p-1.5 transition-opacity opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded"
                        title="Delete Postmortem"
                        style={{ color: 'var(--pink)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {expanded === pm._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {expanded === pm._id && (
                  <div className="mt-5 pt-5 space-y-4 animate-fade-in"
                    style={{ borderTop: '2px solid var(--black)' }}>

                    {pm.aiQualityFeedback && (
                      <div className="p-3"
                        style={{ background: '#EDE0FF', border: '2px solid #5500CC' }}>
                        <p className="text-xs font-medium" style={{ color: '#5500CC' }}>
                          <Bot size={10} className="inline mr-1" />
                          AI Feedback: {pm.aiQualityFeedback}
                        </p>
                      </div>
                    )}

                    {sections.filter(([, key]) => pm[key]).map(([label, key]) => (
                      <div key={key}>
                        <h4 className="text-xs font-black uppercase tracking-wider mb-1.5"
                          style={{ color: 'var(--black)', borderLeft: '3px solid var(--accent)', paddingLeft: 8 }}>
                          {label}
                        </h4>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-line"
                          style={{ color: '#333' }}>
                          {pm[key]}
                        </p>
                      </div>
                    ))}

                    {pm.actionItems?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider mb-2"
                          style={{ color: 'var(--black)', borderLeft: '3px solid var(--pink)', paddingLeft: 8 }}>
                          Action Items
                        </h4>
                        <div className="space-y-2">
                          {pm.actionItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm p-2"
                              style={{ background: 'var(--cream-2)', border: '2px solid var(--black)' }}>
                              <span className="w-2.5 h-2.5 flex-shrink-0" style={{
                                background: item.status === 'done' ? 'var(--accent)' : item.status === 'in_progress' ? 'var(--yellow)' : '#ccc',
                                border: '2px solid var(--black)',
                                display: 'inline-block',
                              }} />
                              <span className={clsx('flex-1 font-medium', item.status === 'done' && 'line-through')}
                                style={{ color: 'var(--black)' }}>
                                {item.title}
                              </span>
                              <span className="badge badge-medium text-xs">{item.priority}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Download Button */}
                    <div className="pt-4 mt-2" style={{ borderTop: '2px dashed #ccc' }}>
                      <button onClick={() => downloadMarkdown(pm)} className="btn-sm btn" style={{ background: 'var(--black)', color: 'white', border: '2px solid var(--black)' }}>
                        <Download size={14} /> Download Markdown
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, id: null })}
          onConfirm={handleDelete}
          title="Delete Postmortem"
          message="Are you sure you want to permanently delete this postmortem? This action cannot be undone."
          confirmText="Delete"
        />
      </main>
    </div>
  );
}
