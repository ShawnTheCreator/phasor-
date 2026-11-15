import React, { useEffect, useState, useRef } from 'react';
import FallingWires from './FallingWires';

interface StormEvent {
  id: string;
  num: string;
  title: string;
  description: string;
  mediaType: 'video' | 'picture';
  videoUrl?: string;
  imageUrl?: string;
  articleTag: string;
  kpiStats: string[];
  reportUrl: string;
  headlineQuote?: string;
  accentColor: string;
}

const STORMS: StormEvent[] = [
  {
    id: 'may2024',
    num: '01',
    title: 'May 2024 "Gannon" Superstorm (G5)',
    description:
      '5 cannibal CMEs triggered the highest peak GICs in NERC\'s post-2013 database across 397+ monitors, pushing grid transformers toward half-cycle saturation.',
    mediaType: 'video',
    videoUrl: 'https://www.youtube.com/embed/9i47b__igEw',
    articleTag: 'NASA GODDARD &bull; NOAA SWPC &bull; NERC REVIEW',
    kpiStats: ['Dst: -412 nT', 'Kp: 9.0 Extreme', '397+ GIC Monitors'],
    accentColor: '#ef4444',
    reportUrl: 'https://www.nerc.com/globalassets/programs/rapa/gmd/reference-documents/may-2024-gmd-event-review.pdf',
  },
  {
    id: 'quebec1989',
    num: '02',
    title: 'March 1989 Québec 735kV Collapse',
    description:
      'Collapsed the entire Hydro-Québec 735 kV grid in 92 seconds, leaving 6 million people in the dark for over 9 hours after transformer neutrals were flooded with quasi-DC currents.',
    mediaType: 'picture',
    imageUrl: '/images/storms/quebec-1989.jpg',
    articleTag: 'NASA HELIOPHYSICS &bull; HYDRO-QUÉBEC ARCHIVE',
    kpiStats: ['92 Seconds to Blackout', '6 Million Affected', '9-Hour Collapse'],
    headlineQuote: 'The Day the Sun Brought Down the Grid',
    accentColor: '#38bdf8',
    reportUrl: 'https://science.nasa.gov/science-research/heliophysics/the-day-the-sun-brought-down-the-grid/',
  },
  {
    id: 'halloween2003',
    num: '03',
    title: 'October 2003 Halloween Storms',
    description:
      'Massive X17.2 solar flare produced Malmö Sweden transformer harmonic tripping and a 50,000-customer blackout, destroying high-voltage assets in Europe and North America.',
    mediaType: 'picture',
    imageUrl: '/images/storms/halloween-2003.jpg',
    articleTag: 'NASA SOHO &bull; IEEE POWER ARCHIVE',
    kpiStats: ['X17.2 Megaflare', 'Malmö 130kV Tripped', '50,000 In The Dark'],
    headlineQuote: 'X17 Solar Flare & Swedish Grid Harmonic Failure',
    accentColor: '#f59e0b',
    reportUrl: 'https://ieeexplore.ieee.org/document/4282054',
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
                      {/* Left: Video for May 2024, Real Photographs for Quebec 1989 & Halloween 2003 */}
                      {storm.mediaType === 'video' ? (
                        <div className="simple-storm-media">
                          <iframe
                            src={storm.videoUrl}
                            title={storm.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="simple-storm-iframe"
                          />
                        </div>
                      ) : (
                        <div
                          className="simple-storm-media"
                          style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            backgroundColor: '#070b14',
                            minHeight: '260px',
                          }}
                        >
                          <img
                            src={storm.imageUrl}
                            alt={storm.title}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />

                          {/* High-Contrast Editorial Overlay */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(180deg, rgba(7, 11, 20, 0.6) 0%, rgba(7, 11, 20, 0.15) 40%, rgba(7, 11, 20, 0.9) 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              padding: '20px',
                              boxSizing: 'border-box',
                              pointerEvents: 'none',
                            }}
                          >
                            {/* Top Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  letterSpacing: '0.08em',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(7, 11, 20, 0.85)',
                                  border: '1px solid rgba(255, 255, 255, 0.22)',
                                  color: '#ffffff',
                                  backdropFilter: 'blur(8px)',
                                }}
                                dangerouslySetInnerHTML={{ __html: storm.articleTag }}
                              />
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  fontFamily: 'monospace',
                                  color: storm.accentColor,
                                  backgroundColor: 'rgba(7, 11, 20, 0.85)',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  border: `1px solid ${storm.accentColor}66`,
                                }}
                              >
                                NO.{storm.num}
                              </span>
                            </div>

                            {/* Bottom Headline Quote & Real KPI Pills */}
                            <div>
                              {storm.headlineQuote && (
                                <h4
                                  style={{
                                    fontSize: '1.05rem',
                                    fontWeight: 800,
                                    color: '#ffffff',
                                    margin: '0 0 10px 0',
                                    letterSpacing: '-0.02em',
                                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
                                  }}
                                >
                                  &ldquo;{storm.headlineQuote}&rdquo;
                                </h4>
                              )}

                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {storm.kpiStats.map((kpi, kIdx) => (
                                  <span
                                    key={kIdx}
                                    style={{
                                      fontSize: '0.68rem',
                                      fontFamily: 'monospace',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      backgroundColor: 'rgba(7, 11, 20, 0.88)',
                                      border: `1px solid ${storm.accentColor}66`,
                                      color: '#ffffff',
                                      fontWeight: 600,
                                      backdropFilter: 'blur(4px)',
                                    }}
                                  >
                                    &bull; {kpi}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

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
                              className="simple-storm-btn simple-storm-btn-dark"
                              style={{ backgroundColor: '#0f172a', borderColor: '#0f172a', color: '#ffffff' }}
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
