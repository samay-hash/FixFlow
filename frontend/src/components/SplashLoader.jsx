import { useState, useEffect } from 'react';
import { Shield, Activity } from 'lucide-react';

const LOADING_STEPS = [
  'Initializing FixFlow Engine...',
  'Connecting to live monitors...',
  'Loading AI services...',
  'Ready.',
];

export default function SplashLoader({ onDone }) {
  const [step, setStep] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const steps = LOADING_STEPS.length;
    const perStep = 550;

    const interval = setInterval(() => {
      setStep(prev => {
        const next = prev + 1;
        setBarWidth(Math.round((next / steps) * 100));
        if (next >= steps) {
          clearInterval(interval);
          setTimeout(() => {
            setFading(true);
            setTimeout(onDone, 600);
          }, 400);
        }
        return next;
      });
    }, perStep);

    // Animate bar continuously
    requestAnimationFrame(() => setBarWidth(Math.round((1 / steps) * 100)));

    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0A0A0A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
        backgroundImage: 'radial-gradient(circle, #FF8C4208 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Logo block */}
      <div style={{
        animation: 'splashLogoIn 0.7s cubic-bezier(0.22,1,0.36,1) both',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72,
          background: '#FF8C42',
          border: '4px solid #FF8C42',
          boxShadow: '8px 8px 0 #FF2D78',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'splashPulse 1.8s ease-in-out infinite',
        }}>
          <Shield size={36} color="#0A0A0A" />
        </div>

        {/* Brand name */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900, fontSize: 36,
            color: '#F0EBE0',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Fix<span style={{ color: '#FF8C42' }}>Flow</span>
          </h1>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11, color: '#666',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            Smart Incident Monitoring & Response
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: 280, marginTop: 12 }}>
          <div style={{
            height: 4,
            background: '#1A1A1A',
            border: '1px solid #333',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${barWidth}%`,
              background: 'linear-gradient(90deg, #FF8C42, #FF2D78)',
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>

          {/* Step text */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
          }}>
            <Activity size={11} color="#FF8C42" style={{ flexShrink: 0 }} />
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, color: '#FF8C42',
              margin: 0, letterSpacing: '0.05em',
              animation: 'stepTextIn 0.3s ease both',
              key: step,
            }}>
              {LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)]}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom badge */}
      <div style={{
        position: 'absolute', bottom: 32,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 10, color: '#333',
        letterSpacing: '0.15em', textTransform: 'uppercase',
      }}>
        AI-Powered · v1.0.0 · 2026
      </div>

      <style>{`
        @keyframes splashLogoIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes splashPulse {
          0%, 100% { box-shadow: 8px 8px 0 #FF2D78; }
          50%       { box-shadow: 10px 10px 0 #5500CC; }
        }
        @keyframes stepTextIn {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
