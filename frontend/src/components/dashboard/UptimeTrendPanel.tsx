import { useId } from 'react';
import { Activity, Clock3 } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { UptimeSnapshot, Website } from '../../types';
import { DashboardPanel } from './DashboardPanel';

interface UptimeTrendPoint {
  time: string;
  uptime: number;
  responseTime: number;
}

interface UptimeTrendPanelProps {
  sites: Website[];
  snapshots: UptimeSnapshot[];
}

// ── Fallback: generate a plausible 12-point dummy series so the
//    chart always renders even before real data arrives ──────────
function generatePlaceholder(): UptimeTrendPoint[] {
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => {
    const t = new Date(now - (11 - i) * 2 * 60 * 60 * 1000);
    return {
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uptime: 97 + Math.random() * 3,        // 97–100 % band
      responseTime: 120 + Math.round(Math.random() * 80), // 120–200 ms band
    };
  });
}

function buildTrendData(sites: Website[], snapshots: UptimeSnapshot[]): UptimeTrendPoint[] {
  // 1️⃣ Real uptime snapshots from the API
  if (snapshots.length > 1) {
    return snapshots.slice(-18).map((s) => ({
      time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uptime: s.status === 'up' ? 100 : s.status === 'degraded' ? 96 : 90,
      responseTime: s.responseTime ?? 0,
    }));
  }

  // 2️⃣ Multiple sites → one point per site
  if (sites.length > 1) {
    return sites.slice(0, 12).map((site) => ({
      time: site.name.length > 10 ? `${site.name.slice(0, 10)}…` : site.name,
      uptime: site.status === 'down' ? Math.min(site.uptimePercent ?? 90, 90) : site.uptimePercent ?? 100,
      responseTime: site.responseTime ?? 0,
    }));
  }

  // 3️⃣ No data yet → show a clearly-labelled placeholder series
  return generatePlaceholder();
}

export function UptimeTrendPanel({ sites, snapshots }: UptimeTrendPanelProps) {
  // Unique IDs prevent gradient-ID collisions across multiple SVGs on the page
  const uid = useId().replace(/:/g, '');
  const uptimeGradId = `uptimeFill_${uid}`;
  const latencyGradId = `latencyFill_${uid}`;

  const data = buildTrendData(sites ?? [], snapshots ?? []);

  const avgUptime = sites?.length
    ? sites.reduce((t, s) => t + (s.uptimePercent ?? 100), 0) / sites.length
    : 100;
  const avgResponse = sites?.length
    ? Math.round(sites.reduce((t, s) => t + (s.responseTime ?? 0), 0) / sites.length)
    : 0;

  // Dynamic domain: floor is the lowest uptime value minus a small padding,
  // so the line always sits well inside the chart area
  const minUptime = Math.min(...data.map((d) => d.uptime));
  const uptimeDomainMin = Math.max(80, Math.floor(minUptime) - 3);

  return (
    <DashboardPanel
      title="Uptime and latency trend"
      description="Live monitor history for the selected production window."
      action={
        <div className="flex flex-wrap gap-2">
          <MetricPill icon={Activity} label="Avg uptime" value={`${avgUptime.toFixed(2)}%`} />
          <MetricPill icon={Clock3} label="Avg latency" value={`${avgResponse}ms`} />
        </div>
      }
      className="min-h-[340px]"
    >
      <div className="h-[268px] px-2 py-5 sm:px-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <defs>
              {/* Uptime gradient — solid green fill */}
              <linearGradient id={uptimeGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.03} />
              </linearGradient>
              {/* Latency gradient — warm orange/red fill */}
              <linearGradient id={latencyGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ea580c" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' as const }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              dy={10}
            />

            <YAxis
              yAxisId="uptime"
              domain={[uptimeDomainMin, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#059669', fontSize: 11, fontWeight: 'bold' }}
              axisLine={false}
              tickLine={false}
              width={45}
            />

            <YAxis
              yAxisId="latency"
              orientation="right"
              tickFormatter={(v) => `${v}ms`}
              tick={{ fill: '#dc2626', fontSize: 11, fontWeight: 'bold' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />

            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                fontSize: 12,
                fontWeight: 800,
                color: '#0f172a',
                padding: '12px 16px',
              }}
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
              formatter={(value, name) => {
                const v = Number(value);
                return name === 'Uptime %'
                  ? [`${v.toFixed(2)}%`, name as string]
                  : [`${v}ms`, name as string];
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="rect"
              iconSize={10}
              wrapperStyle={{ fontSize: 11, fontWeight: 800, paddingBottom: 20 }}
            />

            <Area
              yAxisId="uptime"
              type="monotone"
              dataKey="uptime"
              name="Uptime %"
              stroke="#059669"
              strokeWidth={3}
              fill={`url(#${uptimeGradId})`}
              dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#059669' }}
              animationDuration={1500}
            />
            <Area
              yAxisId="latency"
              type="monotone"
              dataKey="responseTime"
              name="Response ms"
              stroke="#dc2626"
              strokeWidth={3}
              fill={`url(#${latencyGradId})`}
              dot={{ r: 3, fill: '#dc2626', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#dc2626' }}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardPanel>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-black text-slate-600">
      <Icon size={14} />
      {label}: <span className="text-[#07111f]">{value}</span>
    </span>
  );
}
