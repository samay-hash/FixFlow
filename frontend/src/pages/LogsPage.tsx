import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Cpu, Filter, Loader2, Play, RefreshCw, Search, Server, Terminal as TerminalIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import Layout from '../components/layout/Layout';
import { AppPageHeader } from '../components/dashboard/AppPageHeader';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const LogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchLogsAndAnalysis = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/logs/analyze');
      setLogs(res.data.logs || []);
      setAnalysis(res.data.analysis);
    } catch (err) {
      toast.error('Failed to synchronize with EC2 log agents');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await apiClient.get('/logs/analyze');
      setAnalysis(res.data.analysis);
      toast.success('System intelligence report refreshed');
    } catch (err) {
      toast.error('AI Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    void fetchLogsAndAnalysis();
  }, []);

  return (
    <Layout>
      <AppPageHeader
        eyebrow="Log explorer"
        title="Log intelligence"
        description="Agent-based ingestion and AI-powered anomaly detection for production signals."
        icon={TerminalIcon}
        action={
          <>
            <button onClick={fetchLogsAndAnalysis} disabled={loading} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-black text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:text-[#07111f]">
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button onClick={runAnalysis} disabled={analyzing} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#ff4f0a]/85 px-5 py-3 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] transition hover:bg-[#ff4f0a]/95 disabled:opacity-60">
              {analyzing ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} />}
              {analyzing ? 'Compiling analysis...' : 'Generate Insight Report'}
            </button>
          </>
        }
      />

      <section className="overflow-hidden rounded-[30px] border border-slate-800 bg-[#07111f] shadow-[0_28px_80px_rgba(7,17,31,0.24)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="h-4 w-px bg-white/10" />
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              <TerminalIcon size={14} />
              ai-watchdog-v2
            </span>
          </div>
          <span className="hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 sm:flex">
            <Cpu size={12} className="text-violet-300" />
            Quantum Engine
          </span>
        </div>

        <div className="p-5 font-mono text-sm sm:p-7">
          {loading || analyzing ? (
            <div className="space-y-4 py-4">
              <TerminalLine icon={Activity} text="Interrogating EC2 log streams..." active />
              <TerminalLine icon={Cpu} text="Detecting structural patterns and anomalies..." />
            </div>
          ) : analysis ? (
            <div className="space-y-7">
              <AnalysisBlock label="System summary" tone="text-violet-300">
                <p className="max-w-4xl text-[15px] font-semibold leading-7 text-slate-100">{analysis.summary}</p>
              </AnalysisBlock>

              {analysis.anomalies?.length > 0 && (
                <AnalysisBlock label="Detected anomalies" tone="text-rose-300">
                  <div className="space-y-2">
                    {analysis.anomalies.map((anom: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 rounded-2xl border border-rose-400/15 bg-rose-400/10 p-3 text-rose-100">
                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-rose-300" />
                        <span className="text-[13px] font-semibold leading-6">{anom}</span>
                      </div>
                    ))}
                  </div>
                </AnalysisBlock>
              )}

              {analysis.fix && (
                <AnalysisBlock label="Suggested remediation" tone="text-emerald-300">
                  <pre className="whitespace-pre-wrap rounded-2xl border border-emerald-400/15 bg-black/24 p-4 text-[13px] leading-6 text-emerald-200">{analysis.fix}</pre>
                </AnalysisBlock>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-sm font-semibold text-slate-500">Terminal idle. Compute an AI report to initialize log analysis.</div>
          )}
        </div>
      </section>

      <DashboardPanel
        title="Raw ingestion stream"
        description="Live log records from connected infrastructure agents."
        action={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search log contents..." className="min-h-10 rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] font-semibold outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
              <Filter size={16} />
            </button>
          </div>
        }
        className="overflow-hidden"
      >
        {logs.length === 0 && !loading ? (
          <div className="px-6 py-16 text-center">
            <Server size={44} className="mx-auto mb-4 text-slate-200" />
            <p className="text-[15px] font-black text-[#07111f]">No active streams</p>
            <p className="mt-2 text-[13px] font-semibold text-slate-500">Initialize the fixflow-agent on EC2 instances to stream logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-orange-50/20">
                  {['Status', 'Timestamp', 'Source', 'Log message'].map((heading) => (
                    <th key={heading} className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[12px]">
                {logs.map((log) => (
                  <tr key={log.id} className="group transition hover:bg-orange-50/20">
                    <td className="px-5 py-4">
                      <span className={clsx('rounded-full border px-2.5 py-1 text-[10px] font-black uppercase', log.level === 'ERROR' || log.level === 'FATAL' ? 'border-rose-100 bg-rose-50 text-rose-600' : log.level === 'WARN' ? 'border-amber-100 bg-amber-50 text-amber-600' : 'border-slate-100 bg-slate-50 text-slate-500')}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}</td>
                    <td className="px-5 py-4 font-black text-slate-600">{log.source}</td>
                    <td className="max-w-xl truncate px-5 py-4 text-slate-700 group-hover:whitespace-normal">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardPanel>
    </Layout>
  );
};

function TerminalLine({ icon: Icon, text, active = false }: { icon: LucideIcon; text: string; active?: boolean }) {
  return (
    <div className={clsx('flex items-center gap-3', active ? 'text-white' : 'text-white/55')}>
      <Icon size={16} className={active ? 'animate-spin text-emerald-300' : 'text-violet-300'} />
      <span>{text}</span>
    </div>
  );
}

function AnalysisBlock({ label, tone, children }: { label: string; tone: string; children: ReactNode }) {
  return (
    <div>
      <span className={`mb-3 block text-[11px] font-black uppercase tracking-[0.2em] ${tone}`}># {label}</span>
      {children}
    </div>
  );
}

export default LogsPage;
