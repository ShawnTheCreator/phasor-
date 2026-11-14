import React from 'react';
import RedLiquidBackground from './components/RedLiquidBackground';
import CrumbleText from './components/CrumbleText';
import PinnedPipeline from './components/PinnedPipeline';
import StormShowcase from './components/StormShowcase';
import GlassyPhiLogo from './components/GlassyPhiLogo';

const isProduction: boolean = Boolean(import.meta.env.PROD);
const DASHBOARD_URL: string =
  (import.meta.env.VITE_DASHBOARD_URL as string) ||
  (isProduction ? '/dashboard' : 'http://localhost:3000');

export default function App(): JSX.Element {
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
            <a href="#science" className="hero-nav-link">Data Lineage</a>
            <a
              href={DASHBOARD_URL}
              className="btn-pill-glass"
              target="_blank"
              rel="noreferrer"
            >
              <span>Launch Operations</span>
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
              <span>Launch Control Room</span>
              <span>↗</span>
            </a>
            <a href="#how-it-works" className="btn-hero-glass">
              <span>Explore Physics</span>
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
        <StormShowcase />
      </section>

      {/* =========================================================================
          OPEN SCIENCE DATA PROVENANCE
          ========================================================================= */}
      <section id="science" className="editorial-sub-section" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div className="editorial-container">
          <div className="editorial-header">
            <div className="editorial-pill-marker" />
            <h2 className="editorial-title">Open science provenance</h2>
            <p className="editorial-sub-desc">
              Built with free and open data from NASA, NOAA, SANSA Space Science, and Kyoto World Data Center.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', color: '#64748b', fontSize: '0.92rem', fontWeight: 500 }}>
            <div>&bull; NASA/NOAA DSCOVR L1 RTSW</div>
            <div>&bull; SANSA Space Science Hermanus (HER)</div>
            <div>&bull; Kyoto WDC Dst Ground Truth</div>
            <div>&bull; USGS / EarthScope MTArray</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="editorial-footer">
        <div className="editorial-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p>&copy; 2026 Phasor &bull; NASA International Space Apps Challenge &bull; All Rights Reserved.</p>
          <a
            href={DASHBOARD_URL}
            className="btn-hero-red"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            target="_blank"
            rel="noreferrer"
          >
            Launch Control Room ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
