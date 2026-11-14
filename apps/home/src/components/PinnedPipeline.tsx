import React, { useState, useEffect, useRef } from 'react';
import VisualStepCard from './VisualStepCard';
import PowerlinesBackground from './PowerlinesBackground';

interface StepData {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  stepNum: string;
  name: string;
  desc: React.ReactNode;
}

const STEPS: StepData[] = [
  {
    id: 1,
    stepNum: '1.',
    name: 'Ingest',
    desc: (
      <>
        We poll NOAA Space Weather Prediction Center's real-time DSCOVR satellite feeds stationed at{' '}
        <strong>Lagrange point L1</strong> (1.5 million km sunward). We ingest 1-minute cadence telemetry of{' '}
        <strong>interplanetary magnetic field Bz</strong>, bulk solar wind speed, and proton density to provide{' '}
        <strong>15 to 60 minutes of physical warning lead time</strong> before geomagnetic shock fronts strike Earth.
      </>
    ),
  },
  {
    id: 2,
    stepNum: '2.',
    name: 'Induce',
    desc: (
      <>
        Applying Wait's (1962) recursive layered-Earth impedance formulation, we calculate horizontal geoelectric field induction (Ex, Ey in mV/km). We model the{' '}
        <strong>resistive Kaapvaal Craton</strong> (2,000–10,000 &Omega;&middot;m) where high ground resistivity forces induced currents away from the crust and{' '}
        <strong>directly into grounded transmission neutrals</strong>.
      </>
    ),
  },
  {
    id: 3,
    stepNum: '3.',
    name: 'Solve',
    desc: (
      <>
        Our pure C# admittance matrix solver implements the <strong>Lehtinen-Pirjola algorithm</strong> across Eskom's 765 kV and 400 kV transmission backbone. It solves Kirchhoff's current conservation across all nodes, computing the{' '}
        <strong>quasi-DC neutral GIC currents</strong> flowing through every substation earthing point.
      </>
    ),
  },
  {
    id: 4,
    stepNum: '4.',
    name: 'Forecast',
    desc: (
      <>
        A bidirectional LSTM deep recurrent neural network trained on <strong>8.4 million DSCOVR observations</strong> forecasts equatorial ring current intensity (Dst index){' '}
        <strong>1 to 6 hours ahead</strong>. The model provides <strong>calibrated &plusmn;2&sigma; confidence intervals</strong>, giving grid dispatchers predictive foresight before storm commencement.
      </>
    ),
  },
  {
    id: 5,
    stepNum: '5.',
    name: 'Saturate',
    desc: (
      <>
        We evaluate transformer vulnerability by simulating <strong>half-cycle core saturation</strong> under DC offset bias. The engine computes reactive power consumption deficit ({' '}
        <strong>Q_loss in MVAR</strong>), stray tank heating, and <strong>harmonic generation</strong> to identify which generator step-up transformers risk catastrophic tripping.
      </>
    ),
  },
  {
    id: 6,
    stepNum: '6.',
    name: 'Protect',
    desc: (
      <>
        When computed GICs cross regional thresholds, Phasor generates <strong>plain-language NERC TPL-007 directives</strong> and dispatches automated{' '}
        <strong>SMS and email alerts</strong> to Eskom National Transmission Control Centre (NTCC) and SANSA Space Science dispatchers, complete with verified data provenance.
      </>
    ),
  },
];

export default function PinnedPipeline(): JSX.Element {
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
        // Approaching section: docked at top of runway
        setPinMode('top');
        setProgress(0);
      } else if (rect.bottom < window.innerHeight) {
        // Scrolled through section: docked at bottom of runway
        setPinMode('bottom');
        setProgress(1);
      } else {
        // ACTIVELY PINNED: 100% STAGNANT ON SCREEN VIA FIXED VIEWPORT
        setPinMode('fixed');
        const current = Math.min(1, Math.max(0, -rect.top / totalScrollable));
        setProgress(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Continuous step position from 1.0 to 6.0
  const stepPos = 1.0 + progress * 5.0;
  const activeStepIdx = Math.min(6, Math.max(1, Math.round(stepPos))) - 1;

  // =========================================================================
  // The Math:
  // - Step 1 is in place, and Step 2 slowly rises and replaces Step 1.
  // - At Step 3, the color change begins and happens VERY SLOWLY:
  //   Gradual transition across 3.00 to 4.30.
  // - The powerlines continuously move to the right as you scroll,
  //   darkening smoothly in sync with the slow background color change.
  // =========================================================================
  const transitionStart = 3.00;
  const transitionEnd = 4.30; // Very slow, gradual transition across scroll

  let whiteProgress = 0;
  if (stepPos <= transitionStart) {
    whiteProgress = 0;
  } else if (stepPos >= transitionEnd) {
    whiteProgress = 1;
  } else {
    const rawT = (stepPos - transitionStart) / (transitionEnd - transitionStart);
    // Smooth sinusoidal ease for a very slow, natural transition
    whiteProgress = 0.5 - 0.5 * Math.cos(rawT * Math.PI);
  }

  const isWhiteTheme = whiteProgress > 0.5;

  // Background color interpolation:
  // Starts at lighter warm graphite rgb(34, 28, 32)
  // Reaches crisp white rgb(252, 252, 254) as step 3 replaces step 2
  const startR = 34;
  const startG = 28;
  const startB = 32;

  const endR = 252;
  const endG = 252;
  const endB = 254;

  const bgR = Math.round(startR + (endR - startR) * whiteProgress);
  const bgG = Math.round(startG + (endG - startG) * whiteProgress);
  const bgB = Math.round(startB + (endB - startB) * whiteProgress);
  const bgColor = `rgb(${bgR}, ${bgG}, ${bgB})`;

  const scrollToStep = (index: number): void => {
    const el = runwayRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const runwayTop = window.scrollY + rect.top;
    const totalScrollable = rect.height - window.innerHeight;
    const targetScrollY = runwayTop + (index / 5) * totalScrollable;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  };

  return (
    <section
      id="how-it-works"
      ref={runwayRef}
      className="pinned-pipeline-runway"
      style={{ position: 'relative', width: '100%', height: '480vh' }}
    >
      {/* Viewport: 100% physically stagnant on screen when active (position: fixed) */}
      <div
        className={`pinned-pipeline-viewport ${isWhiteTheme ? 'theme-light' : 'theme-dark'} pin-${pinMode}`}
        style={{
          backgroundColor: bgColor,
          position: pinMode === 'fixed' ? 'fixed' : 'absolute',
          top: pinMode === 'bottom' ? 'auto' : 0,
          bottom: pinMode === 'bottom' ? 0 : 'auto',
          left: 0,
          right: 0,
          width: '100%',
          height: '100vh',
          zIndex: pinMode === 'fixed' ? 25 : 15,
        }}
      >
        {/* Background SVG High-Voltage Transmission Powerlines
            (Powerlines darken continuously as whiteProgress goes from 0 to 1) */}
        <PowerlinesBackground
          whiteProgress={whiteProgress}
          scrollProgress={progress}
        />

        {/* Tactile Fine Film Grain Texture Overlay */}
        <div className="pinned-grain-overlay" />
        <svg
          className="pinned-grain-filter-svg"
          aria-hidden="true"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <filter id="pipeline-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>

        {/* Foreground Content */}
        <div className="pinned-content-container">
          {/* Header Bar */}
          <div className="pinned-header">
            <div className="pinned-header-left">
              <div className="pinned-pill-marker" />
              <h2 className="pinned-main-title">How early warning runs</h2>
            </div>

            {/* Step Indicators */}
            <div className="pinned-step-pills">
              {STEPS.map((step, idx) => {
                const isActive = idx === activeStepIdx;
                const isPassed = idx < activeStepIdx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => scrollToStep(idx)}
                    className={`step-pill ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    title={`Step ${step.id}: ${step.name}`}
                  >
                    <span className="step-pill-num">{step.id}</span>
                    <span className="step-pill-name">{step.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pinned-divider" />

          {/* Stagnant Center Stage: Step 1 is in place, then 2 slowly rises and replaces 1,
              3 replaces 2, 4 replaces 3, etc. */}
          <div className="pinned-stage-fixed">
            {STEPS.map((step) => {
              const offset = step.id - stepPos;

              // Don't render far off-screen steps
              if (Math.abs(offset) > 1.25) return null;

              // Smooth rise translation: rises from +90px to 0px and exits to -90px
              const translateY = offset * 90;
              const absOffset = Math.abs(offset);
              const opacity = Math.max(0, 1 - absOffset * 1.55);
              const scale = Math.max(0.92, 1 - absOffset * 0.08);

              return (
                <div
                  key={step.id}
                  className={`pinned-replace-row ${Math.abs(offset) < 0.4 ? 'is-active-step' : ''}`}
                  style={{
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    opacity,
                    pointerEvents: Math.abs(offset) < 0.45 ? 'auto' : 'none',
                  }}
                >
                  {/* Left Column: Number & Title */}
                  <div className="step-col-title">
                    <span className="step-number">{step.stepNum}</span>
                    <span className="step-label">{step.name}</span>
                  </div>

                  {/* Middle Column: Visual Thumbnail Mockup Card */}
                  <div className="step-col-visual">
                    <VisualStepCard step={step.id} isDark={!isWhiteTheme} />
                  </div>

                  {/* Right Column: Explanatory Description */}
                  <div className="step-col-desc">
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Progress Bar */}
          <div className="pinned-progress-track">
            <div
              className="pinned-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
