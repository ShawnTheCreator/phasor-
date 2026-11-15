import React, { useState } from 'react';

interface MultiHazardDefenseSectionProps {
  dashboardUrl: string;
}

type SectorFilter = 'all' | 'aviation' | 'radio' | 'gnss' | 'health' | 'satellites' | 'public';

interface DefenseCard {
  id: string;
  category: SectorFilter;
  badge: string;
  badgeColor: string;
  title: string;
  threatTitle: string;
  threatDesc: string;
  shieldTitle: string;
  shieldDesc: string;
  keyMetric: string;
  metricLabel: string;
  dashboardPath: string;
  dashboardCta: string;
  icon: JSX.Element;
}

export default function MultiHazardDefenseSection({ dashboardUrl }: MultiHazardDefenseSectionProps): JSX.Element {
  const [selectedFilter, setSelectedFilter] = useState<SectorFilter>('all');

  const cards: DefenseCard[] = [
    {
      id: 'aviation',
      category: 'aviation',
      badge: 'Commercial Aviation',
      badgeColor: '#dc2626',
      title: 'Aircrew Dosimetry & Trans-Polar Flight Corridors',
      threatTitle: 'Atmospheric Ionizing Radiation & HF Blackout',
      threatDesc: 'Solar Proton Events (SPE) bombard cruising altitudes (FL390 / ~39,000 ft) with ionizing radiation up to 82.5 µSv/h, exceeding ICAO pregnant aircrew thresholds while killing HF radio navigation on high-latitude routes.',
      shieldTitle: 'Proactive Altitude Step-Downs & SATCOM Handover',
      shieldDesc: 'Phasor calculates real-time ICAO SWIS bulletins, advising flight dispatchers to step down from FL390 to FL310—reducing passenger and crew ionizing radiation exposure by 42%—and seamlessly hand over comms to SATCOM CPDLC before entering blackout corridors.',
      keyMetric: '-42% Dose Rate',
      metricLabel: 'From 82.5 to 47.8 µSv/h via FL310 Step-Down',
      dashboardPath: '/aviation',
      dashboardCta: 'Inspect Aviation Triad ↗',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"></path>
        </svg>
      )
    },
    {
      id: 'radio',
      category: 'radio',
      badge: 'HF Radio & Telecoms',
      badgeColor: '#d97706',
      title: 'Shortwave Fadeout & Ionospheric Riometer Absorption',
      threatTitle: 'Solar X-Ray Flares & 50%+ MUF Depression',
      threatDesc: 'Extreme solar flares trigger sudden ionospheric disturbances (SID), dumping high electron densities into the D-layer. High-frequency (3–30 MHz) radio waves used by maritime, aviation, and defense are completely absorbed.',
      shieldTitle: 'Live dB Absorption Modeling & Frequency Shift Advisories',
      shieldDesc: 'Phasor processes ground riometer data from the SANSA Hermanus Geomagnetic Observatory, measuring absorption in decibels (dB) in real-time and forecasting Maximum Usable Frequency (MUF) depressions so dispatchers switch bands hours before radio silence.',
      keyMetric: '5.8 dB Riometer Absorption',
      metricLabel: '54% Maximum Usable Frequency (MUF) Depression',
      dashboardPath: '/aviation',
      dashboardCta: 'View Radio Absorption Curves ↗',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
          <circle cx="12" cy="12" r="2"></circle>
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
          <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"></path>
        </svg>
      )
    },
    {
      id: 'gnss',
      category: 'gnss',
      badge: 'Precision GPS & Drones',
      badgeColor: '#0284c7',
      title: 'GNSS Scintillation & Autonomous Field Machine Guidance',
      threatTitle: 'Equatorial Plasma Bubbles (EPB) & 15m Positioning Drift',
      threatDesc: 'Post-sunset ionospheric turbulence creates equatorial plasma bubbles drifting across the continent. These bubbles produce rapid amplitude (S4 > 0.60) and phase scintillation, causing RTK cycle slips and breaking GPS lock for precision farming and drone surveying.',
      shieldTitle: '1–3 Hour Eastward EPB Drift Forecasts & INS Failover',
      shieldDesc: 'Using PRISM scintillation physics across regional Septentrio and IGS receiver arrays, Phasor maps bubble trajectories and alerts autonomous farm equipment, mining haulers, and drones to switch to Inertial Dead-Reckoning (INS) before lock is severed.',
      keyMetric: '1–3h EPB Eastward Drift',
      metricLabel: 'Zonal drift mapped across Southern African corridors',
      dashboardPath: '/gnss',
      dashboardCta: 'Explore GNSS Scintillation Map ↗',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="22" y1="12" x2="18" y2="12"></line>
          <line x1="6" y1="12" x2="2" y2="12"></line>
          <line x1="12" y1="6" x2="12" y2="2"></line>
          <line x1="12" y1="22" x2="12" y2="18"></line>
        </svg>
      )
    },
    {
      id: 'health',
      category: 'health',
      badge: 'Hospital Resilience',
      badgeColor: '#e11d48',
      title: 'Trauma Hub Feeder Integrity & Clinical Cardiovascular Surge',
      threatTitle: 'Cascading Substation Tripping & +58% Stroke Surges',
      threatDesc: 'Geomagnetically Induced Currents threaten the specific 400/132 kV substations feeding major medical trauma centers. Simultaneously, clinical studies link extreme geomagnetic fluctuations (Dst < -300 nT) to spikes in ischemic stroke and cardiac ICU emergencies.',
      shieldTitle: 'Direct Grid-to-Hospital Mapping & Pre-Emptive UPS Verifications',
      shieldDesc: 'Phasor pairs tertiary hospitals (such as Chris Hani Baragwanath, Charlotte Maxeke, Tygerberg, Groote Schuur) to their physical high-voltage feeders. When GIC thresholds trip, automated SMS alerts prompt facilities to verify diesel generator fuel and UPS battery reserves.',
      keyMetric: '+58% Stroke Multiplier',
      metricLabel: '2.15x Clinical surge index during extreme storms',
      dashboardPath: '/health',
      dashboardCta: 'View Hospital Grid Matrix ↗',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      )
    },
    {
      id: 'satellites',
      category: 'satellites',
      badge: 'LEO Spacecraft & Constellations',
      badgeColor: '#7c3aed',
      title: 'Thermospheric Expansion & Atmospheric Orbital Drag',
      threatTitle: '4.2x Atmospheric Swelling & Rapid Altitude Decay',
      threatDesc: 'Solar EUV radiation deposits immense energy into the neutral thermosphere, heating and expanding the atmosphere at 300–550 km altitudes. Satellites experience sudden aerodynamic drag spikes, losing hundreds of meters of altitude per week.',
      shieldTitle: 'NRLMSISE-00 Density Models & Conjunction Evasion Windows',
      shieldDesc: 'Phasor simulates thermospheric density factors in real-time, forecasting 7-day orbital decay for African Earth Observation satellites and commercial mega-constellations, and calculating safe burn windows for electric and chemical thruster orbit-raise maneuvers.',
      keyMetric: '+320% Thermospheric Density',
      metricLabel: '3.5 km dynamic conjunction collision risk bubble',
      dashboardPath: '/satellites',
      dashboardCta: 'Inspect LEO Orbital Decay ↗',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
      )
    },
    {
      id: 'public',
      category: 'public',
      badge: 'Civil Defense & Field Alerting',
      badgeColor: '#059669',
      title: 'Last-Mile SMS & Nationwide Cell Broadcasting',
      threatTitle: 'Rural Telecom Infrastructure Failure During Blackout',
      threatDesc: 'During catastrophic geomagnetic events, high-bandwidth mobile internet (5G/4G) and fiber backhauls frequently collapse due to grid blackouts. Field operators in rural mining and farming corridors are left completely disconnected from browser dashboards.',
      shieldTitle: 'Ultra-Low-Bandwidth 2G SMS & Civil Cell Broadcast (SMS-CB)',
      shieldDesc: 'Phasor integrates directly with Africa’s Talking and Twilio carrier gateways to push compressed, actionable plain-text emergency instructions to basic 2G feature phones, paired with emergency Cell Broadcast protocols for national disaster managers.',
      keyMetric: 'Zero Internet Required',
      metricLabel: 'Automated 2G SMS & Radio Emergency Broadcast',
      dashboardPath: '/public',
      dashboardCta: 'Test Emergency Broadcast ↗',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      )
    }
  ];

  const filteredCards = selectedFilter === 'all'
    ? cards
    : cards.filter((c) => c.category === selectedFilter);

  return (
    <section id="multi-hazard" className="editorial-sub-section" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '90px 0' }}>
      <div className="editorial-container">
        {/* Section Header */}
        <div className="editorial-header" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '9999px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#991b1b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Beyond The Power Grid &bull; Multi-Hazard Resilience
            </span>
          </div>
          <h2 className="editorial-title" style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', marginBottom: '16px' }}>
            Protecting the skies, the waves, and the cities below.
          </h2>
          <p className="editorial-sub-desc" style={{ maxWidth: '820px', fontSize: '1.05rem', lineHeight: 1.65, color: '#475569' }}>
            A geomagnetic superstorm does not stop at high-voltage transmission lines. Phasor delivers real-time operational defense across commercial aviation, high-frequency radio, precision satellite navigation, critical healthcare, and rural emergency communications.
          </p>
        </div>

        {/* Filter Navigation Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          {[
            { id: 'all', label: 'All Critical Sectors' },
            { id: 'aviation', label: '✈️ Planes & Aviation' },
            { id: 'radio', label: '📡 Radio & HF Comms' },
            { id: 'gnss', label: '🛰️ Precision GPS & Drones' },
            { id: 'health', label: '🏥 Hospital Trauma Hubs' },
            { id: 'satellites', label: '🚀 LEO Spacecraft' },
            { id: 'public', label: '📢 Last-Mile Broadcast' },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as SectorFilter)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  backgroundColor: isActive ? '#0f172a' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(15, 23, 42, 0.15)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Operational Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredCards.map((card) => (
            <article
              key={card.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 23, 42, 0.08)';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.03)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                {/* Header with Icon & Category Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.badgeColor
                  }}>
                    {card.icon}
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155'
                  }}>
                    {card.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '18px' }}>
                  {card.title}
                </h3>

                {/* The Threat Section */}
                <div style={{ marginBottom: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem' }}>⚠️</span>
                    <strong style={{ fontSize: '0.8rem', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>The Hazard</strong>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#7f1d1d', marginBottom: '4px' }}>
                    {card.threatTitle}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.5, margin: 0 }}>
                    {card.threatDesc}
                  </p>
                </div>

                {/* How Phasor Helps Section */}
                <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem' }}>🛡️</span>
                    <strong style={{ fontSize: '0.8rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>How Phasor Shields Operations</strong>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    {card.shieldTitle}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {card.shieldDesc}
                  </p>
                </div>
              </div>

              {/* Bottom Metric & Live CTA */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                      {card.keyMetric}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {card.metricLabel}
                    </div>
                  </div>
                </div>

                <a
                  href={`${dashboardUrl}${card.dashboardPath}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#991b1b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0f172a';
                  }}
                >
                  <span>{card.dashboardCta}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
