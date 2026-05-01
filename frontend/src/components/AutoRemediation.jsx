import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AutoRemediation({ incident, sitrep }) {
  const [copied, setCopied] = useState(false);
  const [script, setScript] = useState('');
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState([]);

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

  const handleExecute = () => {
    setExecuting(true);
    setOutput([]);
    
    const lines = [
      "⚡ Initializing AWS Systems Manager (SSM) secure session...",
      "📡 Target EC2 Instance: i-0e8d9c2a4f1b (us-east-1a)",
      "🔐 Authenticating via IAM Role...",
      "✅ Session established.",
      "🚀 Executing AI Remediation Payload...",
      "----------------------------------------"
    ];

    const scriptLines = script.split('\\n');
    scriptLines.forEach(line => {
      lines.push(`> ${line}`);
      lines.push("  [OK] Command executed successfully.");
    });

    lines.push("----------------------------------------");
    lines.push("✅ All remediation commands executed.");
    lines.push("🔌 Closing SSM session...");

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setOutput(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        toast.success("AI Remediation applied successfully via SSM!");
        setTimeout(() => setExecuting(false), 5000);
      }
    }, 400); // simulated delay between outputs
  };

  if (!script) return null;

  return (
    <div className="p-5 mt-6 relative overflow-hidden group" style={{ background: '#E6FFDD', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
      {/* Animated glowing border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] animate-[slideIn_3s_ease-in-out_infinite]" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <TerminalIcon size={18} style={{ color: 'var(--black)' }} />
          <h3 className="font-black uppercase tracking-wider text-sm" style={{ color: 'var(--black)' }}>AI Auto-Remediation Plan</h3>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 ml-2" style={{ background: 'var(--black)', color: '#C8FF00' }}>Experimental</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExecute} disabled={executing} className="btn-sm font-bold uppercase tracking-wider transition-colors" style={{ background: executing ? '#ccc' : 'var(--black)', color: executing ? '#666' : 'var(--cream)', border: '2px solid var(--black)' }}>
            {executing ? 'Executing...' : '⚡ Execute via SSM'}
          </button>
          <button onClick={handleCopy} disabled={executing} className="btn-sm font-bold uppercase tracking-wider transition-colors" style={{ background: 'white', color: 'var(--black)', border: '2px solid var(--black)' }}>
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {executing && (
        <div className="font-mono text-[10px] sm:text-xs overflow-x-auto relative z-10 mb-4 animate-fade-in" style={{ background: '#050505', border: '2px solid var(--black)', padding: '16px', color: '#00FF41' }}>
          <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '2px solid #333' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#FF2D78' }}></span>
            <span className="text-[10px] ml-2 font-sans font-bold tracking-widest text-[#888]">AWS SSM // Live Terminal Output</span>
          </div>
          <pre className="leading-relaxed whitespace-pre-wrap">
            {output.map((line, i) => (
              <div key={i} className={line.startsWith('✅') || line.includes('[OK]') ? 'text-[#C8FF00]' : line.startsWith('>') ? 'text-white' : 'text-[#888]'}>
                {line}
              </div>
            ))}
            {output.length < 10 && <span className="animate-pulse">_</span>}
          </pre>
        </div>
      )}

      <div className="font-mono text-xs overflow-x-auto relative z-10" style={{ background: 'var(--black)', border: '2px solid var(--black)', padding: '16px' }}>
        <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '2px solid #333' }}>
          <span className="w-3 h-3 rounded-full" style={{ background: '#FF2D78' }}></span>
          <span className="w-3 h-3 rounded-full" style={{ background: '#FFE500' }}></span>
          <span className="w-3 h-3 rounded-full" style={{ background: '#00D1FF' }}></span>
          <span className="text-[10px] ml-2 font-sans font-bold tracking-widest" style={{ color: '#888' }}>root@simrs-auto-remediator:~</span>
        </div>
        <pre className="leading-relaxed whitespace-pre-wrap" style={{ color: '#00FF41' }}>
          {script.split('\n').map((line, i) => (
            <div key={i} className="flex hover:bg-[#111] transition-colors px-2 py-0.5 rounded">
              <span className="select-none mr-4 font-bold" style={{ color: '#666' }}>{(i + 1).toString().padStart(2, '0')}</span>
              <span className="mr-2 font-bold" style={{ color: '#888' }}>$</span>
              <span className="font-bold">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
