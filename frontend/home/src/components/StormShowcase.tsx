import React, { useEffect, useState, useRef } from 'react';
import FallingWires from './FallingWires';

interface StormEvent {
  id: string;
  num: string;
  title: string;
  description: string;
  articleTag: string;
  kpiStats: string[];
  reportUrl: string;
  headlineQuote: string;
  accentColor: string;
  visualType: 'cme-solar' | 'grid-blackout' | 'xflare-soho';
}

const STORMS: StormEvent[] = [
  {
    id: 'may2024',
    num: '01',
    title: 'May 2024 "Gannon" Superstorm (G5)',
    description:
      '5 cannibal CMEs triggered the highest peak GICs in NERC\'s post-2013 database across 397+ monitors, pushing grid transformers toward half-cycle saturation.',
    articleTag: 'NOAA SWPC &bull; NERC GMD TECHNICAL REVIEW',
    kpiStats: ['Dst: -412 nT', 'Kp: 9.0 Extreme', '397+ GIC Monitors'],
    headlineQuote: '5 Cannibal CMEs & Highest Modern GIC Peaks',
    accentColor: '#ef4444',
    reportUrl: 'https://www.nerc.com/globalassets/programs/rapa/gmd/reference-documents/may-2024-gmd-event-review.pdf',
    visualType: 'cme-solar',
  },
  {
    id: 'quebec1989',
    num: '02',
    title: 'March 1989 Québec 735kV Collapse',
    description:
      'Collapsed the entire Hydro-Québec 735 kV grid in 92 seconds, leaving 6 million people in the dark for over 9 hours after transformer neutrals were flooded with quasi-DC currents.',
    articleTag: 'NASA HELIOPHYSICS &bull; HYDRO-QUÉBEC ARCHIVE',
    kpiStats: ['92 Seconds to Blackout', '6 Million Affected', '9-Hour Collapse'],
    headlineQuote: 'The Day the Sun Brought Down the Grid',
    accentColor: '#38bdf8',
    reportUrl: 'https://science.nasa.gov/science-research/heliophysics/the-day-the-sun-brought-down-the-grid/',
    visualType: 'grid-blackout',
  },
  {
    id: 'halloween2003',
    num: '03',
    title: 'October 2003 Halloween Storms',
    description:
      'Massive X17.2 solar flare produced Malmö Sweden transformer harmonic tripping and a 50,000-customer blackout, destroying high-voltage assets in Europe and North America.',
    articleTag: 'NASA SOHO &bull; IEEE POWER ARCHIVE',
    kpiStats: ['X17.2 Megaflare', 'Malmö 130kV Tripped', '50,000 In The Dark'],
    headlineQuote: 'X17 Solar Flare & Swedish Grid Harmonic Failure',
    accentColor: '#f59e0b',
    reportUrl: 'https://ieeexplore.ieee.org/document/4282054',
    visualType: 'xflare-soho',
  },
];

interface StormShowcaseProps {
  dashboardUrl?: string;
}

export default function StormShowcase({ dashboardUrl }: StormShowcaseProps): JSX.Element {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [pinMode, setPinMode] = useState<'top' | 'fixed' | 'bottom'>('top');

  useEffect(() => {
    const handleScroll = (): void => {
      const el = runwayRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      if (rect.top > 0) {
        setPinMode('top');
        setProgress(0);
      } else if (rect.bottom < window.innerHeight) {
        setPinMode('bottom');
        setProgress(1);
      } else {
        setPinMode('fixed');
        const current = Math.min(1, Math.max(0, -rect.top / totalScrollable));
        setProgress(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let slidePos = 0;
  if (progress <= 0.22) {
    slidePos = 0;
  } else if (progress <= 0.46) {
    const t = (progress - 0.22) / (0.46 - 0.22);
    const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
    slidePos = ease * 1;
  } else if (progress <= 0.68) {
    slidePos = 1;
  } else if (progress <= 0.92) {
    const t = (progress - 0.68) / (0.92 - 0.68);
    const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
    slidePos = 1 + ease * 1;
  } else {
    slidePos = 2;
  }

  const currentStormIdx = Math.min(2, Math.max(0, Math.round(slidePos)));

  return (
    <div ref={runwayRef} className="pinned-storm-runway">
      {/* 100% Stagnant Viewport while user scrolls through the carousel */}
      <div className={`pinned-storm-viewport mode-${pinMode}`}>
        {/* Overhead high-voltage wires falling from left & right */}
        <FallingWires />

        <div className="pinned-storm-inner-container">
          {/* Section Header */}
          <div className="editorial-header storm-carousel-header">
            <div className="editorial-pill-marker" />
            <h2 className="editorial-title">Validated on extreme storms</h2>
          </div>

          {/* Minimalist Split Stage */}
          <div className="storm-carousel-stage-wrapper">
            <div className="storm-carousel-stage">
              {STORMS.map((storm, idx) => {
                const offset = (idx - slidePos) * 110;
                const isCurrent = Math.abs(slidePos - idx) < 0.5;
                const isVisible = Math.abs(slidePos - idx) < 1.15;
                const opacity = Math.max(0, 1 - Math.abs(slidePos - idx) * 1.5);

                return (
                  <div
                    key={storm.id}
                    className="storm-carousel-slide"
                    style={{
                      transform: `translateX(${offset}%)`,
                      opacity: opacity,
                      visibility: isVisible ? 'visible' : 'hidden',
                      pointerEvents: isCurrent ? 'auto' : 'none',
                    }}
                  >
                    <div className="simple-storm-card">
                      {/* Left: Rich Scientific Article Dossier Picture & Live Telemetry Graphic */}
                      <div
                        className="simple-storm-media"
                        style={{
                          backgroundColor: '#070b14',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '24px',
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* Background SVG Scientific Visualization */}
                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                          {storm.visualType === 'cme-solar' && (
                            <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
                              <defs>
                                <radialGradient id="sunGlow" cx="20%" cy="50%" r="75%">
                                  <stop offset="0%" stopColor="#ffedd5" />
                                  <stop offset="25%" stopColor="#f97316" />
                                  <stop offset="60%" stopColor="#dc2626" />
                                  <stop offset="100%" stopColor="#070b14" />
                                </radialGradient>
                              </defs>
                              <circle cx="60" cy="120" r="140" fill="url(#sunGlow)" opacity="0.9" />
                              {/* Plasma Ejection Arcs */}
                              <path d="M 60 70 C 180 30, 260 90, 380 130" stroke="#fba742" strokeWidth="2.5" fill="none" opacity="0.75" />
                              <path d="M 60 120 C 160 100, 290 140, 390 160" stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.85" />
                              <path d="M 60 160 C 200 210, 280 170, 390 190" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />
                              {/* Earth Target Silhouette */}
                              <circle cx="360" cy="150" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                            </svg>
                          )}

                          {storm.visualType === 'grid-blackout' && (
                            <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
                              <defs>
                                <linearGradient id="auroralWave" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#070b14" />
                                </linearGradient>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#auroralWave)" />
                              {/* 735kV Transmission Pylon Silhouette */}
                              <path d="M 120 230 L 140 110 L 160 230 M 110 130 L 170 130 M 125 160 L 155 160" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" />
                              <path d="M 240 230 L 260 110 L 280 230 M 230 130 L 290 130 M 245 160 L 275 160" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" />
                              {/* Tripped Transmission Lines with Spark Warning */}
                              <path d="M 140 110 Q 200 145 260 110" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
                              <circle cx="200" cy="128" r="8" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" />
                              <line x1="200" y1="124" x2="200" y2="132" stroke="#ffffff" strokeWidth="1.5" />
                              <line x1="196" y1="128" x2="204" y2="128" stroke="#ffffff" strokeWidth="1.5" />
                            </svg>
                          )}

                          {storm.visualType === 'xflare-soho' && (
                            <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
                              <defs>
                                <radialGradient id="sohoCoronagraph" cx="50%" cy="50%" r="60%">
                                  <stop offset="0%" stopColor="#070b14" />
                                  <stop offset="25%" stopColor="#1e3a8a" />
                                  <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#070b14" />
                                </radialGradient>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#sohoCoronagraph)" opacity="0.85" />
                              {/* Occulting Disk */}
                              <circle cx="200" cy="120" r="38" fill="#090d16" stroke="#f59e0b" strokeWidth="2" />
                              {/* Halo Shockwave Expansion */}
                              <circle cx="200" cy="120" r="80" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" opacity="0.75" />
                              <circle cx="200" cy="120" r="115" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                            </svg>
                          )}
                        </div>

                        {/* Top Archive Badge */}
                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              padding: '3px 9px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.18)',
                              color: '#ffffff',
                              backdropFilter: 'blur(8px)',
                            }}
                            dangerouslySetInnerHTML={{ __html: storm.articleTag }}
                          />
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              color: storm.accentColor,
                            }}
                          >
                            NO.{storm.num}
                          </span>
                        </div>

                        {/* Bottom Headline Quote & Real KPI Pills */}
                        <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
                          <h4
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              margin: '0 0 10px 0',
                              letterSpacing: '-0.02em',
                              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                            }}
                          >
                            &ldquo;{storm.headlineQuote}&rdquo;
                          </h4>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {storm.kpiStats.map((kpi, kIdx) => (
                              <span
                                key={kIdx}
                                style={{
                                  fontSize: '0.68rem',
                                  fontFamily: 'monospace',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(7, 11, 20, 0.82)',
                                  border: `1px solid ${storm.accentColor}55`,
                                  color: '#ffffff',
                                  fontWeight: 600,
                                }}
                              >
                                &bull; {kpi}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Clean Minimalist Content (Title, Description, Button) */}
                      <div className="simple-storm-content">
                        <h3 className="simple-storm-title">{storm.title}</h3>
                        <p className="simple-storm-desc">{storm.description}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                          <a
                            href={storm.reportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="simple-storm-btn"
                          >
                            OFFICIAL REPORT ↗
                          </a>
                          {dashboardUrl && (
                            <a
                              href={`${dashboardUrl}/replay`}
                              target="_blank"
                              rel="noreferrer"
                              className="simple-storm-btn"
                              style={{ backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                            >
                              REPLAY THEATRE ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minimalist Scroll Progress Indicator */}
          <div className="simple-storm-progress">
            <span className="simple-progress-num">0{currentStormIdx + 1} / 03</span>
            <div className="simple-progress-bar">
              <div
                className="simple-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, (slidePos / 2) * 100))}%` }}
              />
            </div>
            <span className="simple-progress-hint">
              {slidePos < 1.9 ? 'Scroll to advance ↓' : 'Completed ↓'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
