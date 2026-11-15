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
        padding: 'clamp(48px, 6vw, 90px) clamp(20px, 4vw, 56px) clamp(32px, 4vw, 56px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Background Architectural Grid Lines matching Santal reference */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.08,
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(135deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '16.666% 100%, 800px 800px',
        }}
      />

      {/* =========================================================================
          MONUMENTAL EDGE-TO-EDGE TYPOGRAPHY: P H A S O R
          Directly matching the Santal editorial layout from the user's reference image
          with massive crisp white typography spanning the entire screen width.
          ========================================================================= */}
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          marginBottom: 'clamp(20px, 3.5vw, 42px)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            width: '100%',
            userSelect: 'none',
            letterSpacing: '-0.05em',
          }}
        >
          <span style={letterStyle}>P</span>
          <span style={letterStyle}>H</span>
          <span style={{ ...letterStyle, position: 'relative' }}>
            A
            <span
              style={{
                position: 'absolute',
                bottom: '12%',
                left: '-14%',
                width: 'clamp(6px, 1.1vw, 16px)',
                height: 'clamp(6px, 1.1vw, 16px)',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'inline-block',
              }}
            />
          </span>
          <span style={letterStyle}>S</span>
          <span style={letterStyle}>O</span>
          <span style={letterStyle}>R</span>
        </div>
      </div>

      {/* =========================================================================
          EDITORIAL NAVIGATION BAR
          Featuring '+' on the far left, column links with vertical tick marks below each,
          and the yellow asterisk badge on the right, exactly as in the Santal reference.
          ========================================================================= */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          position: 'relative',
        }}
      >
        {/* Left: Plus icon + Nav columns with vertical ticks */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 'clamp(20px, 4vw, 56px)',
          }}
        >
          {/* Plus icon from reference screenshot */}
          <span
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1,
              userSelect: 'none',
              paddingTop: '2px',
            }}
          >
            +
          </span>

          {/* Column 1: Philosophy */}
          <div style={colStyle}>
            <a href="#how-it-works" style={linkStyle}>
              Philosophy
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 2: Works */}
          <div style={colStyle}>
            <a href={`${dashboardUrl}/grid`} target="_blank" rel="noreferrer" style={linkStyle}>
              Works
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 3: Services */}
          <div style={colStyle}>
            <a href={`${dashboardUrl}/aviation`} target="_blank" rel="noreferrer" style={linkStyle}>
              Services
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 4: Process */}
          <div style={colStyle}>
            <a href="#multi-hazard" style={linkStyle}>
              Process
            </a>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 5: Company */}
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
                textAlign: 'left',
              }}
            >
              Company
            </button>
            <span style={tickStyle}>|</span>
          </div>

          {/* Column 6: Contact */}
          <div style={colStyle}>
            <a href={`${dashboardUrl}/login`} target="_blank" rel="noreferrer" style={linkStyle}>
              Contact
            </a>
            <span style={tickStyle}>|</span>
          </div>
        </div>

        {/* Right: Asterisk flower badge matching user reference image */}
        <button
          onClick={handleScrollTop}
          title="NASA Space Apps 2026 &bull; Scroll to top"
          aria-label="Return to top"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#facc15', // Vibrant yellow starburst matching screenshot
            fontSize: '1.35rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
            userSelect: 'none',
            padding: 0,
            transition: 'transform 0.15s ease, background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.backgroundColor = '#1f2432';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1.0)';
            e.currentTarget.style.backgroundColor = '#161922';
          }}
        >
          {/* Custom 8-point rounded starburst vector icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12.5523 2 13 2.44772 13 3V7.58579L16.2426 4.34315C16.6332 3.95262 17.2663 3.95262 17.6569 4.34315C18.0474 4.73367 18.0474 5.36683 17.6569 5.75736L14.4142 9H19C19.5523 9 20 9.44772 20 10C20 10.5523 19.5523 11 19 11H14.4142L17.6569 14.2426C18.0474 14.6332 18.0474 15.2663 17.6569 15.6569C17.2663 16.0474 16.6332 16.0474 16.2426 15.6569L13 12.4142V17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17V12.4142L7.75736 15.6569C7.36683 16.0474 6.73367 16.0474 6.34315 15.6569C5.95262 15.2663 5.95262 14.6332 6.34315 14.2426L9.58579 11H5C4.44772 11 4 10.5523 4 10C4 9.44772 4.44772 9 5 9H9.58579L6.34315 5.75736C5.95262 5.36683 5.95262 4.73367 6.34315 4.34315C6.73367 3.95262 7.36683 3.95262 7.75736 4.34315L11 7.58579V3C11 2.44772 11.4477 2 12 2Z" />
          </svg>
        </button>
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
  gap: '6px',
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
  fontSize: '0.78rem',
  color: 'rgba(255, 255, 255, 0.45)',
  lineHeight: 1,
  userSelect: 'none',
};
