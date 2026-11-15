import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import RedLiquidBackground from '../components/RedLiquidBackground';

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>('operator@sansa.org.za');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('phasor_auth', 'true');
        localStorage.setItem('phasor_operator', email || 'operator@sansa.org.za');
      }
      router.push('/');
    }, 400);
  };

  const handleSSO = (): void => {
    setIsLoading(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('phasor_auth', 'true');
        localStorage.setItem('phasor_operator', 'sansa.sso.operator@spaceweather.org.za');
      }
      router.push('/');
    }, 400);
  };

  const handleForgotPassword = (e: React.MouseEvent): void => {
    e.preventDefault();
    setNotice('Password reset instruction dispatched to Eskom / SANSA Security Operations Center.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSignUp = (e: React.MouseEvent): void => {
    e.preventDefault();
    setNotice('Registration requires SANSA / SAPP National Transmission Control authorization. Use pre-filled credentials to sign in.');
    setTimeout(() => setNotice(null), 4500);
  };

  return (
    <>
      <Head>
        <title>Sign In — Phasor SADC Space Weather Defense</title>
        <meta name="description" content="Sign in to the Phasor Space Weather Operations Control Room" />
      </Head>

      <div className="login-root">
        {/* ===================================================================
            LEFT HALF: GLASS-LIKE LOGIN CONTAINER (MATCHING UPLOADED SPEC)
            =================================================================== */}
        <div className="login-left-pane">
          {/* Glass Card Inner Container */}
          <div className="login-glass-card">
            {/* Header */}
            <h1 className="login-title">Login</h1>
            <p className="login-subtitle">
              Don&apos;t have an account yet?{' '}
              <a href="#signup" onClick={handleSignUp} className="login-signup-link">
                Sign up now
              </a>
            </p>

            {/* Notification alert */}
            {notice && (
              <div className="login-notice-banner">
                <span>ℹ️</span>
                <span>{notice}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="login-form">
              {/* Email Address Input */}
              <div className="login-field-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="login-glass-input"
                  aria-label="Email address"
                />
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="login-field-group password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="login-glass-input"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // Eye slash SVG
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    // Eye open SVG
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="login-options-row">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="login-checkbox"
                  />
                  <span>Remember me</span>
                </label>

                <a href="#forgot" onClick={handleForgotPassword} className="forgot-password-link">
                  Forgot password?
                </a>
              </div>

              {/* RED Log in Button (Specified by User) */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-login-red"
              >
                {isLoading ? (
                  <span className="btn-spinner-text">Authenticating...</span>
                ) : (
                  <span>Log in</span>
                )}
              </button>

              {/* OR Divider */}
              <div className="login-divider">
                <span className="divider-line" />
                <span className="divider-text">OR</span>
                <span className="divider-line" />
              </div>

              {/* Log in with SSO Link / Button */}
              <button
                type="button"
                onClick={handleSSO}
                className="btn-sso-glass"
              >
                Log in with SSO
              </button>
            </form>
          </div>

          {/* Bottom Footer Bar (Matching Screenshot Specification) */}
          <footer className="login-bottom-bar">
            <div className="bottom-bar-left">
              <span className="footer-logo-phi">Φ</span>
              <span className="footer-brand-name">Phasor</span>
            </div>
            <div className="bottom-bar-right">
              <span>curated for </span>
              <strong style={{ color: '#0f172a', fontWeight: 600 }}>NASA Space Apps</strong>
            </div>
          </footer>
        </div>

        {/* ===================================================================
            RIGHT HALF: RED FLOWING LIQUID HERO BACKGROUND (HOME PAGE HERO)
            =================================================================== */}
        <div className="login-right-pane">
          <RedLiquidBackground />
        </div>
      </div>

      <style jsx>{`
        .login-root {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          overflow: hidden;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* ---------------------------------------------------------------------
           LEFT HALF PANE
           --------------------------------------------------------------------- */
        .login-left-pane {
          flex: 1;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          align-items: center;
          padding: 40px 24px 24px 24px;
          background: #ffffff;
          position: relative;
          z-index: 2;
          overflow-y: auto;
        }

        /* Glass Card Container */
        .login-glass-card {
          width: 100%;
          max-width: 440px;
          margin: auto 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(241, 245, 249, 0.8);
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        /* Title & Subtitle */
        .login-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.025em;
          text-align: center;
        }

        .login-subtitle {
          font-size: 0.82rem;
          color: #64748b;
          margin: 0 0 22px 0;
          text-align: center;
        }

        .login-signup-link {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }

        .login-signup-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        /* Notice Banner */
        .login-notice-banner {
          width: 100%;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.78rem;
          color: #334155;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }

        /* Form */
        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .login-field-group {
          width: 100%;
          position: relative;
        }

        /* Glass Input Fields */
        .login-glass-input {
          width: 100%;
          padding: 11px 14px;
          font-size: 0.84rem;
          color: #0f172a;
          background: rgba(255, 255, 255, 0.8);
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .login-glass-input:focus {
          border-color: #991b1b;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.12);
        }

        .password-group {
          display: flex;
          align-items: center;
        }

        .password-toggle-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }

        .password-toggle-btn:hover {
          color: #0f172a;
        }

        /* Remember Me & Forgot Password */
        .login-options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          margin-top: -2px;
          margin-bottom: 2px;
        }

        .remember-me-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #475569;
          cursor: pointer;
          user-select: none;
        }

        .login-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #991b1b;
          cursor: pointer;
          border-radius: 4px;
        }

        .forgot-password-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .forgot-password-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        /* RED LOG IN BUTTON */
        .btn-login-red {
          width: 100%;
          padding: 10px 14px;
          background-color: #991b1b;
          color: #ffffff;
          border: none;
          border-radius: 9999px; /* Pill shape matching reference */
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(153, 27, 27, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }

        .btn-login-red:hover {
          background-color: #7f1d1d;
          box-shadow: 0 6px 20px rgba(153, 27, 27, 0.45);
          transform: translateY(-1px);
        }

        .btn-login-red:active {
          transform: translateY(0);
          background-color: #450a0a;
        }

        .btn-login-red:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* OR Divider */
        .login-divider {
          display: flex;
          align-items: center;
          width: 100%;
          margin: 10px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background-color: #e2e8f0;
        }

        .divider-text {
          padding: 0 12px;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        /* SSO Button */
        .btn-sso-glass {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 10px;
          text-align: center;
          transition: all 0.15s ease;
          border-radius: 6px;
        }

        .btn-sso-glass:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        /* Bottom Footer Bar */
        .login-bottom-bar {
          width: 100%;
          max-width: 440px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          font-size: 0.85rem;
          color: #64748b;
          border-top: 1px solid rgba(226, 232, 240, 0.6);
        }

        .bottom-bar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-logo-phi {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background-color: #991b1b;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-brand-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.95rem;
        }

        /* ---------------------------------------------------------------------
           RIGHT HALF PANE: RED FLOWING LIQUID HERO BACKGROUND
           --------------------------------------------------------------------- */
        .login-right-pane {
          flex: 1;
          position: relative;
          background-color: #060102;
          overflow: hidden;
        }

        /* Responsive Breakpoint for Mobile/Tablet */
        @media (max-width: 900px) {
          .login-root {
            flex-direction: column;
            overflow-y: auto;
          }
          .login-left-pane {
            min-height: 100vh;
            max-width: 100%;
          }
          .login-right-pane {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
