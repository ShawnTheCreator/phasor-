import React, { useState, useEffect } from 'react';

interface CinematicLoaderProps {
  onComplete: () => void;
}

export default function CinematicLoader({ onComplete }: CinematicLoaderProps): JSX.Element | null {
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);

  useEffect(() => {
    // ESC key or click to skip immediately
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

    // Dynamic rapid progression from 0 to 100 in ~1.2s
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerExit();
          return 100;
        }
        const step = Math.floor(Math.random() * 20) + 14;
        const next = Math.min(100, prev + step);
        if (next === 100) {
          clearInterval(interval);
          setTimeout(triggerExit, 120);
        }
        return next;
      });
    }, 95);

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
    }, 450); // Fast exit transition so the hero pop triggers immediately
  };

  if (isRemoved) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#1c1e22', // Tactile grainy gray background
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.03)' : 'scale(1)',
        filter: isExiting ? 'blur(8px)' : 'none',
        transition: 'opacity 0.45s ease-out, transform 0.45s ease-out, filter 0.45s ease-out',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
      }}
      title="Click or press ESC to enter immediately"
    >
      {/* SVG Procedural Grain / Film Noise Filter */}
      <svg
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <filter id="grainNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.28 0"
          />
        </filter>
      </svg>

      {/* Grainy Texture Overlay Layer */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          width: '140%',
          height: '140%',
          pointerEvents: 'none',
          filter: 'url(#grainNoise)',
          opacity: 0.85,
        }}
      />

      {/* Subtle Architectural Construction Hairlines on Grainy Gray */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.05,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Central Flowing Red Liquid Number */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Massive Flowing Red Liquid Percentage Readout */}
        <div
          className="flowing-liquid-number"
          style={{
            fontSize: 'clamp(7rem, 22vw, 19rem)',
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: '-0.06em',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background:
              'linear-gradient(-45deg, #450a0a 0%, #991b1b 20%, #f5242e 45%, #ff3b30 65%, #940a14 85%, #dc2626 100%)',
            backgroundSize: '350% 350%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'flowingRedLiquid 2.8s ease infinite',
            filter: 'drop-shadow(0 0 45px rgba(239, 68, 68, 0.55))',
            fontVariantNumeric: 'tabular-nums',
            display: 'inline-block',
          }}
        >
          {progress < 10 ? `0${progress}` : progress}
          <span
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 6rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginLeft: '4px',
              opacity: 0.9,
            }}
          >
            %
          </span>
        </div>

        {/* Technical Sub-Tag with Glowing Indicator */}
        <div
          style={{
            marginTop: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            letterSpacing: '0.14em',
            color: 'rgba(255, 255, 255, 0.65)',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 10px #ef4444',
              display: 'inline-block',
            }}
          />
          <span>
            {progress < 40
              ? 'CALIBRATING DSCOVR L1 STREAM'
              : progress < 85
              ? 'COMPUTING KAAPVAAL MT TENSOR'
              : 'SPACE WEATHER SHIELD ONLINE'}
          </span>
        </div>
      </div>

      {/* Subtle Escape Key Callout on Grainy Gray */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '0.72rem',
          color: 'rgba(255, 255, 255, 0.55)',
          letterSpacing: '0.04em',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 800,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '2px 7px',
            borderRadius: '4px',
            color: '#ffffff',
          }}
        >
          ESC
        </span>
        <span>or click anywhere to skip</span>
      </div>

      <style>{`
        @keyframes flowingRedLiquid {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
