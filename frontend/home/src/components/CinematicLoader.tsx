import React, { useState, useEffect } from 'react';

interface CinematicLoaderProps {
  onComplete: () => void;
}

export default function CinematicLoader({ onComplete }: CinematicLoaderProps): JSX.Element | null {
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);

  useEffect(() => {
    // Escape key or click listener to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        skipLoader();
      }
    };

    const handleClick = () => {
      skipLoader();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    // Dynamic telemetry progress increments (finishes in ~1.3s)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerExit();
          return 100;
        }
        const jump = Math.floor(Math.random() * 22) + 12;
        const next = Math.min(100, prev + jump);
        if (next === 100) {
          clearInterval(interval);
          setTimeout(triggerExit, 160);
        }
        return next;
      });
    }, 110);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const skipLoader = () => {
    setProgress(100);
    triggerExit();
  };

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsRemoved(true);
      onComplete();
    }, 700); // matches CSS exit transition duration
  };

  if (isRemoved) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#05070c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.04)' : 'scale(1)',
        filter: isExiting ? 'blur(10px)' : 'none',
        transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), filter 0.65s ease',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '24px',
        boxSizing: 'border-box',
      }}
      title="Click or press ESC to enter immediately"
    >
      {/* Background Architectural Grid Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.06,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Centerpiece: Glowing Molded Glass Phi Logo */}
      <div
        style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulsing Sonar Ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-18px',
            borderRadius: '50%',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            animation: 'sonarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />

        {/* Squircle Badge */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 60%, #450a0a 100%)',
            border: '1px solid rgba(248, 113, 113, 0.5)',
            boxShadow: '0 0 35px rgba(220, 38, 38, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Classical Phi Glyph */}
          <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
            <line x1="32" y1="8" x2="32" y2="56" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="22" y1="9" x2="42" y2="9" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="22" y1="55" x2="42" y2="55" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="32" r="14" stroke="#ffffff" strokeWidth="5" />
          </svg>
        </div>
      </div>

      {/* Brand Title & System Header */}
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '0.18em',
            color: '#ffffff',
            textTransform: 'uppercase',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          P H A S O R
        </h1>
        <div
          style={{
            marginTop: '6px',
            fontSize: '0.74rem',
            letterSpacing: '0.12em',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}
        >
          Planetary Space Weather Defense System
        </div>
      </div>

      {/* Precision Progress Bar */}
      <div
        style={{
          width: '240px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '14px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#ef4444',
            boxShadow: '0 0 12px #ef4444',
            borderRadius: '4px',
            transition: 'width 0.12s ease-out',
          }}
        />
      </div>

      {/* Progress Telemetry Readout */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '240px',
          fontSize: '0.72rem',
          fontFamily: 'monospace',
          color: 'rgba(255, 255, 255, 0.65)',
        }}
      >
        <span>
          {progress < 40
            ? 'INITIALIZING L1 SATELLITE...'
            : progress < 85
            ? 'COMPUTING MT IMPEDANCE...'
            : 'GRID SHIELD READY'}
        </span>
        <span style={{ color: '#ef4444', fontWeight: 700 }}>{progress}%</span>
      </div>

      {/* Escape / Skip Prompt Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          fontSize: '0.72rem',
          color: 'rgba(255, 255, 255, 0.65)',
          letterSpacing: '0.04em',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 800,
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            padding: '1px 6px',
            borderRadius: '4px',
            color: '#ffffff',
          }}
        >
          ESC
        </span>
        <span>or click anywhere to enter</span>
      </div>

      <style>{`
        @keyframes sonarPing {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
