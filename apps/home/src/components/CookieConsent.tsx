import React, { useState, useEffect } from 'react';

export default function CookieConsent(): JSX.Element | null {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('phasor_cookie_consent');
      if (!stored) {
        // Small delay for smooth entrance after page load
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    }
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
    <div className="cookie-banner-wrapper" role="dialog" aria-live="polite" aria-label="Cookie and Telemetry Preferences">
      <div className="cookie-banner-card">
        {/* Header with icon & badge */}
        <div className="cookie-header">
          <div className="cookie-icon-wrapper">
            <span className="cookie-icon">🍪</span>
          </div>
          <div>
            <div className="cookie-title-row">
              <h3 className="cookie-title">Cookie &amp; Telemetry Settings</h3>
              <span className="cookie-badge">POPIA / GDPR</span>
            </div>
            <p className="cookie-desc">
              We use essential cookies and anonymous scientific telemetry to calibrate real-time satellite solar wind streams, persist craton model selections, and guarantee substation GIC early-warning integrity.
            </p>
          </div>
        </div>

        {/* Expandable Preferences Section */}
        {showPreferences && (
          <div className="cookie-preferences-panel">
            <div className="pref-item">
              <div>
                <strong className="pref-title">Essential Space Weather Cookies</strong>
                <p className="pref-desc">Necessary for secure operations, login session state, and NASA L1 stream authentication.</p>
              </div>
              <span className="pref-tag-active">Always Active</span>
            </div>

            <div className="pref-item">
              <div>
                <strong className="pref-title">Magnetotelluric Telemetry Caching</strong>
                <p className="pref-desc">Accelerates 1D Wait induction and Lehtinen-Pirjola nodal grid matrix calculations.</p>
              </div>
              <label className="pref-switch">
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
                <p className="pref-desc">Helps our team optimize dashboard latency across low-bandwidth SADC field networks.</p>
              </div>
              <label className="pref-switch">
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

        {/* Actions Row */}
        <div className="cookie-actions-row">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="btn-cookie-link"
          >
            {showPreferences ? 'Hide Preferences' : 'Manage Preferences'}
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
        .cookie-banner-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          max-width: 490px;
          width: calc(100vw - 32px);
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .cookie-banner-card {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(153, 27, 27, 0.15);
          color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .cookie-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .cookie-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(153, 27, 27, 0.2);
          border: 1px solid rgba(153, 27, 27, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cookie-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        .cookie-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .cookie-title {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .cookie-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 7px;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .cookie-desc {
          font-size: 0.82rem;
          line-height: 1.5;
          color: #94a3b8;
          margin: 0;
        }

        /* Preferences Panel */
        .cookie-preferences-panel {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pref-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
        }

        .pref-title {
          display: block;
          font-size: 0.82rem;
          color: #f1f5f9;
          margin-bottom: 2px;
        }

        .pref-desc {
          font-size: 0.74rem;
          color: #64748b;
          margin: 0;
          line-height: 1.35;
        }

        .pref-tag-active {
          font-size: 0.72rem;
          font-weight: 600;
          color: #10b981;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Custom Switch */
        .pref-switch {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
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
          background-color: #334155;
          transition: 0.2s;
          border-radius: 20px;
        }

        .switch-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
        }

        .pref-switch input:checked + .switch-slider {
          background-color: #991b1b;
        }

        .pref-switch input:checked + .switch-slider:before {
          transform: translateX(16px);
        }

        /* Actions Row */
        .cookie-actions-row {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-cookie-link {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }

        .btn-cookie-link:hover {
          color: #ffffff;
        }

        .cookie-buttons-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-cookie-secondary {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-cookie-secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .btn-cookie-primary {
          background-color: #991b1b;
          border: none;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 10px rgba(153, 27, 27, 0.4);
        }

        .btn-cookie-primary:hover {
          background-color: #7f1d1d;
          box-shadow: 0 4px 14px rgba(153, 27, 27, 0.55);
        }

        @media (max-width: 520px) {
          .cookie-banner-wrapper {
            bottom: 12px;
            right: 12px;
            left: 12px;
            width: auto;
          }
          .cookie-actions-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .cookie-buttons-group {
            width: 100%;
            justify-content: stretch;
          }
          .btn-cookie-secondary, .btn-cookie-primary {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
