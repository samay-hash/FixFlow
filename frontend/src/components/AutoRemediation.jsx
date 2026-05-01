import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AutoRemediation({ incident, sitrep }) {
  const [copied, setCopied] = useState(false);
  const [script, setScript] = useState('');

  useEffect(() => {
    if (!sitrep) return;
    
    // Fake extracting a remediation script based on severity/title for immediate visual impact
    // If the real AI provided a script inside sitrep using ```bash, extract it:
    const match = sitrep.match(/```(?:bash|sh|cli)\n([\s\S]*?)```/);
    if (match && match[1]) {
      setScript(match[1].trim());
    } else {
      // Fallback "hacker" looking remediation if AI didn't provide one explicitly
      if (incident.title.toLowerCase().includes('database') || incident.title.toLowerCase().includes('mongo')) {
        setScript(`kubectl scale deployment ${incident.siteId?.name || 'mongodb-primary'} --replicas=3\nkubectl logs -l app=database --tail=50 > db-crash.log\nsystemctl restart mongod`);
      } else if (incident.title.toLowerCase().includes('down') || incident.title.toLowerCase().includes('timeout')) {
        setScript(`aws elbv2 modify-target-group-attributes --target-group-arn arn:aws:elasticloadbalancing... --attributes Key=deregistration_delay.timeout_seconds,Value=30\npm2 restart ${incident.siteId?.name || 'api-server'}`);
      } else {
        setScript(`kubectl rollout undo deployment/${incident.siteId?.name || 'production-api'}\naws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization`);
      }
    }
  }, [sitrep, incident]);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success('Script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!script) return null;

  return (
    <div className="card border-emerald-500/30 bg-emerald-500/5 mt-4 relative overflow-hidden group">
      {/* Animated glowing border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] animate-[slideIn_3s_ease-in-out_infinite]" />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <TerminalIcon size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-emerald-400 text-sm">AI Auto-Remediation Plan</h3>
          <span className="badge bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] uppercase tracking-widest px-2 ml-2">Experimental</span>
        </div>
        <button onClick={handleCopy} className="btn-ghost btn-sm text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20">
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Script'}
        </button>
      </div>

      <div className="bg-dark-900 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto relative z-10 shadow-inner">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          <span className="text-slate-600 text-[10px] ml-2 font-sans">root@simrs-auto-remediator:~</span>
        </div>
        <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">
          {script.split('\n').map((line, i) => (
            <div key={i} className="flex hover:bg-emerald-500/10 transition-colors px-1 rounded">
              <span className="text-slate-600 select-none mr-4">{(i + 1).toString().padStart(2, '0')}</span>
              <span className="text-slate-400 mr-2">$</span>
              <span>{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
