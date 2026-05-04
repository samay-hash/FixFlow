import { useEffect, useState } from 'react';
import { Activity, Bell, CheckCircle2, Shield, Sparkles } from 'lucide-react';

const LOADING_STEPS = [
  'Preparing monitors',
  'Connecting incident signals',
  'Warming up AI analysis',
  'Ready to respond',
];

interface SplashLoaderProps {
  onDone: () => void;
}

export default function SplashLoader({ onDone }: SplashLoaderProps) {
  const [step, setStep] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const steps = LOADING_STEPS.length;
    const perStep = 520;

    requestAnimationFrame(() => setBarWidth(Math.round((1 / steps) * 100)));

    const interval = setInterval(() => {
      setStep((prev) => {
        const next = prev + 1;
        setBarWidth(Math.round((Math.min(next + 1, steps) / steps) * 100));

        if (next >= steps - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setFading(true);
            setTimeout(onDone, 520);
          }, 420);
        }

        return Math.min(next, steps - 1);
      });
    }, perStep);

    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #ffffff 0%, #fff7ef 48%, #f8fafc 100%)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.52s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-18%',
          right: '-8%',
          width: 460,
          height: 460,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,79,10,0.18) 0%, rgba(255,79,10,0.07) 42%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.13) 0%, rgba(14,165,233,0.06) 45%, transparent 72%)',
          filter: 'blur(10px)',
        }}
      />

      <div
        style={{
          width: 'min(92vw, 460px)',
          animation: 'loaderIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            margin: '0 auto 24px',
            width: 76,
            height: 76,
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#07111f',
            color: '#ff4f0a',
            boxShadow: '0 24px 55px rgba(7,17,31,0.18)',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: 30,
              border: '1px solid rgba(255,79,10,0.22)',
              animation: 'loaderRing 1.8s ease-in-out infinite',
            }}
          />
          <Shield size={34} strokeWidth={2.4} />
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: '"Instrument Serif", serif',
            fontSize: 'clamp(44px, 11vw, 68px)',
            lineHeight: 0.9,
            letterSpacing: 0,
            color: '#07111f',
            fontWeight: 700,
          }}
        >
          FixFlow <span style={{ color: '#ff4f0a' }}>AI</span>
        </h1>

        <p
          style={{
            margin: '18px auto 0',
            maxWidth: 360,
            color: '#64748b',
            fontSize: 15,
            lineHeight: 1.7,
            fontWeight: 700,
          }}
        >
          Loading your incident response workspace
        </p>

        <div
          style={{
            marginTop: 34,
            padding: 16,
            border: '1px solid rgba(226,232,240,0.95)',
            borderRadius: 18,
            background: 'rgba(255,255,255,0.82)',
            boxShadow: '0 18px 45px rgba(80,55,40,0.08)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: '#e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${barWidth}%`,
                height: '100%',
                borderRadius: 999,
                background:
                  'linear-gradient(90deg, #ff4f0a 0%, #fb923c 54%, #7c3aed 100%)',
                transition: 'width 0.48s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div
              key={step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                color: '#07111f',
                fontSize: 13,
                fontWeight: 900,
                animation: 'stepIn 0.28s ease both',
              }}
            >
              <Activity size={15} color="#ff4f0a" />
              {LOADING_STEPS[step]}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {[Bell, Sparkles, CheckCircle2].map((Icon, index) => (
                <span
                  key={index}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: index <= step - 1 ? '#fff1e8' : '#f8fafc',
                    color: index <= step - 1 ? '#ff4f0a' : '#94a3b8',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Icon size={14} />
                </span>
              ))}
            </div>
          </div>
        </div>

        <p
          style={{
            marginTop: 22,
            color: '#94a3b8',
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0,
          }}
        >
          AI-powered monitoring and response
        </p>
      </div>

      <style>{`
        @keyframes loaderIn {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes loaderRing {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.08); opacity: 0.35; }
        }

        @keyframes stepIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
