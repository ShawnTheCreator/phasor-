import React from 'react';

interface ExpandingBrandFooterProps {
  dashboardUrl: string;
  onOpenDemo: () => void;
}

export default function ExpandingBrandFooter({
  dashboardUrl,
  onOpenDemo,
}: ExpandingBrandFooterProps): JSX.Element {
  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="monumental-editorial-footer"
      style={{
        width: '100%',
        backgroundColor: '#05070c',
        color: '#ffffff',
        position: 'relative',
        zIndex: 25,
        padding: 'clamp(60px, 8vw, 110px) clamp(20px, 4vw, 56px) 36px clamp(20px, 4vw, 56px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* =========================================================================
          MONUMENTAL EDGE-TO-EDGE TYPOGRAPHY: P H A S O R
          Matching the brutalist luxury editorial layout from the user's reference image
          with crisp white text spanning the entire screen width.
          ========================================================================= */}
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          marginBottom: 'clamp(28px, 4vw, 48px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            width: '100%',
            userSelect: 'none',
          }}
        >
          <span style={letterStyle}>P</span>
          <span style={letterStyle}>H</span>
          <span style={letterStyle}>A</span>
          <span style={letterStyle}>S</span>
          <span style={letterStyle}>O</span>
          <span style={letterStyle}>R</span>
        </div>
      </div>

      {/* =========================================================================
          EDITORIAL NAVIGATION & INFORMATION BAR
          Separated by a clean hairline divider line, featuring '+' on the left,
          column links with vertical tick marks, and the yellow asterisk badge on the right.
          ========================================================================= */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        {/* Left: Plus icon + Nav columns */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'clamp(18px, 3.2vw, 44px)',
          }}
        >
          {/* Plus icon from reference screenshot */}
          <span
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            +
          </span>

          {/* Column 1: Philosophy / Overview */}
          <div style={colStyle}>
            <a href="#how-it-works" style={linkStyle}>
              Philosophy
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 2: Works / SAPP Grid */}
          <div style={colStyle}>
            <a href={`${dashboardUrl}/grid`} target="_blank" rel="noreferrer" style={linkStyle}>
              Works
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 3: Services / Aviation */}
          <div style={colStyle}>
            <a href={`${dashboardUrl}/aviation`} target="_blank" rel="noreferrer" style={linkStyle}>
              Services
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 4: Process / Multi-Hazard */}
          <div style={colStyle}>
            <a href="#multi-hazard" style={linkStyle}>
              Process
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 5: Company / Satellites */}
          <div style={colStyle}>
            <button
              onClick={onOpenDemo}
              style={{
                ...linkStyle,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              Company
            </button>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 6: Contact / Login */}
          <div style={colStyle}>
            <a href={`${dashboardUrl}/login`} target="_blank" rel="noreferrer" style={linkStyle}>
              Contact
            </a>
            <span style={tickStyle}>|</span>
          </div>
        </div>

        {/* Right: Asterisk flower badge matching user reference image */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleScrollTop}
            title="Return to top"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Top &uarr;
          </button>

          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#12151e',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#facc15', // Vibrant yellow asterisk matching screenshot
              fontSize: '1.25rem',
              fontWeight: 900,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
              userSelect: 'none',
            }}
            title="NASA Space Apps 2026 Challenge &bull; Phasor"
          >
            ✻
          </div>
        </div>
      </div>

      {/* Sub-bar Copyright / Space Apps Provenance */}
      <div
        style={{
          marginTop: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '0.02em',
        }}
      >
        <p style={{ margin: 0 }}>
          &copy; 2026 Phasor &bull; NASA International Space Apps Challenge &bull; Open Science Provenance
        </p>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <span>Kyoto WDC Ground Truth</span>
          <span>&bull;</span>
          <span>DSCOVR L1 Stream</span>
          <span>&bull;</span>
          <span>Kaapvaal MT 1D Model</span>
        </div>
      </div>
    </footer>
  );
}

const letterStyle: React.CSSProperties = {
  fontSize: 'clamp(5rem, 16.5vw, 22rem)',
  fontWeight: 900,
  letterSpacing: '-0.045em',
  lineHeight: 0.82,
  color: '#ffffff',
  margin: 0,
  padding: 0,
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const colStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const linkStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '0.94rem',
  fontWeight: 600,
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  transition: 'opacity 0.15s ease',
};

const tickStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'rgba(255, 255, 255, 0.35)',
  lineHeight: 1,
  userSelect: 'none',
};
