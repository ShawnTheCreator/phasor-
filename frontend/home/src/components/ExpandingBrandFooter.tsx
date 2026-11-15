import React, { useEffect, useRef, useState } from 'react';

interface ExpandingBrandFooterProps {
  dashboardUrl: string;
  onOpenDemo: () => void;
}

// Vector path for uppercase Phi (Φ)
const UPPERCASE_PHI_PATH =
  'M 20.08,4.0 L 43.8,4.0 L 43.8,5.49 L 41.31,5.61 L 39.95,5.99 L 38.33,6.86 L 36.84,8.47 L 36.1,10.21 L 35.85,11.82 L 35.97,11.95 L 39.2,12.07 L 39.33,12.2 L 40.94,12.32 L 44.04,12.94 L 47.77,14.18 L 50.5,15.55 L 53.36,17.66 L 55.22,19.52 L 57.45,22.63 L 58.45,24.61 L 59.57,28.09 L 59.57,28.83 L 59.81,29.83 L 59.81,31.81 L 59.94,31.94 L 59.81,32.06 L 59.81,34.17 L 59.32,36.78 L 58.32,39.64 L 57.21,41.75 L 56.09,43.36 L 53.23,46.34 L 51.74,47.58 L 47.89,49.82 L 45.53,50.69 L 41.44,51.68 L 39.57,51.8 L 39.45,51.93 L 35.97,52.05 L 35.85,52.18 L 35.97,53.29 L 36.47,54.78 L 37.34,56.15 L 38.58,57.27 L 40.44,58.14 L 42.43,58.51 L 43.8,58.51 L 43.8,60.0 L 43.67,60.0 L 20.08,60.0 L 20.08,58.51 L 21.45,58.51 L 23.43,58.14 L 24.43,57.76 L 25.67,57.02 L 26.78,55.9 L 27.53,54.54 L 27.9,53.42 L 28.03,52.18 L 27.9,52.05 L 26.66,52.05 L 26.54,51.93 L 23.43,51.8 L 21.2,51.31 L 20.58,51.31 L 17.35,50.31 L 14.12,48.82 L 12.38,47.71 L 10.52,46.22 L 8.78,44.48 L 6.67,41.62 L 5.55,39.51 L 4.56,36.66 L 4.19,34.79 L 4.19,34.05 L 4.06,33.92 L 4.19,29.21 L 4.93,25.73 L 5.68,23.87 L 6.55,22.25 L 7.66,20.64 L 10.64,17.66 L 12.51,16.29 L 15.73,14.55 L 18.22,13.56 L 20.82,12.82 L 23.31,12.32 L 27.9,11.95 L 28.03,11.82 L 28.03,11.2 L 27.53,9.34 L 26.91,8.22 L 26.04,7.23 L 25.05,6.48 L 23.18,5.74 L 21.94,5.49 L 20.08,5.49 L 20.08,4.0 Z M 27.28,14.18 L 26.16,14.18 L 26.04,14.31 L 24.67,14.43 L 22.07,15.18 L 19.09,16.67 L 17.6,17.78 L 15.86,19.65 L 14.74,21.51 L 13.75,24.24 L 13.25,26.6 L 13.13,28.34 L 13.0,28.46 L 13.0,29.83 L 12.88,29.95 L 12.88,34.92 L 13.0,35.04 L 13.13,37.15 L 14.0,40.63 L 14.86,42.62 L 16.35,44.85 L 17.84,46.34 L 18.96,47.21 L 19.96,47.83 L 21.94,48.7 L 22.94,49.07 L 25.79,49.69 L 26.54,49.69 L 26.66,49.82 L 27.9,49.82 L 28.03,49.69 L 28.03,14.18 L 27.9,14.06 L 27.28,14.18 Z M 35.85,14.18 L 35.85,49.69 L 35.97,49.82 L 37.46,49.82 L 37.59,49.69 L 39.08,49.57 L 40.69,49.2 L 42.18,48.7 L 42.8,48.33 L 43.55,48.08 L 45.53,46.84 L 48.02,44.48 L 48.64,43.49 L 49.88,40.75 L 50.63,37.9 L 50.63,37.15 L 50.87,36.16 L 50.87,34.92 L 51.0,34.79 L 51.0,32.93 L 51.12,32.81 L 51.12,29.45 L 51.0,29.33 L 51.0,28.21 L 50.87,28.09 L 50.63,25.85 L 50.13,23.87 L 48.89,21.01 L 47.52,19.02 L 45.53,17.16 L 44.04,16.17 L 41.19,14.93 L 37.84,14.18 L 36.72,14.18 L 36.59,14.06 L 35.97,14.06 L 35.85,14.18 Z';

export default function ExpandingBrandFooter({
  dashboardUrl,
  onOpenDemo,
}: ExpandingBrandFooterProps): JSX.Element {
  const footerRef = useRef<HTMLElement | null>(null);
  const [expandProgress, setExpandProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = footerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      // Expand progress: triggers as the footer enters viewport from bottom
      const start = vh * 0.95;
      const end = vh * 0.2;
      if (rect.top >= start) {
        setExpandProgress(0);
      } else if (rect.top <= end) {
        setExpandProgress(1);
      } else {
        const raw = (start - rect.top) / (start - end);
        setExpandProgress(Math.max(0, Math.min(1, raw * raw * (3 - 2 * raw))));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Interpolated scale and width expansion for the formula banner
  const formulaScale = 0.92 + expandProgress * 0.08;
  const formulaGlowOpacity = 0.3 + expandProgress * 0.7;

  return (
    <footer
      ref={footerRef}
      className="expanding-brand-footer"
      style={{
        position: 'relative',
        backgroundColor: '#070a12',
        color: '#f8fafc',
        overflow: 'hidden',
        padding: '90px 0 50px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Background subtle radial gradient from center logo */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.15) 0%, rgba(153, 27, 27, 0.04) 50%, rgba(7, 10, 18, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        className="editorial-container"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* =========================================================================
            1. THE EXPANDING MOLDED GLASS LOGO IN CENTER
            ========================================================================= */}
        <div
          style={{
            transform: `scale(${0.88 + expandProgress * 0.22})`,
            transition: 'transform 0.15s ease-out',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
          onClick={handleScrollTop}
          title="Return to top"
        >
          <svg viewBox="0 0 64 64" width="88" height="88" style={{ filter: 'drop-shadow(0 12px 32px rgba(239, 68, 68, 0.35))' }}>
            <defs>
              <linearGradient id="footerPhiLiquid" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="30%" stopColor="rgba(254, 202, 202, 0.9)" />
                <stop offset="70%" stopColor="#ef4444" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="footerPhiBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.5)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.8)" />
              </linearGradient>
            </defs>
            <path
              d={UPPERCASE_PHI_PATH}
              fillRule="evenodd"
              fill="url(#footerPhiLiquid)"
              stroke="url(#footerPhiBevel)"
              strokeWidth="0.8"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <h2
          style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '0.22em',
            color: '#ffffff',
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
          }}
        >
          PHASOR
        </h2>

        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.65)',
            maxWidth: '620px',
            lineHeight: 1.6,
            margin: '0 0 36px 0',
          }}
        >
          Solar superstorm early warning & geomagnetic induction forecasting. Fusing L1 DSCOVR space plasma with 1D lithospheric impedance.
        </p>

        {/* =========================================================================
            2. THE EXPANDING FORMULA BANNER
            ========================================================================= */}
        <div
          style={{
            width: '100%',
            maxWidth: '820px',
            transform: `scale(${formulaScale})`,
            transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '24px 28px',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 8px 32px rgba(239, 68, 68, ${0.12 * formulaGlowOpacity}), 0 1px 2px rgba(0,0,0,0.4)`,
            marginBottom: '44px',
          }}
        >
          {/* Formula Header Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
              ▾ INDUCTION GOVERNING EQUATIONS
            </span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
              KAAPVAAL MT 1D &bull; R² = 0.961
            </span>
          </div>

          {/* Mathematical Formulations */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px', fontFamily: 'serif' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.28rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                &nabla; &times; E = &minus;&part;B / &part;t
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', marginTop: '4px' }}>
                Faraday Induction
              </span>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.28rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                &Phi;<sub>B</sub> = &iint; B &sdot; dA
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', marginTop: '4px' }}>
                Magnetic Flux & Phasor Angle
              </span>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.28rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                E(&omega;) = &mu;<sub>0</sub><sup>&minus;1</sup> Z(&omega;) (z&#770; &times; B)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', marginTop: '4px' }}>
                Wait (1962) Surface Impedance
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-hero-red"
            style={{ padding: '12px 26px', fontSize: '0.94rem', textDecoration: 'none' }}
          >
            Launch Live Operations ↗
          </a>
          <button
            onClick={onOpenDemo}
            className="btn-pill-glass"
            style={{ padding: '12px 22px', fontSize: '0.94rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff' }}
          >
            Book Operator Briefing
          </button>
          <a
            href={`${dashboardUrl}/login`}
            target="_blank"
            rel="noreferrer"
            className="btn-pill-glass"
            style={{ padding: '12px 22px', fontSize: '0.94rem', textDecoration: 'none', color: '#ffffff' }}
          >
            Operator Sign In ↗
          </a>
        </div>

        {/* Bottom Line Bar */}
        <div
          style={{
            width: '100%',
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.84rem',
            color: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            <span>NOAA/DSCOVR L1 Stream Active &bull; Hermanus (HER) Magnetometer Online</span>
          </div>

          <p style={{ margin: 0 }}>
            &copy; 2026 Phasor &bull; NASA International Space Apps Challenge &bull; All Rights Reserved.
          </p>

          <a
            href="#"
            onClick={handleScrollTop}
            style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Back to top</span>
            <span>&uarr;</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
