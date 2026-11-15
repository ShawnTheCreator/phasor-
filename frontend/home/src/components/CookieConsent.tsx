import React, { useState, useEffect } from 'react';

export default function CookieConsent(): JSX.Element | null {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState<boolean>(true);

  // Check consent status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('phasor_cookie_consent');
      if (!stored) {
        // Small delay for smooth entrance after page load
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Listen to scroll to morph between white bottom strip and compact message box
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = (): void => {
      // Threshold: when scrolled past 80px, morph to compact message box
      const scrolled = window.scrollY > 80;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAcceptAll = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('phasor_cookie_consent', 'accepted_all');
      localStorage.setItem('phasor_cookie_analytics', 'true');
      localStorage.setItem('phasor_cookie_telemetry', 'true');
    }
    setIsVisible(false);
  };

  const handleEssentialOnly = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('phasor_cookie_consent', 'essential_only');
      localStorage.setItem('phasor_cookie_analytics', 'false');
      localStorage.setItem('phasor_cookie_telemetry', 'false');
    }
    setIsVisible(false);
  };

  const handleSavePreferences = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('phasor_cookie_consent', 'custom');
      localStorage.setItem('phasor_cookie_analytics', analyticsEnabled ? 'true' : 'false');
      localStorage.setItem('phasor_cookie_telemetry', telemetryEnabled ? 'true' : 'false');
    }
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`cookie-consent-container ${isScrolled ? 'mode-box' : 'mode-strip'} ${showPreferences ? 'show-prefs' : ''}`}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Telemetry Preferences"
    >
      <div className="cookie-inner">
        {/* Main Content Area */}
        <div className="cookie-main-content">
          <div className="cookie-icon-wrapper" aria-hidden="true">
            {/* Vector SVG Cookie */}
            <svg
              className="cookie-svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cookie silhouette with subtle bite */}
              <path
                d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"
                fill="#fff1f2"
                stroke="#991b1b"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Chocolate chips / dots in rich dark red */}
              <circle cx="8.5" cy="8.5" r="1.3" fill="#991b1b" />
              <circle cx="16" cy="15.5" r="1.3" fill="#991b1b" />
              <circle cx="12" cy="12" r="1.3" fill="#991b1b" />
              <circle cx="10.5" cy="16.5" r="1.3" fill="#991b1b" />
              <circle cx="7" cy="13.5" r="1.3" fill="#991b1b" />
            </svg>
          </div>

          <div className="cookie-text-block">
            <div className="cookie-title-row">
              <span className="cookie-title">Cookie &amp; Telemetry Notice</span>
              <span className="cookie-badge">POPIA / GDPR</span>
            </div>
            <p className="cookie-desc">
              We use essential cookies and anonymous scientific telemetry to calibrate real-time satellite solar wind streams and guarantee GIC early-warning integrity.
            </p>
          </div>
        </div>

        {/* Expandable Preferences Panel */}
        {showPreferences && (
          <div className="cookie-preferences-panel">
            <div className="pref-item">
              <div>
                <strong className="pref-title">Essential Space Weather Cookies</strong>
                <p className="pref-desc">Necessary for secure operations, session state, and NASA L1 stream authentication.</p>
              </div>
              <span className="pref-tag-active">Always Active</span>
            </div>

            <div className="pref-item">
              <div>
                <strong className="pref-title">Magnetotelluric Telemetry Caching</strong>
                <p className="pref-desc">Accelerates 1D Wait induction and Lehtinen-Pirjola nodal grid matrix calculations.</p>
              </div>
              <label className="pref-switch" aria-label="Toggle Magnetotelluric Telemetry Caching">
                <input
                  type="checkbox"
                  checked={telemetryEnabled}
                  onChange={(e) => setTelemetryEnabled(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="pref-item">
              <div>
                <strong className="pref-title">Anonymous Usage Analytics</strong>
                <p className="pref-desc">Helps our team optimize dashboard latency across low-bandwidth Southern African field networks.</p>
              </div>
              <label className="pref-switch" aria-label="Toggle Anonymous Usage Analytics">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="cookie-actions">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="btn-cookie-link"
          >
            {showPreferences ? 'Hide Preferences' : 'Preferences'}
          </button>

          <div className="cookie-buttons-group">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="btn-cookie-secondary"
            >
              Essential Only
            </button>

            {showPreferences ? (
              <button
                type="button"
                onClick={handleSavePreferences}
                className="btn-cookie-primary"
              >
                Save Choices
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="btn-cookie-primary"
              >
                Accept All
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Root Container with White Background & Red Accents */
        .cookie-consent-container {
          position: fixed;
          z-index: 99999;
          background-color: #ffffff;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-radius 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      padding 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          animation: cookieSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cookieSlideIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================================
           STATE 1: WHITE STRIP MODE (AT TOP OF PAGE)
           ===================================================================== */
        .cookie-consent-container.mode-strip {
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          border-top: 1.5px solid #fecaca;
          border-left: none;
          border-right: none;
          border-bottom: none;
          border-radius: 0;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.05), 0 -1px 4px rgba(153, 27, 27, 0.06);
          padding: 10px 24px;
        }

        .cookie-consent-container.mode-strip .cookie-inner {
          max-width: 1320px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          width: 100%;
        }

        .cookie-consent-container.mode-strip .cookie-main-content {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .cookie-consent-container.mode-strip .cookie-desc {
          margin: 0;
          font-size: 0.78rem;
          color: #475569;
          line-height: 1.4;
          max-width: 760px;
          white-space: normal;
        }

        .cookie-consent-container.mode-strip .cookie-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        /* =====================================================================
           STATE 2: COMPACT MESSAGE BOX MODE (WHEN SCROLLING DOWN OR PREFS OPEN)
           ===================================================================== */
        .cookie-consent-container.mode-box,
        .cookie-consent-container.show-prefs {
          bottom: 24px;
          right: 24px;
          left: auto;
          width: calc(100vw - 32px);
          max-width: 410px;
          border: 1.5px solid #fecaca;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(153, 27, 27, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06);
          padding: 18px 20px;
        }

        .cookie-consent-container.mode-box .cookie-inner,
        .cookie-consent-container.show-prefs .cookie-inner {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        .cookie-consent-container.mode-box .cookie-main-content,
        .cookie-consent-container.show-prefs .cookie-main-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .cookie-consent-container.mode-box .cookie-desc,
        .cookie-consent-container.show-prefs .cookie-desc {
          font-size: 0.78rem;
          color: #475569;
          line-height: 1.45;
          margin: 4px 0 0 0;
        }

        .cookie-consent-container.mode-box .cookie-actions,
        .cookie-consent-container.show-prefs .cookie-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 10px;
          border-top: 1px solid #fee2e2;
        }

        /* Icon Badge */
        .cookie-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cookie-svg {
          width: 22px;
          height: 22px;
          display: block;
        }

        /* Title and Badge Row */
        .cookie-text-block {
          flex: 1;
          min-width: 0;
        }

        .cookie-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }

        .cookie-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.015em;
        }

        .cookie-badge {
          font-size: 0.64rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 1px 6px;
          border-radius: 4px;
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        /* Preferences Panel */
        .cookie-preferences-panel {
          padding-top: 12px;
          border-top: 1px solid #fee2e2;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pref-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
        }

        .pref-title {
          display: block;
          font-size: 0.78rem;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .pref-desc {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0;
          line-height: 1.35;
        }

        .pref-tag-active {
          font-size: 0.68rem;
          font-weight: 700;
          color: #991b1b;
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Red Switch Slider */
        .pref-switch {
          position: relative;
          display: inline-block;
          width: 34px;
          height: 18px;
          flex-shrink: 0;
        }

        .pref-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.2s;
          border-radius: 20px;
        }

        .switch-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .pref-switch input:checked + .switch-slider {
          background-color: #991b1b;
        }

        .pref-switch input:checked + .switch-slider:before {
          transform: translateX(16px);
        }

        /* Buttons Styling (Strict White & Red) */
        .btn-cookie-link {
          background: none;
          border: none;
          color: #991b1b;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }

        .btn-cookie-link:hover {
          color: #7f1d1d;
        }

        .cookie-buttons-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-cookie-secondary {
          background-color: #ffffff;
          border: 1.5px solid #fecaca;
          color: #991b1b;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-cookie-secondary:hover {
          background-color: #fef2f2;
          border-color: #dc2626;
          color: #7f1d1d;
        }

        .btn-cookie-primary {
          background-color: #991b1b;
          border: 1px solid #7f1d1d;
          color: #ffffff;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(153, 27, 27, 0.28);
        }

        .btn-cookie-primary:hover {
          background-color: #7f1d1d;
          box-shadow: 0 4px 10px rgba(153, 27, 27, 0.4);
          transform: translateY(-1px);
        }

        .btn-cookie-primary:active {
          transform: translateY(0);
          background-color: #450a0a;
        }

        /* Responsive Mobile Layout */
        @media (max-width: 680px) {
          .cookie-consent-container.mode-strip {
            padding: 12px 16px;
          }

          .cookie-consent-container.mode-strip .cookie-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .cookie-consent-container.mode-strip .cookie-actions {
            justify-content: space-between;
            width: 100%;
          }

          .cookie-consent-container.mode-box,
          .cookie-consent-container.show-prefs {
            bottom: 12px;
            right: 12px;
            left: 12px;
            width: auto;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
