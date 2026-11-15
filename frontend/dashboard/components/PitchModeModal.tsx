import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface PitchCue {
  id: number;
  timeRange: string;
  title: string;
  spokenText: string;
  screenRoute: string;
  actionLabel: string;
  visualCue: string;
  keyStats: string[];
}

const PITCH_CUES: PitchCue[] = [
  {
    id: 1,
    timeRange: '0:00 – 0:35',
    title: 'The Southern African Grid Reality',
    spokenText:
      "I've travelled through Botswana, Zimbabwe, Malawi and Zambia, and stood at the borders of Mozambique. When you move through Southern Africa like that, you stop noticing the landscape and start noticing the infrastructure: the generator behind a shopfront, the lights that die at night, the hospital running on a backup cable. In this region, electricity is a daily negotiation.",
    screenRoute: '/grid',
    actionLabel: 'Show SAPP Transmission Grid',
    visualCue: 'SAPP Cross-Border Grid Topology: South Africa, Botswana, Mozambique, Zimbabwe interconnections.',
    keyStats: ['765 kV & 400 kV Backbone', 'Southern African Power Pool', 'Daily Grid Fragility']
  },
  {
    id: 2,
    timeRange: '0:35 – 0:58',
    title: 'From Car Rides to Power Systems Code',
    spokenText:
      'I come from a computer science background, but I grew up around the other side of the wall. My father is an electrical engineer. When I was learning to drive, I drove him around, and those car rides were my first lectures in power systems: substations, transformers, why you never take reactive power for granted. Phasor is what happens when the kid from those car rides learns to code.',
    screenRoute: '/grid',
    actionLabel: 'Focus Transformer Core Saturation',
    visualCue: '765 kV Autotransformer CAD Cutaway & Non-linear B-H Magnetization Loop.',
    keyStats: ['Grain-Oriented M4 Steel', 'Half-Cycle Saturation', 'Reactive Power Deficit']
  },
  {
    id: 3,
    timeRange: '0:58 – 1:32',
    title: 'The Solar Threat: Faraday’s Law in the Grid',
    spokenText:
      "Here's the threat. In 1989, a solar storm collapsed the entire Hydro-Québec grid in 92 seconds. The physics is Faraday's law: a coronal mass ejection compresses Earth's magnetic field, the changing field induces an electric field in the ground, and that drives quasi-DC current through transformer neutrals — up to 150 amps per phase the grid was never designed to carry. Cores saturate, tanks overheat by 100 degrees within minutes, transformers drink reactive power, and the grid collapses.",
    screenRoute: '/grid',
    actionLabel: 'Simulate 150A GIC Neutral Spike',
    visualCue: 'Stray magnetic flux escaping into transformer tank walls, overheating oil by +100°C in seconds.',
    keyStats: ['92 Seconds Collapse (Québec 1989)', '150 A Quasi-DC per Phase', '+100°C Tank Overheating']
  },
  {
    id: 4,
    timeRange: '1:32 – 2:02',
    title: 'Why Here? The Kaapvaal Geological Amplifier',
    spokenText:
      'Why here? Because of the rock under our feet. South Africa sits on the Kaapvaal craton, with crustal resistivity up to 10,000 ohm-metres. That geology amplifies the induced electric field four to ten times. Our long 765 kV corridors are antennae laid across a geological amplifier — and an extreme storm is estimated at up to 2.6 trillion dollars in first-year losses globally.',
    screenRoute: '/model',
    actionLabel: 'Open Kaapvaal Lithospheric Model',
    visualCue: '1D Magnetotelluric Impedance Tensor Z(ω) & 10,000 Ω·m Resistive Cratonic Basement.',
    keyStats: ['10,000 Ω·m Crustal Resistivity', '4× to 10× Geoelectric Amplification', '$2.6 Trillion Global Threat']
  },
  {
    id: 5,
    timeRange: '2:02 – 2:25',
    title: 'The African Observation Gap',
    spokenText:
      'The United States already watches this in real time: NOAA and the USGS run a one-minute geoelectric field map for American grids. Africa has nothing equivalent. SANSA in Hermanus is our only space-weather warning centre. That gap is Phasor.',
    screenRoute: '/',
    actionLabel: 'Display Real-Time Observational Gap',
    visualCue: 'Live Hermanus (HER) Magnetometer Feed & Comparison with USGS/NOAA Coverage.',
    keyStats: ['1 Space Weather Center for 54 Nations', 'Zero Real-Time Geoelectric Grid Maps', 'Bridged by Phasor']
  },
  {
    id: 6,
    timeRange: '2:25 – 2:48',
    title: 'Multi-Tier Early-Warning: DONKI, DSCOVR & LSTM',
    spokenText:
      "Phasor is a multi-tier early-warning platform. NASA's DONKI gives us CME arrival windows 18 to 36 hours ahead. DSCOVR at the L1 point streams solar wind one minute at a time — 15 to 60 minutes of tactical warning. Our LSTM, trained on NASA's OMNIWeb archive back to 1963, forecasts storm intensity one to six hours ahead with R-squared up to 0.96, published with confidence bands. A local magnetometer anchors it to ground truth.",
    screenRoute: '/hardware',
    actionLabel: 'Inspect 3D Magnetometer Digital Twin',
    visualCue: '3D WebGL RP2040 + PNI RM3100 Magnetometer Digital Twin with Live B-Vector ($B_x, B_y, B_z$).',
    keyStats: ['DONKI: 18–36h Strategic Warning', 'DSCOVR L1: 15–60m Tactical Warning', 'LSTM: R² = 0.961 on OMNIWeb 1963–2026']
  },
  {
    id: 7,
    timeRange: '2:48 – 3:10',
    title: 'Autonomous Defense: Millisecond Islanding',
    spokenText:
      'And when thresholds cross, Phasor acts: neutral-blocking devices cut grid currents by over 94 percent, reactive support is pre-positioned, hospitals island in under 100 milliseconds.',
    screenRoute: '/alerts',
    actionLabel: 'Trigger Substation Islanding Matrix',
    visualCue: 'Automated SCADA tripping sequence: Neutral Blocking Active (-94.2% GIC), Hospital Microgrid Islanded.',
    keyStats: ['94.2% GIC Reduction', '<100ms Microgrid Islanding', 'Pre-Positioned Static VARs']
  },
  {
    id: 8,
    timeRange: '3:10 – 3:30',
    title: 'The Next Frontier: Defending What We Built',
    spokenText:
      "Our challenge is the Earth System Trend Detective. Phasor answers it honestly: five decades of NASA observations, statistically significant geomagnetic trends, and regional exposure that is changing — translated into action. The next frontier isn't only the Moon and Mars. It's protecting the civilisation we already built, from a star we cannot switch off. The Sun will send the next storm. This time, we're watching. Thank you.",
    screenRoute: '/',
    actionLabel: 'Return to Executive Command Center',
    visualCue: 'NASA Open Science Provenance & Real-Time Planetary Defense Status: NOMINAL.',
    keyStats: ['5 Decades of Open NASA Telemetry', 'Statistically Validated Trends', 'Open Science Planetary Defense']
  }
];

export default function PitchModeModal(): JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeCueId, setActiveCueId] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Stopwatch timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSec: number): string => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNavigate = (route: string, cueId: number) => {
    setActiveCueId(cueId);
    if (router.pathname !== route) {
      router.push(route);
    }
  };

  return (
    <>
      {/* Floating Launcher Pill (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          backgroundColor: '#991b1b',
          color: '#ffffff',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 10px 25px -5px rgba(153, 27, 27, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          fontWeight: 700,
          fontSize: '0.82rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <span>3-Min Pitch Companion</span>
        {isTimerRunning && (
          <span style={{
            fontFamily: 'monospace',
            backgroundColor: '#0f172a',
            padding: '2px 7px',
            borderRadius: '4px',
            fontSize: '0.74rem'
          }}>
            {formatTime(timerSeconds)}
          </span>
        )}
      </button>

      {/* Slide-Over Pitch Drawer / Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          zIndex: 10000,
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.18)',
          borderLeft: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          color: '#0f172a'
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: '18px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(153, 27, 27, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#991b1b'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <div>
                <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>
                  Phasor 3-Minute Live Pitch Companion
                </strong>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Synchronized Teleprompter & Live Screen Controller
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '1.4rem',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1
              }}
              title="Close companion"
            >
              &times;
            </button>
          </div>

          {/* Stopwatch & Speed Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: timerSeconds > 180 ? '#dc2626' : '#0284c7'
              }}>
                {formatTime(timerSeconds)}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>/ 3:00 Target Pace</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsTimerRunning(r => !r)}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isTimerRunning ? '#d97706' : '#16a34a',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isTimerRunning ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Start Timer</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Cue Cards Scrollable Feed */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            backgroundColor: '#ffffff'
          }}>
            {PITCH_CUES.map(cue => {
              const isActive = activeCueId === cue.id;
              return (
                <div
                  key={cue.id}
                  style={{
                    backgroundColor: isActive ? 'rgba(153, 27, 27, 0.04)' : '#f8fafc',
                    border: `1.5px solid ${isActive ? '#991b1b' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    padding: '16px',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(153, 27, 27, 0.08)' : 'none'
                  }}
                >
                  {/* Card Header: Timestamp & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: isActive ? '#991b1b' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#0284c7'
                    }}>
                      {cue.timeRange}
                    </span>
                    <strong style={{ fontSize: '0.86rem', color: isActive ? '#991b1b' : '#0f172a' }}>
                      {cue.title}
                    </strong>
                  </div>

                  {/* Spoken Word Script Text */}
                  <p style={{
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                    color: isActive ? '#0f172a' : '#334155',
                    margin: '0 0 12px 0'
                  }}>
                    {cue.spokenText}
                  </p>

                  {/* Stage Direction / Visual Cue Callout */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '9px 12px',
                    fontSize: '0.74rem',
                    color: '#475569',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <div>
                      <strong style={{ color: '#d97706' }}>On Screen: </strong>
                      <span>{cue.visualCue}</span>
                    </div>
                  </div>

                  {/* Stats Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {cue.keyStats.map((st, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          color: '#0284c7',
                          border: '1px solid #e2e8f0',
                          fontWeight: 600
                        }}
                      >
                        &bull; {st}
                      </span>
                    ))}
                  </div>

                  {/* Live Sync Trigger Button */}
                  <button
                    onClick={() => handleNavigate(cue.screenRoute, cue.id)}
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? '#991b1b' : '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cue.actionLabel}</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#64748b'
          }}>
            <span>Click any cue button to instantly switch the app screen.</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>&bull; Live Telemetry Linked</span>
          </div>
        </div>
      )}
    </>
  );
}
