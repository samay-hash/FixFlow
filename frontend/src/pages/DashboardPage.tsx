import { useCallback, useEffect, useState } from 'react';
import { Activity, Clock, Server, ShieldAlert } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { IncidentQueue } from '../components/dashboard/IncidentQueue';
import { LogSummaryPanel } from '../components/dashboard/LogSummaryPanel';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ResponseTimeline } from '../components/dashboard/ResponseTimeline';
import { SiteHealthPanel } from '../components/dashboard/SiteHealthPanel';
import { UptimeTrendPanel } from '../components/dashboard/UptimeTrendPanel';
import { useIncidents } from '../hooks/useIncidents';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSites } from '../store/slices/siteSlice';
import apiClient from '../api/client';
import type { LogSummary, UptimeSnapshot } from '../types';

interface IncidentStats {
  total?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
  critical?: number;
  avgMttrSeconds?: number;
}

const DashboardPage = () => {
  const { incidents, fetchIncidents } = useIncidents();
  const dispatch = useAppDispatch();
  const { sites } = useAppSelector((state) => state.sites);
  const { company } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [logSummary, setLogSummary] = useState<LogSummary>({ info: 0, warning: 0, error: 0, fatal: 0 });
  const [uptimeSnapshots, setUptimeSnapshots] = useState<UptimeSnapshot[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, sitesRes, logsRes] = await Promise.all([
        apiClient.get('/incidents/stats'),
        apiClient.get('/sites'),
        apiClient.get('/logs/summary'),
      ]);

      const nextSites = sitesRes.data.sites || [];
      setStats(statsRes.data.stats);
      dispatch(setSites(nextSites));
      setLogSummary({ info: 0, warning: 0, error: 0, fatal: 0, ...(logsRes.data.summary || {}) });

      const primarySite = nextSites[0];
      if (primarySite?.id || primarySite?._id) {
        const siteId = primarySite.id || primarySite._id;
        const uptimeRes = await apiClient.get(`/sites/${siteId}/uptime?hours=24`);
        setUptimeSnapshots(uptimeRes.data.snapshots || []);
      } else {
        setUptimeSnapshots([]);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchIncidents({ limit: 10 });
    void fetchDashboardData();
  }, [fetchIncidents, fetchDashboardData]);

  const downSites = sites.filter((site) => site.status === 'down').length;
  const downSiteNames = sites.filter((site) => site.status === 'down').map((s) => s.name);
  const avgResolveMinutes = Math.round((stats?.avgMttrSeconds || 0) / 60);
  const avgUptime = sites.length
    ? sites.reduce((total, site) => total + (site.uptimePercent ?? 100), 0) / sites.length
    : 100;

  return (
    <Layout>
      <DashboardHeader
        companyName={company?.name}
        openIncidents={stats?.open || 0}
        downSites={downSites}
        downSiteNames={downSiteNames}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Open incidents"
          value={stats?.open || 0}
          helper={(stats?.open || 0) > 0 ? 'Needs responder focus' : 'Queue is clear'}
          icon={ShieldAlert}
          tone={(stats?.open || 0) > 0 ? 'rose' : 'green'}
        />
        <MetricCard
          label="In progress"
          value={stats?.inProgress || 0}
          helper="Currently owned by responders"
          icon={Activity}
          tone={(stats?.inProgress || 0) > 0 ? 'orange' : 'slate'}
        />
        <MetricCard
          label="Avg. resolve time"
          value={`${avgResolveMinutes}m`}
          helper="Mean time to recovery"
          icon={Clock}
          tone="orange"
        />
        <MetricCard
          label="Monitored services"
          value={sites.length}
          helper={downSites > 0 ? `${downSites} currently down` : `${avgUptime.toFixed(2)}% avg uptime`}
          icon={Server}
          tone={downSites > 0 ? 'rose' : 'blue'}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.75fr)]">
        <UptimeTrendPanel sites={sites} snapshots={uptimeSnapshots} />
        <LogSummaryPanel summary={logSummary} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.78fr)]">
        <IncidentQueue incidents={incidents} />
        <SiteHealthPanel sites={sites} />
      </section>

      {/* ResponseTimeline now receives real incidents to derive live activity */}
      <ResponseTimeline incidents={incidents} />
    </Layout>
  );
};

export default DashboardPage;
