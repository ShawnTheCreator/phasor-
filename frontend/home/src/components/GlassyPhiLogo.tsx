import React, { useEffect, useState, useRef } from 'react';

// =============================================================================
// VECTOR PATHS EXTRACTED DIRECTLY FROM USER'S REFERENCE IMAGE (media_1794683159624)
// Both paths are normalized to a 64x64 coordinate box centered at (32, 32).
// Rendered with fillRule="evenodd" to naturally cut out internal optical glass holes.
// =============================================================================

// 1. UPPERCASE PHI (Φ): Roman serif capital with straight vertical center bar,
//    top/bottom horizontal serifs, and symmetrical oval bowl.
const UPPERCASE_PHI_PATH =
  'M 20.08,4.0 L 43.8,4.0 L 43.8,5.49 L 41.31,5.61 L 39.95,5.99 L 38.33,6.86 L 36.84,8.47 L 36.1,10.21 L 35.85,11.82 L 35.97,11.95 L 39.2,12.07 L 39.33,12.2 L 40.94,12.32 L 44.04,12.94 L 47.77,14.18 L 50.5,15.55 L 53.36,17.66 L 55.22,19.52 L 57.45,22.63 L 58.45,24.61 L 59.57,28.09 L 59.57,28.83 L 59.81,29.83 L 59.81,31.81 L 59.94,31.94 L 59.81,32.06 L 59.81,34.17 L 59.32,36.78 L 58.32,39.64 L 57.21,41.75 L 56.09,43.36 L 53.23,46.34 L 51.74,47.58 L 47.89,49.82 L 45.53,50.69 L 41.44,51.68 L 39.57,51.8 L 39.45,51.93 L 35.97,52.05 L 35.85,52.18 L 35.97,53.29 L 36.47,54.78 L 37.34,56.15 L 38.58,57.27 L 40.44,58.14 L 42.43,58.51 L 43.8,58.51 L 43.8,60.0 L 43.67,60.0 L 20.08,60.0 L 20.08,58.51 L 21.45,58.51 L 23.43,58.14 L 24.43,57.76 L 25.67,57.02 L 26.78,55.9 L 27.53,54.54 L 27.9,53.42 L 28.03,52.18 L 27.9,52.05 L 26.66,52.05 L 26.54,51.93 L 23.43,51.8 L 21.2,51.31 L 20.58,51.31 L 17.35,50.31 L 14.12,48.82 L 12.38,47.71 L 10.52,46.22 L 8.78,44.48 L 6.67,41.62 L 5.55,39.51 L 4.56,36.66 L 4.19,34.79 L 4.19,34.05 L 4.06,33.92 L 4.19,29.21 L 4.93,25.73 L 5.68,23.87 L 6.55,22.25 L 7.66,20.64 L 10.64,17.66 L 12.51,16.29 L 15.73,14.55 L 18.22,13.56 L 20.82,12.82 L 23.31,12.32 L 27.9,11.95 L 28.03,11.82 L 28.03,11.2 L 27.53,9.34 L 26.91,8.22 L 26.04,7.23 L 25.05,6.48 L 23.18,5.74 L 21.94,5.49 L 20.08,5.49 L 20.08,4.0 Z M 27.28,14.18 L 26.16,14.18 L 26.04,14.31 L 24.67,14.43 L 22.07,15.18 L 19.09,16.67 L 17.6,17.78 L 15.86,19.65 L 14.74,21.51 L 13.75,24.24 L 13.25,26.6 L 13.13,28.34 L 13.0,28.46 L 13.0,29.83 L 12.88,29.95 L 12.88,34.92 L 13.0,35.04 L 13.13,37.15 L 14.0,40.63 L 14.86,42.62 L 16.35,44.85 L 17.84,46.34 L 18.96,47.21 L 19.96,47.83 L 21.94,48.7 L 22.94,49.07 L 25.79,49.69 L 26.54,49.69 L 26.66,49.82 L 27.9,49.82 L 28.03,49.69 L 28.03,14.18 L 27.9,14.06 L 27.28,14.18 Z M 35.85,14.18 L 35.85,49.69 L 35.97,49.82 L 37.46,49.82 L 37.59,49.69 L 39.08,49.57 L 40.69,49.2 L 42.18,48.7 L 42.8,48.33 L 43.55,48.08 L 45.53,46.84 L 48.02,44.48 L 48.64,43.49 L 49.88,40.75 L 50.63,37.9 L 50.63,37.15 L 50.87,36.16 L 50.87,34.92 L 51.0,34.79 L 51.0,32.93 L 51.12,32.81 L 51.12,29.45 L 51.0,29.33 L 51.0,28.21 L 50.87,28.09 L 50.63,25.85 L 50.13,23.87 L 48.89,21.01 L 47.52,19.02 L 45.53,17.16 L 44.04,16.17 L 41.19,14.93 L 37.84,14.18 L 36.72,14.18 L 36.59,14.06 L 35.97,14.06 L 35.85,14.18 Z';

// 2. LOWERCASE PHI (φ): Characteristic mathematical curved form with upper arch,
//    left loop, and straight vertical descender extending downwards.
const LOWERCASE_PHI_PATH =
  'M 27.24,4.0 L 27.24,5.46 L 25.9,5.83 L 24.19,6.68 L 23.22,7.42 L 21.87,8.76 L 20.9,10.1 L 19.92,12.05 L 19.19,14.13 L 18.7,16.32 L 18.46,19.01 L 18.34,19.13 L 18.34,20.84 L 18.21,20.96 L 18.34,25.59 L 18.46,25.72 L 18.58,27.91 L 19.19,30.72 L 20.04,33.16 L 20.9,34.87 L 22.36,36.94 L 23.83,38.41 L 25.53,39.63 L 27.24,40.48 L 29.44,41.21 L 29.56,41.09 L 29.56,14.61 L 29.68,14.49 L 29.8,11.69 L 30.54,8.88 L 31.27,7.66 L 32.98,5.83 L 35.05,4.61 L 36.88,4.12 L 38.22,4.12 L 38.34,4.0 L 38.47,4.12 L 40.54,4.24 L 42.61,4.85 L 44.32,5.71 L 46.15,6.93 L 48.47,9.12 L 49.57,10.47 L 50.54,11.93 L 51.52,13.88 L 52.37,16.32 L 52.86,18.52 L 52.98,20.47 L 53.11,20.59 L 53.11,24.5 L 52.98,24.62 L 52.86,26.45 L 52.25,28.89 L 51.28,31.69 L 49.81,34.38 L 48.47,36.33 L 45.66,39.14 L 43.96,40.36 L 40.66,41.94 L 38.22,42.68 L 37.12,42.8 L 36.51,43.04 L 33.95,43.29 L 33.83,43.41 L 33.83,60.0 L 29.56,60.0 L 29.56,43.41 L 29.44,43.29 L 27.73,43.16 L 25.29,42.68 L 21.87,41.46 L 21.63,41.21 L 20.04,40.48 L 18.82,39.63 L 16.02,37.19 L 13.82,34.26 L 12.24,30.96 L 11.63,29.01 L 11.14,26.57 L 11.02,24.13 L 10.89,24.01 L 11.02,19.86 L 11.14,19.74 L 11.14,18.76 L 11.63,16.57 L 12.48,14.13 L 13.46,12.17 L 14.8,10.22 L 16.63,8.27 L 17.97,7.17 L 20.17,5.83 L 23.34,4.61 L 25.9,4.12 L 27.12,4.12 L 27.24,4.0 Z M 36.15,9.0 L 35.78,9.12 L 34.44,10.59 L 34.07,11.44 L 33.95,13.27 L 33.83,13.39 L 33.83,41.09 L 33.95,41.21 L 34.07,41.09 L 35.29,40.97 L 38.22,39.99 L 39.44,39.5 L 41.64,38.04 L 43.22,36.45 L 43.96,35.48 L 45.18,33.28 L 46.03,30.84 L 46.52,28.4 L 46.52,27.42 L 46.64,27.3 L 46.64,21.81 L 46.52,21.69 L 46.52,20.84 L 46.4,20.71 L 46.15,18.76 L 45.18,15.59 L 44.08,13.39 L 42.61,11.32 L 40.91,9.73 L 39.2,8.88 L 37.25,8.64 L 36.15,9.0 Z';

export default function GlassyPhiLogo(): JSX.Element {
  const [scrollY, setScrollY] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [morphT, setMorphT] = useState<number>(0); // 0 = Φ (Uppercase), 1 = φ (Lowercase)
  const [logoOpacity, setLogoOpacity] = useState<number>(1); // 1 = Visible, 0 = Disappeared
  const [isLight, setIsLight] = useState<boolean>(false);
  const [footerProgress, setFooterProgress] = useState<number>(0); // 0 = In corner, 1 = Centered & expanded into footer

  const prevYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);

  // =========================================================================
  // SECTION-DRIVEN LOGO MORPHING, VISIBILITY & EXPANDING FOOTER DOCKING:
  // 1. Section 1 (Hero): Logo is solid UPPERCASE Φ.
  // 2. Entering Section 2 (PinnedPipeline): Logo morphs to LOWERCASE φ and switches to light theme.
  // 3. Section 3 (StormShowcase) & Section 4 (MultiHazard): Logo APPEARS and remains visible!
  // 4. Past Section 4: Logo slowly glides inward from corner and expands into the footer.
  // =========================================================================
  useEffect(() => {
    let currentVel = 0;

    const readScroll = (): number => {
      return (
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    };

    const update = (time: number): void => {
      const currentY = readScroll();
      const dt = Math.max(1, time - lastTimeRef.current);
      const dy = currentY - prevYRef.current;
      const instantVel = (dy / dt) * 16;
      currentVel = currentVel * 0.72 + instantVel * 0.28;

      setScrollY(currentY);
      setVelocity(currentVel);

      prevYRef.current = currentY;
      lastTimeRef.current = time;

      // Section geometry checks
      const section2 = document.getElementById('how-it-works');
      const section3 = document.getElementById('replay');
      const section4 = document.getElementById('multi-hazard');
      const vh = window.innerHeight || 800;

      // 1. Morph between Φ and φ only when getting to Section 2
      let newMorphT = 0;
      let newIsLight = false;

      if (section2) {
        const r2 = section2.getBoundingClientRect();
        // Morph zone: as Section 2 approaches top (between 0.75 vh and 0.15 vh)
        const morphStart = vh * 0.75;
        const morphEnd = vh * 0.15;
        if (r2.top >= morphStart) {
          newMorphT = 0; // Section 1 (Hero): 100% Uppercase Φ
        } else if (r2.top <= morphEnd) {
          newMorphT = 1; // Section 2 (Pipeline): 100% Lowercase φ
        } else {
          const raw = (morphStart - r2.top) / (morphStart - morphEnd);
          newMorphT = raw * raw * (3 - 2 * raw); // Smooth cubic ease
        }

        // Detect white background inside Section 2 (past Step 2)
        const scrolledInS2 = Math.max(0, -r2.top);
        if (scrolledInS2 > vh * 1.3) {
          newIsLight = true;
        }
      } else {
        newMorphT = currentY > vh * 0.8 ? 1 : 0;
        newIsLight = currentY > vh * 2.5;
      }

      // 2. Sections 3 & 4: Logo appears and stays active with light theme!
      if (section3) {
        const r3 = section3.getBoundingClientRect();
        if (r3.top < vh * 0.8) {
          newIsLight = true;
          newMorphT = 1;
        }
      }

      if (section4) {
        const r4 = section4.getBoundingClientRect();
        if (r4.top < vh * 0.8) {
          newIsLight = true;
          newMorphT = 1;
        }
      }

      // 3. Past the 4th Section: Logo slowly starts to enter from the corner and expands to footer!
      let newFooterProg = 0;
      let newOpacity = 1.0;

      if (section4) {
        const r4 = section4.getBoundingClientRect();
        // Trigger as user scrolls past the bottom of Section 4 into Section 5 and Footer
        const enterStart = vh * 0.85;
        const enterEnd = -vh * 0.35;
        if (r4.bottom >= enterStart) {
          newFooterProg = 0;
        } else if (r4.bottom <= enterEnd) {
          newFooterProg = 1;
        } else {
          const raw = (enterStart - r4.bottom) / (enterStart - enterEnd);
          newFooterProg = Math.max(0, Math.min(1, raw * raw * (3 - 2 * raw)));
        }
      }

      // As it fully docks into the footer (newFooterProg > 0.82), smoothly dissolve into the footer's dedicated expanded logo
      if (newFooterProg > 0.82) {
        newOpacity = Math.max(0, (1 - newFooterProg) / 0.18);
      } else {
        newOpacity = 1.0;
      }

      setMorphT(newMorphT);
      setLogoOpacity(newOpacity);
      setIsLight(newIsLight);
      setFooterProgress(newFooterProg);

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    const onImmediateEvent = (): void => {
      const y = readScroll();
      setScrollY(y);
    };

    window.addEventListener('scroll', onImmediateEvent, { passive: true });
    window.addEventListener('wheel', onImmediateEvent, { passive: true });
    window.addEventListener('resize', onImmediateEvent, { passive: true });
    document.addEventListener('scroll', onImmediateEvent, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('scroll', onImmediateEvent);
      window.removeEventListener('wheel', onImmediateEvent);
      window.removeEventListener('resize', onImmediateEvent);
      document.removeEventListener('scroll', onImmediateEvent);
    };
  }, []);

  // Cross-dissolve, molten glass rotation, and scaling based on section morphT
  const upperOpacity = Math.max(0, Math.min(1, 1 - morphT));
  const lowerOpacity = Math.max(0, Math.min(1, morphT));
  const upperScale = 1 - morphT * 0.22;
  const lowerScale = 0.78 + morphT * 0.22;
  const upperRotate = morphT * 14;
  const lowerRotate = (1 - morphT) * -14;
  const upperBlur = morphT * 1.8;
  const lowerBlur = (1 - morphT) * 1.8;

  // 3D Physical floating & molded jelly squish with velocity
  const bobY = Math.sin(scrollY * 0.015) * 4.5 + Math.min(5, Math.max(-5, velocity * 0.12));
  const swayX = Math.cos(scrollY * 0.012) * 3;
  const pitchX = Math.min(12, Math.max(-12, velocity * 0.28)) + Math.sin(scrollY * 0.008) * 3;
  const skewX = Math.min(6, Math.max(-6, velocity * 0.1));
  const moldScaleY = 1 + Math.min(0.09, Math.abs(velocity) * 0.0035);
  const baseScale = isHovered ? 1.12 : 1.0;

  // Dynamics for gliding into center & expanding as user scrolls past Section 4
  const cornerLeft = typeof window !== 'undefined' ? Math.min(56, Math.max(16, window.innerWidth * 0.04)) : 32;
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

  const targetDeltaX = screenW / 2 - cornerLeft - 28;
  const targetDeltaY = screenH * 0.44;

  const enterX = footerProgress * targetDeltaX;
  const enterY = footerProgress * targetDeltaY;
  const expandScale = 1 + footerProgress * 3.4;

  // Clicking smoothly scrolls back to the top of the page
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside
      className="glassy-phi-logo-anchor"
      style={{
        transform: `perspective(900px) translate3d(${swayX + enterX}px, ${bobY + enterY}px, 0px) rotateX(${pitchX * (1 - footerProgress)}deg) skewX(${skewX * (1 - footerProgress)}deg) scale(${baseScale * expandScale}) scaleY(${moldScaleY})`,
        opacity: logoOpacity,
        visibility: logoOpacity > 0.005 ? 'visible' : 'hidden',
        pointerEvents: logoOpacity > 0.08 && footerProgress < 0.8 ? 'auto' : 'none',
        transition: 'opacity 0.15s ease-out, visibility 0.15s ease-out',
      }}
    >
      <a
        href="#"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`molded-glass-phi-btn ${isLight ? 'theme-light' : 'theme-dark'}`}
        title={`Molded Glass Phi (${morphT > 0.5 ? 'φ Lowercase (Section 2)' : 'Φ Uppercase (Section 1)'})`}
        aria-label="Molded Glass Phi Logo - Click to return to top"
      >
        <div className="molded-glass-viewport">
          <svg
            viewBox="0 0 64 64"
            className="molded-phi-svg"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Dark Theme Molded Glass Liquid Body Gradient */}
              <linearGradient id="phiMoldedGlassDark" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="25%" stopColor="rgba(255, 255, 255, 0.88)" />
                <stop offset="55%" stopColor="rgba(254, 202, 202, 0.78)" />
                <stop offset="82%" stopColor="#ef4444" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="0.98" />
              </linearGradient>

              {/* Light Theme Molded Glass Liquid Body Gradient */}
              <linearGradient id="phiMoldedGlassLight" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#334155" stopOpacity="0.88" />
                <stop offset="75%" stopColor="#991b1b" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#7f1d1d" stopOpacity="1" />
              </linearGradient>

              {/* Molded Glass Specular Highlight Bevel Rim */}
              <linearGradient id="phiGlassBevelRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.45)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.65)" />
              </linearGradient>
            </defs>

            {/* ===============================================================
                1. UPPERCASE PHI (Φ) - Active in Section 1 (Hero)
                =============================================================== */}
            <path
              d={UPPERCASE_PHI_PATH}
              fillRule="evenodd"
              fill={isLight ? 'url(#phiMoldedGlassLight)' : 'url(#phiMoldedGlassDark)'}
              stroke={isLight ? 'rgba(255, 255, 255, 0.95)' : 'url(#phiGlassBevelRim)'}
              strokeWidth="0.8"
              strokeLinejoin="round"
              className="molded-path-glyph"
              style={{
                opacity: upperOpacity,
                transform: `scale(${upperScale}) rotate(${upperRotate}deg)`,
                transformOrigin: '32px 32px',
                filter: `blur(${upperBlur}px)`,
                pointerEvents: upperOpacity > 0.5 ? 'auto' : 'none',
              }}
            />

            {/* ===============================================================
                2. LOWERCASE PHI (φ) - Active in Section 2 (Pinned Pipeline)
                =============================================================== */}
            <path
              d={LOWERCASE_PHI_PATH}
              fillRule="evenodd"
              fill={isLight ? 'url(#phiMoldedGlassLight)' : 'url(#phiMoldedGlassDark)'}
              stroke={isLight ? 'rgba(255, 255, 255, 0.95)' : 'url(#phiGlassBevelRim)'}
              strokeWidth="0.8"
              strokeLinejoin="round"
              className="molded-path-glyph"
              style={{
                opacity: lowerOpacity,
                transform: `scale(${lowerScale}) rotate(${lowerRotate}deg)`,
                transformOrigin: '32px 32px',
                filter: `blur(${lowerBlur}px)`,
                pointerEvents: lowerOpacity > 0.5 ? 'auto' : 'none',
              }}
            />
          </svg>
        </div>
      </a>
    </aside>
  );
}
