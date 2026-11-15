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
  aspectRatio = '16/9',
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

  // Play once ONLY when scrolled into view, stop when ended ("play end then stop")
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    // Ensure it starts paused so it never plays off-screen before being scrolled into view
    video.pause();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // User scrolled into view: start playing now
            if (!hasEnded) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(() => {});
              }
            }
          } else {
            // User scrolled away before video ended: pause so they don't miss the rest
            if (!hasEnded && !video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
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

  const handleCardClick = () => {
    if (videoUrl && videoRef.current && hasEnded) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setHasEnded(false);
      setIsPlaying(true);
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
        onClick={handleCardClick}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: isLargeHero ? '16/9.5' : aspectRatio,
          borderRadius: '16px',
          overflow: 'hidden',
          background: posterBg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: textPosition === 'inside-bottom' ? 'space-between' : 'flex-start',
          padding: textPosition === 'inside-bottom' ? '20px 24px' : '14px 16px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          cursor: hasEnded ? 'pointer' : 'default',
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
        {/* Actual Video Element (strictly scroll-triggered, never autoplays on page load) */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            loop={false}
            preload="auto"
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
        {heroLockup && !videoUrl && (
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
    <section id="multi-hazard" className="editorial-sub-section" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '64px 0 88px 0' }}>
      <div className="editorial-container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)', boxSizing: 'border-box' }}>
        {/* Top Minimal Editorial Title Bar */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.45rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', margin: '0 0 10px 0' }}>
            Protecting the skies, the waves, and the cities below.
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#64748b', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
            Geomagnetic storms cascade through every layer of technological civilization. Here is how Phasor’s specialized early-warning engines shield critical infrastructure before contact is lost.
          </p>
        </div>

        {/* =========================================================================
            BENTO GRID CONTAINER (Matching Scale AI layout from reference photo)
            ========================================================================= */}
        <div className="bento-grid-container">
          {/* Card 1: SAPP Intertie (Regional Power Pool Video Card) */}
          <div className="bento-card-span-5">
            <BentoVideoCard
              isLargeHero={false}
              aspectRatio="16/9"
              textPosition="below"
              posterBg="#0f172a"
              badge="REGIONAL POWER POOL"
              title="Southern African Power Pool: Dynamic Islanding"
              subtitle="How Southern African power pools automatically reroute 400 MW before transformer core saturation occurs."
              linkUrl={`${dashboardUrl}/grid`}
              ctaText="View SAPP Interconnected Grid ↗"
              videoUrl="/videos/Grid_Pool.mp4"
            />
          </div>

          {/* Card 2: Commercial Aviation (Fighter Jet Video Card) */}
          <div className="bento-card-span-7">
            <BentoVideoCard
              isLargeHero={true}
              aspectRatio="16/9.5"
              textPosition="inside-bottom"
              posterBg="#09121a"
              badge="COMMERCIAL AVIATION"
              title="ICAO Space Weather Information: Aircrew Dosimetry & Step-Down Advisories"
              subtitle="Solar Proton Events spike radiation to 82.5 µSv/h at FL390. Phasor provides certified step-downs to FL310—slashing ionizing dosage by 42%—and manages CPDLC SATCOM handover."
              linkUrl={`${dashboardUrl}/aviation`}
              ctaText="Launch Aviation Triad Dashboard ↗"
              videoUrl="/videos/Fighter_Jet.mp4"
            />
          </div>

          {/* Card 3: HF Radio Comms (Radio Satellite Video Card) */}
          <div className="bento-card-span-6">
            <BentoVideoCard
              aspectRatio="16/9"
              textPosition="below"
              posterBg="#0f172a"
              badge="HF RADIO COMMS"
              title="Ionospheric Riometer Fadeout: Real-Time MUF Depression"
              subtitle="Solar X-ray flares induce 5.8 dB D-layer absorption. Phasor alerts maritime and defense operators before complete radio blackout."
              linkUrl={`${dashboardUrl}/aviation`}
              ctaText="View Riometer Curves ↗"
              videoUrl="/videos/Radio_Satalite.mp4"
            />
          </div>

          {/* Card 4: Precision GNSS & Drones (Drone Video Card) */}
          <div className="bento-card-span-6">
            <BentoVideoCard
              aspectRatio="16/9"
              textPosition="below"
              posterBg="#090d16"
              badge="PRECISION GNSS & DRONES"
              title="Equatorial Plasma Bubbles: Drone & Autonomous RTK Failover"
              subtitle="Scintillation (S4 > 0.60) causes 15m cycle slips. Phasor forecasts eastward drift to switch autonomous farm machinery to INS dead-reckoning."
              linkUrl={`${dashboardUrl}/gnss`}
              ctaText="Open GNSS Map ↗"
              videoUrl="/videos/Drone.mp4"
            />
          </div>

          {/* Card 5: Hospital Resilience (Medical ICU Video Card) */}
          <div className="bento-card-span-7">
            <BentoVideoCard
              aspectRatio="16/9.5"
              textPosition="inside-bottom"
              posterBg="#090d16"
              badge="HOSPITAL RESILIENCE"
              title="Hospital Grid Feeder Shield: Protecting ICU Backup"
              subtitle="Topologically coupling 8 major tertiary hospitals to 400 kV substations while projecting +58% stroke and 2.15x cardiac surge loads."
              linkUrl={`${dashboardUrl}/health`}
              ctaText="View Hospital Grid Matrix ↗"
              videoUrl="/videos/Medical.mp4"
            />
          </div>

          {/* Card 6: LEO Satellites (Orbit Video Card) */}
          <div className="bento-card-span-5">
            <BentoVideoCard
              aspectRatio="16/9"
              textPosition="below"
              posterBg="#020617"
              badge="ORBITAL DRAG"
              title="Thermospheric Swelling: 7-Day Orbit-Raise"
              subtitle="NRLMSISE-00 density models predict drag spikes on LEO constellations for safe thruster burn timing."
              linkUrl={`${dashboardUrl}/satellites`}
              ctaText="Inspect LEO Fleet ↗"
              videoUrl="/videos/Orbit.mp4"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
