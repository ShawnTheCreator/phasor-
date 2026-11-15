import React, { useEffect, useState, useRef } from 'react';
import FallingWires from './FallingWires';

interface StormEvent {
  id: string;
  num: string;
  title: string;
  description: string;
  ytEmbed: string;
  reportUrl: string;
}

const STORMS: StormEvent[] = [
  {
    id: 'may2024',
    num: '01',
    title: 'May 2024 "Gannon" Superstorm (G5)',
    description:
      '5 cannibal CMEs triggered the highest peak GICs in NERC\'s post-2013 database across 397+ monitors.',
    ytEmbed: 'https://www.youtube.com/embed/wmumao6VquU',
    reportUrl: 'https://www.nerc.com/globalassets/programs/rapa/gmd/reference-documents/may-2024-gmd-event-review.pdf',
  },
  {
    id: 'quebec1989',
    num: '02',
    title: 'March 1989 Québec Collapse',
    description:
      'Collapsed the entire Hydro-Québec 735 kV grid in 92 seconds, leaving 6 million people in the dark for over 9 hours.',
    ytEmbed: 'https://www.youtube.com/embed/RDb2rz6QPYk',
    reportUrl: 'https://science.nasa.gov/science-research/heliophysics/the-day-the-sun-brought-down-the-grid/',
  },
  {
    id: 'halloween2003',
    num: '03',
    title: 'October 2003 Halloween Storms',
    description:
      'Massive X17 flare produced Malmö Sweden transformer harmonic tripping and 50,000-customer blackout.',
    ytEmbed: 'https://www.youtube.com/embed/vXq0X2Uz-xE',
    reportUrl: 'https://ieeexplore.ieee.org/document/4282054',
  },
];

export default function StormShowcase(): JSX.Element {
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

  // =========================================================================
  // SCROLL-DRIVEN CAROUSEL WITH NO MANUAL CONTROLS:
  // - Storm 1 is shown initially.
  // - As you scroll down, Storm 2 smoothly slides in from the right (reversing direction).
  // - Current storm exits smoothly to the left.
  // - As you scroll further, Storm 3 slides in from the right.
  // =========================================================================
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
          {/* Section Header: Clean title with subtitle removed */}
          <div className="editorial-header storm-carousel-header">
            <div className="editorial-pill-marker" />
            <h2 className="editorial-title">Validated on extreme storms</h2>
          </div>

          {/* ===================================================================
              MINIMALIST SPLIT STAGE (MATCHING PALANTIR REFERENCE):
              - Left: Embedded YouTube Video
              - Right: Clean centered title, description, and [LEARN MORE] button
              - Slides smoothly enter from the left on scroll with no manual controls
              =================================================================== */}
          <div className="storm-carousel-stage-wrapper">
            <div className="storm-carousel-stage">
              {STORMS.map((storm, idx) => {
                // Incoming slide comes from the right (+110% to 0%), exiting to the left (0% to -110%)
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
                      {/* Left: Embedded YouTube Video */}
                      <div className="simple-storm-media">
                        <iframe
                          src={storm.ytEmbed}
                          title={storm.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="simple-storm-iframe"
                        />
                      </div>

                      {/* Right: Clean Minimalist Content (Title, Description, Button) */}
                      <div className="simple-storm-content">
                        <h3 className="simple-storm-title">{storm.title}</h3>
                        <p className="simple-storm-desc">{storm.description}</p>
                        <a
                          href={storm.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="simple-storm-btn"
                        >
                          LEARN MORE
                        </a>
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
