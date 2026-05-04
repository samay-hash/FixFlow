import { useEffect, useState } from 'react';
import { Bot, CheckCircle, ChevronDown, ChevronUp, Clock, Download, FileText, Loader2, Sparkles, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import Layout from '../components/layout/Layout';
import { AppPageHeader } from '../components/dashboard/AppPageHeader';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const PostmortemsPage = () => {
  const [postmortems, setPostmortems] = useState<any[]>([]);
  const [resolvedIncidents, setResolvedIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState('');

  const loadData = async () => {
    try {
      const [pmRes, incRes] = await Promise.all([
        apiClient.get('/postmortems'),
        apiClient.get('/incidents?status=resolved&limit=20'),
      ]);
      setPostmortems(pmRes.data.postmortems);
      const withPM = new Set(pmRes.data.postmortems.map((p: any) => p.incidentId?.id || p.incidentId));
      setResolvedIncidents(incRes.data.incidents.filter((incident: any) => !withPM.has(incident.id)));
    } catch {
      toast.error('Failed to load analysis reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedIncident) return;
    setGenerating(true);
    try {
      const { data } = await apiClient.post('/postmortems', { incidentId: selectedIncident });
      setPostmortems((prev) => [data.postmortem, ...prev]);
      setSelectedIncident('');
      toast.success('Analysis Complete. Draft generated.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const downloadMarkdown = (pm: any) => {
    let md = `# Postmortem: ${pm.title}\n`;
    if (pm.incidentId) md += `**Incident:** ${pm.incidentId.title}\n`;
    md += `**Date:** ${format(new Date(pm.createdAt), 'yyyy-MM-dd')}\n\n`;

    const sections = [
      ['Summary', 'summary'],
      ['Root Cause', 'rootCause'],
      ['Impact', 'impact'],
      ['What Went Well', 'whatWentWell'],
      ['What Went Wrong', 'whatWentWrong'],
      ['Prevention Steps', 'preventionSteps'],
    ];

    sections.forEach(([label, key]) => {
      if (pm[key]) md += `## ${label}\n${pm[key]}\n\n`;
    });

    if (pm.actionItems?.length > 0) {
      md += `## Action Items\n`;
      pm.actionItems.forEach((item: any) => {
        md += `- [${item.status === 'done' ? 'x' : ' '}] ${item.title} (Priority: ${item.priority})\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postmortem-${pm.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout>
      <AppPageHeader
        eyebrow="Knowledge archive"
        title="Forensic reports"
        description="Deep forensic analysis, corrective actions, and institutional memory for resolved incidents."
        icon={FileText}
      />

      {resolvedIncidents.length > 0 && (
        <DashboardPanel title="Analysis pending" description={`${resolvedIncidents.length} resolved incident${resolvedIncidents.length === 1 ? '' : 's'} waiting for postmortem generation.`}>
          <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
            <select
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-bold text-[#07111f] outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              value={selectedIncident}
              onChange={(event) => setSelectedIncident(event.target.value)}
            >
              <option value="">Select an incident for analysis...</option>
              {resolvedIncidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  [{incident.severity.toUpperCase()}] {incident.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedIncident}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff4f0a]/85 px-5 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] transition hover:bg-[#ff4f0a]/95 disabled:opacity-60"
            >
              {generating ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
              {generating ? 'Forensic analysis in progress...' : 'Analyze and draft'}
            </button>
          </div>
        </DashboardPanel>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : postmortems.length === 0 ? (
        <DashboardPanel>
          <div className="px-6 py-16 text-center">
            <FileText size={44} className="mx-auto mb-4 text-slate-200" />
            <p className="text-[15px] font-black text-[#07111f]">Archive empty</p>
            <p className="mt-2 text-[13px] font-semibold text-slate-500">Formal RCA reports appear here after generation.</p>
          </div>
        </DashboardPanel>
      ) : (
        <div className="space-y-4">
          {postmortems.map((pm) => (
            <DashboardPanel key={pm.id} className="overflow-hidden">
              <button type="button" onClick={() => setExpanded(expanded === pm.id ? null : pm.id)} className="grid w-full gap-4 p-5 text-left transition hover:bg-orange-50/20 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={clsx('rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]', pm.status === 'published' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-amber-100 bg-amber-50 text-amber-600')}>
                      {pm.status}
                    </span>
                    {pm.aiQualityScore && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#07111f] px-2.5 py-1 text-[10px] font-black text-white">
                        <Trophy size={11} className="text-amber-300" />
                        Score {pm.aiQualityScore}/10
                      </span>
                    )}
                  </div>
                  <h3 className="truncate text-[18px] font-black text-[#07111f]">{pm.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                    <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {format(new Date(pm.createdAt), 'MMM dd, yyyy')}</span>
                    <span className="inline-flex items-center gap-1.5"><CheckCircle size={12} /> {pm.actionItems?.length || 0} actions</span>
                  </div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  {expanded === pm.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>

              {expanded === pm.id && (
                <div className="space-y-7 border-t border-slate-100 px-5 pb-5 pt-5">
                  {pm.aiQualityFeedback && (
                    <div className="rounded-2xl bg-[#07111f] p-4 text-slate-200">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-300">
                        <Bot size={15} />
                        Watchdog feedback
                      </div>
                      <p className="text-[13px] font-semibold leading-6">{pm.aiQualityFeedback}</p>
                    </div>
                  )}

                  {[
                    { label: 'Executive Summary', key: 'summary' },
                    { label: 'Root Cause Identification', key: 'rootCause' },
                    { label: 'Infrastructure Impact', key: 'impact' },
                    { label: 'Response Efficacy', key: 'whatWentWell' },
                    { label: 'Gaps & Failures', key: 'whatWentWrong' },
                    { label: 'Preventative Roadmap', key: 'preventionSteps' },
                  ].filter((section) => pm[section.key]).map((section) => (
                    <section key={section.key}>
                      <h4 className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{section.label}</h4>
                      <p className="whitespace-pre-line text-[14px] font-semibold leading-7 text-[#07111f]">{pm[section.key]}</p>
                    </section>
                  ))}

                  {pm.actionItems?.length > 0 && (
                    <section>
                      <h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Corrective roadmap</h4>
                      <div className="space-y-2">
                        {pm.actionItems.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                            <span className={clsx('h-2.5 w-2.5 rounded-full', item.status === 'done' ? 'bg-emerald-500' : 'bg-amber-400')} />
                            <p className={clsx('flex-1 text-[13px] font-black', item.status === 'done' && 'text-slate-400 line-through')}>{item.title}</p>
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">{item.priority}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="flex justify-end border-t border-slate-100 pt-5">
                    <button onClick={() => downloadMarkdown(pm)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-black text-slate-600 transition hover:-translate-y-0.5 hover:text-[#07111f]">
                      <Download size={16} /> Export Analysis (.md)
                    </button>
                  </div>
                </div>
              )}
            </DashboardPanel>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default PostmortemsPage;
