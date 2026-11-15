import React, { useRef, useState, useEffect } from 'react';

interface MultiHazardBentoSectionProps {
  dashboardUrl: string;
}

interface VideoSlotProps {
  videoUrl?: string;
  posterBg: string;
  badge?: string;
  badgeIcon?: string;
  title: string;
  subtitle?: string;
  aspectRatio?: string;
  textPosition?: 'inside-bottom' | 'below';
  isLargeHero?: boolean;
  heroLockup?: {
    leftLogo: string;
    rightLogo: string;
    rightSub?: string;
  };
  linkUrl?: string;
  ctaText?: string;
  children?: React.ReactNode;
}

/**
 * BentoVideoCard
 * Handles playing the video when in view, stopping at the end ("play end then stop"),
 * with replay controls and clean fallback poster graphics.
 */
function BentoVideoCard({
  videoUrl,
  posterBg,
  badge,
  title,
  subtitle,
  aspectRatio = '16/10',
  textPosition = 'below',
  isLargeHero = false,
  heroLockup,
  linkUrl,
  ctaText = 'Explore Operational View ↗',
  children,
}: VideoSlotProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Play once when scrolled into view, stop when ended ("play end then stop")
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEnded) {
            video.play().then(() => setIsPlaying(true)).catch(() => {
              // Browser autoplay policy catch
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoUrl, hasEnded]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setHasEnded(false);
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setHasEnded(true);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause(); // Explicitly stops at the end
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: isLargeHero ? '16/11' : aspectRatio,
          borderRadius: '16px',
          overflow: 'hidden',
          background: posterBg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: textPosition === 'inside-bottom' ? 'space-between' : 'flex-start',
          padding: textPosition === 'inside-bottom' ? '24px' : '16px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
        }}
      >
        {/* Actual Video Element (plays once, then stops at end) */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            autoPlay
            onEnded={handleVideoEnded}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />
        ) : null}

        {/* Video Overlay Gradient (for readable text inside) */}
        {textPosition === 'inside-bottom' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Top Tag / Badge */}
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {badge && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>▾</span>
              <span>{badge}</span>
            </span>
          )}

          {/* Replay indicator pill if video has ended */}
          {videoUrl && hasEnded && (
            <button
              onClick={handleReplay}
              title="Replay video"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                backdropFilter: 'blur(6px)',
              }}
            >
              ↺
            </button>
          )}
        </div>

        {/* Hero Lockup (Scale AI Mayo Clinic Style) */}
        {heroLockup && (
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '28px',
              margin: 'auto 0',
              padding: '20px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em' }}>
                {heroLockup.leftLogo}
              </span>
            </div>
            <div style={{ width: '1px', height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1 }}>
                {heroLockup.rightLogo}
              </span>
              {heroLockup.rightSub && (
                <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {heroLockup.rightSub}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Embedded Children Graphic (e.g. SVG benchmark or visual wireframe) */}
        {children && (
          <div style={{ position: 'relative', zIndex: 3, width: '100%', margin: 'auto 0' }}>
            {children}
          </div>
        )}

        {/* Text Inside Bottom (Matching Scale Mayo Clinic & Qatar cards) */}
        {textPosition === 'inside-bottom' && (
          <div style={{ position: 'relative', zIndex: 3 }}>
            <h3 style={{ fontSize: isLargeHero ? '1.45rem' : '1.18rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, margin: 0 }}>
                {subtitle}
              </p>
            )}
            {linkUrl && (
              <a
                href={linkUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.4)',
                  paddingBottom: '2px',
                }}
              >
                <span>{ctaText}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Text Below (Matching Scale US Capitol / Tanks / Morgan Stanley cards) */}
      {textPosition === 'below' && (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4, margin: '0 0 4px 0' }}>
            {title}
          </h4>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              {subtitle}
            </p>
          )}
          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '6px',
                color: '#991b1b',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>{ctaText}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function MultiHazardBentoSection({ dashboardUrl }: MultiHazardBentoSectionProps): JSX.Element {
  return (
    <section id="multi-hazard" className="editorial-sub-section" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '80px 0 100px 0' }}>
      <div className="editorial-container">
        {/* Top Minimal Editorial Title Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#991b1b' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#991b1b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Multi-Hazard Operations
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', margin: '0 0 10px 0' }}>
            Protecting the skies, the waves, and the cities below.
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#64748b', maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
            Geomagnetic storms cascade through every layer of technological civilization. Here is how Phasor’s specialized early-warning engines shield critical infrastructure before contact is lost.
          </p>
        </div>

        {/* =========================================================================
            BENTO GRID CONTAINER (Matching Scale AI layout from reference photo)
            ========================================================================= */}
        <div className="bento-grid-container">
          {/* =======================================================================
              LEFT COLUMN (Columns 1 to 5)
              - Top: "Introducing Phasor Defense" (Scale Labs style minimal card)
              - Mid: "Phasor | SAPP Grid" (Morgan Stanley style slate card)
              - Bottom: "MT Craton Impedance Benchmark" (SWE-bench style chart card)
              ======================================================================= */}
          <div className="bento-col-left">
            {/* 1. Scale Labs style card: Clean White Minimal Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '32px 28px',
                minHeight: '190px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: '#991b1b', textTransform: 'uppercase' }}>
                  Phasor Platform 2.0
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                  6 Operational Pictures
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
                  Introducing Phasor Multi-Hazard
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Fusing NASA L1 space telemetry with regional lithospheric models to give civil defense, air traffic, and hospital operators a 28-minute advance warning.
                </p>
              </div>
            </div>

            {/* 2. Morgan Stanley style card: Muted Slate-Blue Logo Lockup Card */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  backgroundColor: '#94a3b8',
                  borderRadius: '16px',
                  padding: '36px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  border: '1px solid #64748b',
                  minHeight: '180px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background Video Slot (User can paste MP4 URL) */}
                {/* <video src="" autoPlay muted playsInline onEnded={...} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> */}
                <div style={{ position: 'absolute', top: '14px', left: '16px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '4px' }}>
                    ▾ POWER & HEALTH
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em' }}>
                    PHASOR
                  </span>
                </div>
                <div style={{ width: '1px', height: '36px', backgroundColor: '#475569', zIndex: 2 }} />
                <div style={{ display: 'flex', flexDirection: 'column', zIndex: 2 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                    SAPP Intertie
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600 }}>
                    6 Interconnected Countries
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0 0 3px 0' }}>
                  How Southern African power pools automatically reroute 400 MW before transformer saturation
                </h4>
                <a href={`${dashboardUrl}/grid`} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 600, textDecoration: 'none' }}>
                  View SAPP Interconnected Grid ↗
                </a>
              </div>
            </div>

            {/* 3. SWE-Bench style card: Scientific Research & Metric Benchmark Card */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  minHeight: '170px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' }}>
                    ▾ RESEARCH & VALIDATION
                  </span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>
                    R² = 0.961 (T+1h)
                  </span>
                </div>

                {/* Benchmark Bar Chart Mockup (matching SWE-bench card) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#334155', marginBottom: '2px', fontWeight: 600 }}>
                      <span>Phasor 1D MT (Kaapvaal)</span>
                      <span>96.1%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '96.1%', height: '100%', backgroundColor: '#991b1b', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>
                      <span>Standard 1D Halfspace</span>
                      <span>68.4%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '68.4%', height: '100%', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '10px' }}>
                  Validated against Kyoto WDC 8.42M Dst samples & USGS EarthScope MTArray
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0 0 3px 0' }}>
                  Deep-Earth Magnetotelluric Validation: 1D Layered Conductivity
                </h4>
                <a href={`${dashboardUrl}/model`} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 600, textDecoration: 'none' }}>
                  Inspect ML LSTM Model Metrics ↗
                </a>
              </div>
            </div>
          </div>

          {/* =======================================================================
              RIGHT SECTION (Columns 6 to 12)
              - Top: Large Hero Card (Scale AI Mayo Clinic style, Forest Green / Dark Obsidian)
              - Middle: 2 Split Cards (US Capitol & Tanks style)
              - Bottom: Wide Card (Qatar style) + Right Card (Robotic Arm style)
              ======================================================================= */}
          <div className="bento-col-right">
            {/* 4. Large Hero Card: Mayo Clinic style (Deep Forest Green / Obsidian Aviation Card) */}
            <BentoVideoCard
              isLargeHero={true}
              textPosition="inside-bottom"
              posterBg="linear-gradient(135deg, #0e2a1b 0%, #06170d 100%)"
              badge="COMMERCIAL AVIATION"
              heroLockup={{
                leftLogo: 'PHASOR',
                rightLogo: 'ICAO SWIS',
                rightSub: 'Aviation Weather',
              }}
              title="ICAO Space Weather Information: Aircrew Dosimetry & Step-Down Advisories"
              subtitle="Solar Proton Events spike radiation to 82.5 µSv/h at FL390. Phasor provides certified step-downs to FL310—slashing ionizing dosage by 42%—and manages CPDLC SATCOM handover."
              linkUrl={`${dashboardUrl}/aviation`}
              ctaText="Launch Aviation Triad Dashboard ↗"
              // USER VIDEO SLOT: Replace with your copyright-free aviation video URL (e.g. cockpit clouds, airliner wing)
              videoUrl=""
            />

            {/* 5 & 6. Middle Split Row: Two Cards Side-by-Side (US Capitol & Tanks style) */}
            <div className="bento-split-row">
              {/* Card 5: HF Radio & Ionospheric Absorption (US Capitol style) */}
              <BentoVideoCard
                aspectRatio="16/10"
                textPosition="below"
                posterBg="linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                badge="HF RADIO COMMS"
                title="Ionospheric Riometer Fadeout: Real-Time MUF Depression"
                subtitle="Solar X-ray flares induce 5.8 dB D-layer absorption. Phasor alerts maritime and defense operators before complete radio blackout."
                linkUrl={`${dashboardUrl}/aviation`}
                ctaText="View Riometer Curves ↗"
                // USER VIDEO SLOT: Replace with your radio tower / satellite dish video URL
                videoUrl=""
              />

              {/* Card 6: GNSS Scintillation & Autonomous Drones (Tanks / Tactical style) */}
              <BentoVideoCard
                aspectRatio="16/10"
                textPosition="below"
                posterBg="linear-gradient(135deg, #1c1917 0%, #292524 100%)"
                badge="PRECISION GNSS"
                title="Equatorial Plasma Bubbles: Drone & Autonomous RTK Failover"
                subtitle="Scintillation (S4 > 0.60) causes 15m cycle slips. Phasor forecasts eastward drift to switch autonomous farm machinery to INS dead-reckoning."
                linkUrl={`${dashboardUrl}/gnss`}
                ctaText="Open GNSS Map ↗"
                // USER VIDEO SLOT: Replace with your autonomous drone / field tractor video URL
                videoUrl=""
              />
            </div>

            {/* 7 & 8. Bottom Row: Wide Card (Qatar building style) + Right Card (Robotic Arm style) */}
            <div className="bento-bottom-row">
              {/* Card 7: Hospital Trauma Centers (Qatar wide landscape card style) */}
              <div className="bento-bottom-wide">
                <BentoVideoCard
                  aspectRatio="16/10"
                  textPosition="inside-bottom"
                  posterBg="linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)"
                  badge="HOSPITAL RESILIENCE"
                  title="Hospital Grid Feeder Shield: Protecting ICU Backup"
                  subtitle="Topologically coupling 8 major tertiary hospitals to 400 kV substations while projecting +58% stroke and 2.15x cardiac surge loads."
                  linkUrl={`${dashboardUrl}/health`}
                  ctaText="View Hospital Grid Matrix ↗"
                  // USER VIDEO SLOT: Replace with your hospital / medical ICU video URL
                  videoUrl=""
                />
              </div>

              {/* Card 8: LEO Satellites (Robotic Arm / Physical AI style) */}
              <div className="bento-bottom-narrow">
                <BentoVideoCard
                  aspectRatio="16/10"
                  textPosition="below"
                  posterBg="linear-gradient(135deg, #020617 0%, #0f172a 100%)"
                  badge="ORBITAL DRAG"
                  title="Thermospheric Swelling: 7-Day Orbit-Raise"
                  subtitle="NRLMSISE-00 density models predict drag spikes on LEO constellations for safe thruster burn timing."
                  linkUrl={`${dashboardUrl}/satellites`}
                  ctaText="Inspect LEO Fleet ↗"
                  // USER VIDEO SLOT: Replace with your satellite / space orbit video URL
                  videoUrl=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
