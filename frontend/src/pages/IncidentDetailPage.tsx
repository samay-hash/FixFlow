import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Bot, CheckCircle, Clock, Info, Send, Shield, Users, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import Layout from '../components/layout/Layout';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import StatusBadge from '../components/ui/StatusBadge';
import AutoRemediation from '../components/incident/AutoRemediation';
import IncidentCopilot from '../components/incident/IncidentCopilot';
import { useIncidents } from '../hooks/useIncidents';
import { useSocket } from '../hooks/useSocket';
import { useAppSelector } from '../store/hooks';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const messageTypes = ['observation', 'remediation', 'status_change'] as const;

const IncidentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { currentIncident, fetchIncidentById, updateIncident, addTimelineUpdate } = useIncidents();

  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState<(typeof messageTypes)[number]>('observation');
  const [posting, setPosting] = useState(false);
  const [sitrep, setSitrep] = useState('');
  const [displayedSitrep, setDisplayedSitrep] = useState('');
  const [escalationTime, setEscalationTime] = useState('');

  const socket = useSocket();

  const loadData = useCallback(async () => {
    if (id) {
      await fetchIncidentById(id);
    }
  }, [id, fetchIncidentById]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Request SITREP if missing or on mount
  useEffect(() => {
    if (id && socket?.connected && !currentIncident?.aiSitrep) {
      const token = localStorage.getItem('simrs_token');
      if (token) {
        socket.emit('request:sitrep', { incidentId: id, token });
      }
    }
  }, [id, socket?.connected, currentIncident?.aiSitrep]);

  // Listen for real-time SITREP updates
  useEffect(() => {
    if (!socket) return;
    const handleSitrep = ({ incidentId, sitrep: newSitrep }: { incidentId: string; sitrep: string }) => {
      if (incidentId === id) {
        setSitrep(newSitrep);
      }
    };
    socket.on('incident:sitrep', handleSitrep);
    return () => {
      socket.off('incident:sitrep', handleSitrep);
    };
  }, [socket, id]);

  useEffect(() => {
    if (currentIncident?.aiSitrep) {
      setSitrep(currentIncident.aiSitrep);
    }
  }, [currentIncident]);

  useEffect(() => {
    if (!sitrep) return;
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedSitrep(sitrep.substring(0, index));
      index += 5;
      if (index > sitrep.length) clearInterval(timer);
    }, 10);
    return () => clearInterval(timer);
  }, [sitrep]);

  useEffect(() => {
    if (!currentIncident || currentIncident.status !== 'open') return;
    const interval = setInterval(() => {
      const diff = Date.now() - new Date(currentIncident.createdAt).getTime();
      const fiveMins = 5 * 60 * 1000;
      if (diff >= fiveMins) {
        setEscalationTime('ESCALATED');
      } else {
        const remaining = Math.max(0, Math.floor((fiveMins - diff) / 1000));
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        setEscalationTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIncident]);

  const handlePostUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !id) return;
    setPosting(true);
    await addTimelineUpdate(id, { message, type: msgType });
    setMessage('');
    setPosting(false);
    void loadData();
  };

  const handleAssignSelf = async () => {
    if (!id || !user) return;
    const currentAssigned = ((currentIncident?.assignedTo || []) as any[]).map((assignedUser) => assignedUser.id || assignedUser);
    if (currentAssigned.includes(user.id)) return toast('You are already assigned');

    await updateIncident(id, {
      assignedTo: [...currentAssigned, user.id],
      status: currentIncident?.status === 'open' ? 'in_progress' : currentIncident?.status,
    });
    void loadData();
  };

  const handleVerifyAndResolve = async () => {
    if (!id) return;
    const toastId = toast.loading('Pinging production server to verify recovery...');
    try {
      await apiClient.post(`/incidents/${id}/resolve-verify`);
      toast.success('Server verified UP. Incident marked as RESOLVED.', { id: toastId });
      void loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed. Site is still unreachable.', { id: toastId });
    }
  };

  if (!currentIncident) return null;

  const isResolved = currentIncident.status === 'resolved';
  const timeline = currentIncident.timeline || [];
  const responders = (currentIncident.assignedTo || []) as any[];
  const site = currentIncident.siteId as any;
  const siteName = typeof site === 'object' && site?.name ? site.name : 'Unlinked';
  const healthScore = currentIncident.healthScore ?? getFallbackHealthScore(currentIncident.createdAt, timeline.length, responders.length, isResolved);

  return (
    <Layout>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link to="/incidents" className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5">
                <ArrowLeft size={15} />
                Incidents
              </Link>
              <StatusBadge status={currentIncident.severity} type="incident_severity" />
              <StatusBadge status={currentIncident.status} type="incident_status" />
            </div>
            <h1 className="text-[28px] font-black leading-tight tracking-[-0.04em] text-[#07111f]">
              {currentIncident.title}
            </h1>
            <p className="mt-2 max-w-3xl text-[14px] font-semibold leading-6 text-slate-500">
              {currentIncident.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaPill icon={<Clock size={14} />} label={format(new Date(currentIncident.createdAt), 'MMM dd, HH:mm:ss')} />
              <MetaPill icon={<Activity size={14} />} label={`Site: ${siteName}`} />
              {currentIncident.mttr && <MetaPill icon={<CheckCircle size={14} />} label={`MTTR: ${Math.round(currentIncident.mttr / 60)}m`} tone="success" />}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            {currentIncident.status === 'open' && (
              <div className={clsx(
                'inline-flex min-h-12 items-center rounded-2xl border px-4 text-[12px] font-black uppercase tracking-[0.12em]',
                escalationTime === 'ESCALATED'
                  ? 'border-rose-200 bg-rose-600 text-white shadow-[0_16px_34px_rgba(225,29,72,0.2)]'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              )}>
                {escalationTime === 'ESCALATED' ? 'Escalated' : `Auto-escalation: ${escalationTime}`}
              </div>
            )}
            {!isResolved && (
              <button onClick={handleAssignSelf} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-black text-[#07111f] shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5">
                <Users size={16} />
                Take Command
              </button>
            )}
            {currentIncident.status === 'in_progress' && (
              <button onClick={handleVerifyAndResolve} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-4 text-[13px] font-black text-white shadow-[0_16px_34px_rgba(5,150,105,0.22)] transition hover:-translate-y-0.5">
                <Shield size={16} />
                Verify & Resolve
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <DashboardPanel
            title="Core investigation unit"
            description={sitrep === displayedSitrep ? 'Analysis complete.' : 'Analyzing logs...'}
            action={<Bot size={20} className="text-orange-700" />}
          >
            <div className="min-h-[116px] p-5 font-mono text-[13px] font-semibold leading-7 text-[#07111f]">
              {displayedSitrep || 'Waiting for the first investigation summary...'}
              {sitrep !== displayedSitrep && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-orange-700" />}
            </div>
          </DashboardPanel>

          {!isResolved && <AutoRemediation incident={{ id: currentIncident.id }} sitrep={sitrep} />}

          <DashboardPanel title="War room timeline" description="Responder updates, system notes, and remediation actions.">
            <div className="p-5">
              <div className="relative space-y-5 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-slate-200">
                {timeline.length === 0 && (
                  <div className="ml-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-[13px] font-semibold text-slate-500">
                    Waiting for investigation updates...
                  </div>
                )}
                {timeline.map((entry, index) => (
                  <div key={`${entry.timestamp}-${index}`} className="relative flex gap-4">
                    <TimelineMarker type={entry.type} />
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[14px] font-semibold leading-6 text-[#07111f]">{entry.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        <span>{(entry.updatedBy as any)?.name || 'System'}</span>
                        <span>/</span>
                        <span>{formatDistanceToNow(new Date(entry.timestamp))} ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isResolved && (
                <form onSubmit={handlePostUpdate} className="mt-6 border-t border-slate-100 pt-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {messageTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMsgType(type)}
                        className={clsx(
                          'rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition',
                          msgType === type
                            ? 'border-orange-100 bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-orange-100 hover:bg-orange-50/60'
                        )}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Describe your actions or observations..."
                      className="dashboard-input flex-1"
                    />
                    <button type="submit" disabled={posting || !message.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff4f0a]/85 text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] disabled:opacity-60" aria-label="Post update">
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </DashboardPanel>
        </div>

        <aside className="space-y-5">
          <DashboardPanel title="Health index" description="Age, activity, and responder engagement.">
            <div className="p-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="h-36 w-36 -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke="#c2410c"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(healthScore / 100) * 389} 389`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[34px] font-black tracking-[-0.05em] text-[#07111f]">{healthScore}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="mt-4 text-[12px] font-semibold leading-5 text-slate-500">
                Driven by incident age, timeline activity, and assigned responder coverage.
              </p>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Command center" description="Responders currently assigned.">
            <div className="space-y-3 p-5">
              {responders.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-[13px] font-semibold text-slate-500">
                  No responders currently in command.
                </p>
              ) : responders.map((assignedUser, index) => (
                <div key={assignedUser.id || index} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[13px] font-black text-orange-700">
                    {assignedUser.name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-black text-[#07111f]">{assignedUser.name || assignedUser}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{assignedUser.role || 'Responder'}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Incident details" description="Operational metadata for handoff and review.">
            <dl className="space-y-3 p-5 text-[12px]">
              {[
                ['Source', currentIncident.source],
                ['Category', currentIncident.category || 'other'],
                ['Timeline entries', String(timeline.length)],
                ['Last update', currentIncident.updatedAt ? format(new Date(currentIncident.updatedAt), 'MMM dd, HH:mm') : 'N/A'],
                ['Resolution', currentIncident.mttr ? `${Math.round(currentIncident.mttr / 60)}m` : 'Ongoing'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <dt className="font-black text-slate-500">{label}</dt>
                  <dd className="text-right font-black text-[#07111f]">{value}</dd>
                </div>
              ))}
            </dl>
          </DashboardPanel>

          {!isResolved && <IncidentCopilot incidentId={currentIncident.id} variant="panel" />}
        </aside>
      </div>
    </Layout>
  );
};

function MetaPill({ icon, label, tone = 'default' }: { icon: ReactNode; label: string; tone?: 'default' | 'success' }) {
  return (
    <span className={clsx('inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-[11px] font-black uppercase tracking-[0.11em]', tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500')}>
      {icon}
      {label}
    </span>
  );
}

function TimelineMarker({ type }: { type: string }) {
  const isRemediation = type === 'remediation';
  const isStatus = type === 'status_change';

  return (
    <div className={clsx('z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white', isRemediation ? 'bg-emerald-100 text-emerald-700' : isStatus ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}>
      {isStatus ? <Zap size={14} /> : <Info size={14} />}
    </div>
  );
}

function getFallbackHealthScore(createdAt: string, timelineCount: number, responderCount: number, isResolved: boolean) {
  if (isResolved) return 100;
  const ageMinutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  const score = 100 - Math.min(55, ageMinutes * 2) + Math.min(20, timelineCount * 5) + Math.min(15, responderCount * 5);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default IncidentDetailPage;
