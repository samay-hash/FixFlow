import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { Activity, Terminal, AlertTriangle, Cpu, Server, Play, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LogIntelligence() {
  const [logs, setLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const analyzeLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs/analyze');
      setLogs(res.data.logs || []);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeLogs();
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: '#F2EDE4' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5"
                style={{ background: '#0A0A0A', color: '#C8FF00', border: '2px solid #0A0A0A' }}>
                // GEMINI INTELLIGENCE
              </span>
            </div>
            <h1 className="text-4xl font-black uppercase leading-none" style={{ color: '#0A0A0A' }}>
              Log Intelligence
            </h1>
            <p className="font-bold text-sm mt-2" style={{ color: '#666' }}>
              Live EC2 agent ingestion & AI-powered anomaly detection
            </p>
          </div>
          <button 
            onClick={analyzeLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 font-black uppercase text-sm"
            style={{ 
              background: '#0050FF', color: 'white', 
              border: '3px solid #0A0A0A', boxShadow: '4px 4px 0 #0A0A0A',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Activity size={16} className="animate-spin" /> : <Play size={16} />}
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        {/* ── AI Terminal Box ─────────────────────────────── */}
        <div className="mb-8" style={{ border: '4px solid #0A0A0A', boxShadow: '8px 8px 0 #0A0A0A', background: '#0A0A0A', borderRadius: '4px', overflow: 'hidden' }}>
          
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '2px solid #333' }}>
            <div className="flex items-center gap-2">
              <Terminal size={16} style={{ color: '#C8FF00' }} />
              <span className="font-mono text-xs font-bold tracking-widest" style={{ color: '#888' }}>root@fixflow-ai:~</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#FF2D78' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: '#FFE500' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: '#00D1FF' }}></div>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 font-mono text-sm leading-relaxed" style={{ color: '#00FF41', minHeight: '200px' }}>
            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="flex items-center gap-3 text-white">
                  <Activity size={16} className="animate-spin" /> Fetching latest server logs...
                </div>
                <div className="flex items-center gap-3" style={{ color: '#C8FF00' }}>
                  <Cpu size={16} className="animate-spin" /> Gemini AI compiling system analysis...
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                
                {/* Summary */}
                <div>
                  <span className="text-white font-bold opacity-50 block mb-1"># SYSTEM_SUMMARY</span>
                  <p className="text-white text-base leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Anomalies */}
                {analysis.anomalies && analysis.anomalies.length > 0 ? (
                  <div>
                    <span className="font-bold opacity-50 block mb-2" style={{ color: '#FF2D78' }}># DETECTED_ANOMALIES</span>
                    <ul className="space-y-2">
                      {analysis.anomalies.map((anom, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle size={14} className="mt-1 flex-shrink-0" style={{ color: '#FF2D78' }} />
                          <span style={{ color: '#FFB3C6' }}>{anom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-400">
                    <ShieldCheck size={16} /> No critical anomalies detected. System is healthy.
                  </div>
                )}

                {/* AI Fix Script */}
                {analysis.fix && (
                  <div className="mt-6">
                    <span className="font-bold opacity-50 block mb-2" style={{ color: '#00D1FF' }}># AI_REMEDIATION_SCRIPT</span>
                    <div className="p-4 rounded bg-black/50" style={{ border: '1px solid #333' }}>
                      <code className="text-blue-300 font-bold whitespace-pre-wrap">
                        {analysis.fix}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/50">No analysis available. Click "Run Analysis".</div>
            )}
            <div className="mt-4 flex items-center gap-2 opacity-50">
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>

        {/* ── Raw Logs Grid ───────────────────────────────── */}
        <h2 className="text-xl font-black uppercase mb-4" style={{ color: '#0A0A0A' }}>Raw Agent Logs (Last 100)</h2>
        <div style={{ border: '3px solid #0A0A0A', boxShadow: '6px 6px 0 #0A0A0A', background: 'white' }}>
          {logs.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <Server size={32} className="mx-auto mb-4 opacity-20" style={{ color: '#0A0A0A' }} />
              <p className="font-bold text-lg" style={{ color: '#0A0A0A' }}>No agent logs received yet</p>
              <p className="text-sm font-medium mt-2" style={{ color: '#666' }}>
                Run the <code>fixflow-agent.sh</code> script on your EC2 instance to stream logs here.
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="w-full text-left">
                <thead style={{ position: 'sticky', top: 0, background: '#0A0A0A', color: 'white' }}>
                  <tr>
                    <th className="px-4 py-3 font-bold text-xs tracking-widest uppercase">Level</th>
                    <th className="px-4 py-3 font-bold text-xs tracking-widest uppercase">Time</th>
                    <th className="px-4 py-3 font-bold text-xs tracking-widest uppercase">Source</th>
                    <th className="px-4 py-3 font-bold text-xs tracking-widest uppercase">Message</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs font-bold" style={{ 
                          background: log.level === 'ERROR' || log.level === 'FATAL' ? '#FF2D78' : 
                                     log.level === 'WARN' ? '#FFE500' : '#D0E0FF',
                          color: log.level === 'WARN' || log.level === 'INFO' ? '#0A0A0A' : 'white',
                          border: '2px solid #0A0A0A'
                        }}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="px-4 py-3 font-bold">{log.source}</td>
                      <td className="px-4 py-3 text-gray-800">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
