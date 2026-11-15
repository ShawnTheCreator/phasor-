import React, { useState } from 'react';
import RedLiquidBackground from './components/RedLiquidBackground';
import CrumbleText from './components/CrumbleText';
import PinnedPipeline from './components/PinnedPipeline';
import StormShowcase from './components/StormShowcase';
import GlassyPhiLogo from './components/GlassyPhiLogo';
import CookieConsent from './components/CookieConsent';
import BookDemoModal from './components/BookDemoModal';
import MultiHazardBentoSection from './components/MultiHazardBentoSection';
import ExpandingBrandFooter from './components/ExpandingBrandFooter';

const isProduction: boolean = Boolean(import.meta.env.PROD);
const rawDashboardEnv: string = (import.meta.env.VITE_DASHBOARD_URL as string) || '';
const DASHBOARD_URL: string = rawDashboardEnv
  ? rawDashboardEnv.replace(/\/$/, '')
  : (isProduction ? '/dashboard' : 'http://localhost:3000');

export default function App(): JSX.Element {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="landing-root">
      {/* =========================================================================
          FIXED GLASSY PHI (Φ) LOGO IN THE LEFT CORNER
          - Greek letter Phi (Φ) representing magnetic flux & phasor phase angle
          - Frosted glass material with specular reflection & ambient blur
          - Physically moves (3D tilt, bobbing, swaying) every time you scroll
          - Visually changes: rotating phasor vector needle, live angle readout,
            circular scroll progress gauge, and dynamic dark/light theme adaptation
          ========================================================================= */}
      <GlassyPhiLogo />

      {/* =========================================================================
          HERO SECTION with Red Flowing Liquid Background & Crumbling Phasor Title
          ========================================================================= */}
      <div className="hero-wrapper">
        <RedLiquidBackground />

        {/* Top Floating Navigation */}
        <header className="hero-nav">
          <div className="hero-nav-spacer" />

          <nav className="hero-nav-links">
            <a href="#how-it-works" className="hero-nav-link">How It Works</a>
            <a href="#replay" className="hero-nav-link">Storm Replay</a>
            <a href="#multi-hazard" className="hero-nav-link">Multi-Hazard</a>
            <a href={`${DASHBOARD_URL}/model`} className="hero-nav-link" target="_blank" rel="noreferrer" style={{ color: '#ef4444', fontWeight: 600 }}>Research ↗</a>
            <a href="#science" className="hero-nav-link">Provenance</a>
            <button
              onClick={() => setIsDemoOpen(true)}
              className="hero-nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
            >
              Book a Demo
            </button>
            <a
              href={`${DASHBOARD_URL}/login`}
              className="btn-pill-glass"
              target="_blank"
              rel="noreferrer"
            >
              <span>Login</span>
              <span>↗</span>
            </a>
            <span className="asterisk-badge" title="NASA Space Apps 2026">✻</span>
          </nav>
        </header>

        {/* Hero Centered Content: Crumbling Phasor on Scroll */}
        <div className="hero-content">
          <CrumbleText />

          <div className="hero-role-tag">
            <span>Space weather early warning</span>
            <span style={{ fontSize: '1.25em' }}>↘</span>
          </div>

          <p className="hero-role-desc">
            Fusing NASA/NOAA DSCOVR L1 satellite telemetry with 1D magnetotelluric lithospheric impedance models over the Kaapvaal Craton to shield high-voltage power grids from solar superstorms.
          </p>

          <div className="hero-action-buttons">
            <a
              href={DASHBOARD_URL}
              className="btn-hero-red"
              target="_blank"
              rel="noreferrer"
            >
              <span>Launch Dashboard</span>
              <span>↗</span>
            </a>
            <a
              href={`${DASHBOARD_URL}/model`}
              className="btn-hero-glass"
              target="_blank"
              rel="noreferrer"
            >
              <span>Scientific Research (R² = 0.961) ↗</span>
            </a>
            <a href="#how-it-works" className="btn-hero-glass">
              <span>Explore Physics &darr;</span>
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PINNED PIPELINE SECTION: "How early warning runs"
          - Starts in hero dark color rgb(7, 1, 2)
          - Active step text rises with reveal animation
          - Background smoothly becomes whiter past Step 2
          - Reaches full white at Step 3 (Solve), Step 4, Step 5, Step 6
          ========================================================================= */}
      <PinnedPipeline />

      {/* =========================================================================
          THIRD SECTION: HISTORICAL STORM SHOWCASE (STAGNANT SCROLL CAROUSEL)
          - Screen stays stagnant while scrolling through extreme storms
          - Storm 2 and Storm 3 slide in from the left like a carousel
          - No manual selection controls: 100% scroll-driven
          - Falling high-voltage wires with electric spark arcs
          - Verified YouTube videos, real metrics, and official scientific citations
          ========================================================================= */}
      <section id="replay" className="storm-section-wrapper">
        <StormShowcase dashboardUrl={DASHBOARD_URL} />
      </section>

      {/* =========================================================================
          FOURTH SECTION: MULTI-HAZARD BENTO GRID (SCALE AI STYLE LAYOUT)
          - Asymmetrical Scale AI-style Bento Cards with Video Slots
          - Videos play once to the end, then stop (play end then stop)
          - Direct deep-links to each operational view in the live dashboard
          ========================================================================= */}
      <MultiHazardBentoSection dashboardUrl={DASHBOARD_URL} />

      {/* =========================================================================
          OPEN SCIENCE DATA PROVENANCE & RESEARCH
          ========================================================================= */}
      <section id="science" className="editorial-sub-section" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div className="editorial-container">
          <div className="editorial-header">
            <div className="editorial-pill-marker" />
            <h2 className="editorial-title">Open science provenance & Scientific Research</h2>
            <p className="editorial-sub-desc">
              Built with free and open scientific telemetry from NASA, NOAA, SANSA Space Science, and Kyoto World Data Center. All neural architectures, lithospheric impedance tensors, and ground-truth backtests are publicly verifiable.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '28px' }}>
            <a
              href={`${DASHBOARD_URL}/model`}
              target="_blank"
              rel="noreferrer"
              className="btn-hero-red"
              style={{ padding: '10px 22px', fontSize: '0.88rem', textDecoration: 'none' }}
            >
              <span>Inspect ML LSTM Model & Research (R² = 0.961)</span>
              <span>↗</span>
            </a>
            <a
              href={`${DASHBOARD_URL}/public`}
              target="_blank"
              rel="noreferrer"
              className="btn-pill-glass"
              style={{ padding: '10px 20px', fontSize: '0.88rem', textDecoration: 'none', color: '#0f172a', borderColor: '#cbd5e1' }}
            >
              <span>Public Civil Defense Feeds ↗</span>
            </a>
          </div>

          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', fontSize: '0.92rem', fontWeight: 600 }}>
            <a href="https://services.swpc.noaa.gov/products/solar-wind/" target="_blank" rel="noreferrer" style={{ color: '#991b1b', textDecoration: 'none' }}>
              &bull; NASA/NOAA DSCOVR L1 RTSW ↗
            </a>
            <a href="https://spaceweather.sansa.org.za/" target="_blank" rel="noreferrer" style={{ color: '#991b1b', textDecoration: 'none' }}>
              &bull; SANSA Space Science Hermanus (HER) ↗
            </a>
            <a href="https://wdc.kugi.kyoto-u.ac.jp/" target="_blank" rel="noreferrer" style={{ color: '#991b1b', textDecoration: 'none' }}>
              &bull; Kyoto WDC Dst Ground Truth ↗
            </a>
            <a href="https://www.usgs.gov/programs/geomagnetism" target="_blank" rel="noreferrer" style={{ color: '#991b1b', textDecoration: 'none' }}>
              &bull; USGS / EarthScope MTArray ↗
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPANDING BRAND & FORMULA FOOTER
          - When scrolling past the 4th section (Multi-Hazard), the logo slowly enters
            from the corner and expands into this grand cinematic footer stage.
          - Expands the electromagnetic induction governing formula with glow & scale.
          ========================================================================= */}
      <ExpandingBrandFooter
        dashboardUrl={DASHBOARD_URL}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Interactive VIP Demo Booking Modal */}
      <BookDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        dashboardUrl={DASHBOARD_URL}
      />

      {/* Modern Cookie & Telemetry Consent Banner */}
      <CookieConsent />
    </div>
  );
}
