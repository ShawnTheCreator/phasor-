import React, { useState, useEffect } from 'react';

interface BriefingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardUrl: string;
}

export default function BriefingPopup({
  isOpen,
  onClose,
  dashboardUrl,
}: BriefingPopupProps): JSX.Element | null {
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Brief RAF delay to trigger smooth CSS slow-reveal entrance transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key closes popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9000,
        maxWidth: '460px',
        width: 'calc(100vw - 48px)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(28px) scale(0.96)',
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(9, 12, 20, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(220, 38, 38, 0.15)',
          padding: '24px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Top Red Glow Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
          }}
        />

        {/* Header: Tag + Close Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.75)',
                fontFamily: 'monospace',
              }}
            >
              NASA Space Apps 2026 &bull; Early Warning Live
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close notification"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '1.25rem',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '2px 6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
          >
            &times;
          </button>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            lineHeight: 1.35,
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}
        >
          Planetary Space Weather Grid Shield Online
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.8rem',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 16px 0',
          }}
        >
          Phasor fuses real-time NASA DSCOVR L1 satellite telemetry with 1D Kaapvaal Craton lithospheric impedance models to shield high-voltage power grids from solar superstorms.
        </p>

        {/* Telemetry Highlights */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 14px',
            marginBottom: '18px',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}>
            <span>&bull; DSCOVR L1 Telemetry</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>STREAMING (1-min)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}>
            <span>&bull; Kaapvaal 1D MT Tensor</span>
            <span style={{ color: '#f87171', fontWeight: 700 }}>10,000 Ω·m MODEL</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}>
            <span>&bull; Neutral-Blocking Response</span>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>&lt;100ms ARMED</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1,
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '9px 14px',
              borderRadius: '8px',
              textAlign: 'center',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
          >
            Launch Live Dashboard &rarr;
          </a>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '9px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
