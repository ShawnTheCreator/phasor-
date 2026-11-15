import React, { useState, useEffect } from 'react';
import RedLiquidBackground from './components/RedLiquidBackground';
import CrumbleText from './components/CrumbleText';
import PinnedPipeline from './components/PinnedPipeline';
import StormShowcase from './components/StormShowcase';
import GlassyPhiLogo from './components/GlassyPhiLogo';
import CookieConsent from './components/CookieConsent';
import BookDemoModal from './components/BookDemoModal';
import MultiHazardBentoSection from './components/MultiHazardBentoSection';
import ExpandingBrandFooter from './components/ExpandingBrandFooter';
import CinematicLoader from './components/CinematicLoader';
import ResearchPage from './components/ResearchPage';

const isProduction: boolean = Boolean(import.meta.env.PROD);
const rawDashboardEnv: string = (import.meta.env.VITE_DASHBOARD_URL as string) || '';
const DASHBOARD_URL: string = rawDashboardEnv
  ? rawDashboardEnv.replace(/\/$/, '')
  : (isProduction ? '/dashboard' : 'http://localhost:3000');

export default function App(): JSX.Element {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isSiteRevealed, setIsSiteRevealed] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'research'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/research' || h === '#research') return 'research';
    }
    return 'home';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/research' || h === '#research') {
        setCurrentView('research');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToResearch = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentView('research');
    window.history.pushState(null, '', '#research');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentView('home');
    window.history.pushState(null, '', window.location.pathname === '/research' ? '/' : '#');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoaderComplete = () => {
    setIsSiteRevealed(true);
  };

  if (currentView === 'research') {
    return (
      <ResearchPage onBackHome={navigateToHome} dashboardUrl={DASHBOARD_URL} />
    );
  }

  return (
    <div
      className={`landing-root ${isSiteRevealed ? 'site-revealed' : 'site-preloading'}`}
      style={{
        opacity: isSiteRevealed ? 1 : 0.95,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      {/* =========================================================================
          CINEMATIC GRAINY GRAY LOADER
          - Tactile grainy gray background with film noise texture
          - Massive flowing red liquid number matching the hero background
          - ESC or click skips immediately
          ========================================================================= */}
      <CinematicLoader onComplete={handleLoaderComplete} />

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
            <a
              href="#research"
              onClick={navigateToResearch}
              className="hero-nav-link hero-nav-highlight"
              style={{ color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
            >
              Research ↗
            </a>
            <a href="#science" className="hero-nav-link">Provenance</a>
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

        {/* Hero Centered Content: Crumbling Phasor on Scroll with Tactile Pop Entrance */}
        <div className="hero-content" style={{ overflow: 'visible' }}>
          <div
            className={isSiteRevealed ? 'hero-title-pop' : 'hero-title-idle'}
            style={{ width: '100%', overflow: 'visible', display: 'flex', justifyContent: 'center' }}
          >
            <CrumbleText isRevealed={isSiteRevealed} />
          </div>

          <div className={`hero-role-tag ${isSiteRevealed ? 'hero-tag-pop' : 'hero-tag-idle'}`}>
            <span>Space weather early warning</span>
            <span style={{ fontSize: '1.25em' }}>↘</span>
          </div>

          <p className="hero-role-desc">
            Fusing NASA/NOAA DSCOVR L1 satellite telemetry with 1D magnetotelluric lithospheric impedance models over the Kaapvaal Craton to shield high-voltage power grids from solar superstorms.
          </p>

          <div className="hero-action-buttons">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="btn-hero-red"
              style={{ border: 'none', cursor: 'pointer', font: 'inherit' }}
            >
              <span>Book a Demo</span>
              <span>↗</span>
            </button>
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
          - Verified NASA/NERC scientific dossiers, real metrics, and official citations
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
          OPEN SCIENCE DATA PROVENANCE
          ========================================================================= */}
      <section id="science" className="editorial-sub-section" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div className="editorial-container">
          <div className="editorial-header">
            <div className="editorial-pill-marker" />
            <h2 className="editorial-title">Open science data provenance</h2>
            <p className="editorial-sub-desc">
              Built with free and open scientific telemetry from NASA, NOAA, SANSA Space Science, and Kyoto World Data Center. All neural architectures, lithospheric impedance tensors, and ground-truth backtests are publicly verifiable.
            </p>
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
          EXPANDING MONUMENTAL EDITORIAL FOOTER
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
