import React, { useState, useEffect } from 'react';

interface TransformerCoreSaturationDiagramProps {
  gicAmps?: number;
  qLossMvar?: number;
  voltageKv?: number;
}

export default function TransformerCoreSaturationDiagram({
  gicAmps = 26.8,
  qLossMvar = 9.8,
  voltageKv = 765
}: TransformerCoreSaturationDiagramProps): JSX.Element {
  const [phaseAngle, setPhaseAngle] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'3d-cad' | 'physics-curves'>('3d-cad');
  const [interactiveGic, setInteractiveGic] = useState<number>(gicAmps);

  // 50Hz electrical cycle animation
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseAngle(prev => (prev + 14) % 360);
    }, 45);
    return () => clearInterval(timer);
  }, []);

  // Update when prop changes
  useEffect(() => {
    setInteractiveGic(gicAmps);
  }, [gicAmps]);

  // Compute flux with quasi-DC offset
  const rad = (phaseAngle * Math.PI) / 180;
  const dcBiasOffset = Math.min(1.4, (interactiveGic / 25) * 0.95); // Tesla DC bias offset
  const acFlux = Math.sin(rad) * 1.5; // AC swing +/- 1.5 Tesla
  const totalFlux = acFlux + dcBiasOffset;

  // Saturated magnetizing current spike (non-linear when totalFlux > 1.7 Tesla)
  const isSaturated = totalFlux > 1.7;
  const coreTemperatureRiseC = Math.round(interactiveGic * 1.85);

  // Harmonics breakdown based on GIC DC bias
  const harmonics = [
    { harmonic: 'Fund (50 Hz)', pct: 100, amp: (voltageKv * 1.2).toFixed(0) },
    { harmonic: '2nd (100 Hz)', pct: Math.min(68, (interactiveGic / 25) * 48), amp: ((interactiveGic / 25) * 38).toFixed(1) },
    { harmonic: '3rd (150 Hz)', pct: Math.min(50, (interactiveGic / 25) * 34), amp: ((interactiveGic / 25) * 28).toFixed(1) },
    { harmonic: '4th (200 Hz)', pct: Math.min(34, (interactiveGic / 25) * 24), amp: ((interactiveGic / 25) * 20).toFixed(1) },
    { harmonic: '5th (250 Hz)', pct: Math.min(28, (interactiveGic / 25) * 18), amp: ((interactiveGic / 25) * 14).toFixed(1) },
  ];

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
      overflow: 'hidden',
      marginTop: '16px',
      color: '#0f172a'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isSaturated ? '#ef4444' : '#10b981',
            boxShadow: isSaturated ? '0 0 10px #ef4444' : '0 0 8px #10b981'
          }} />
          <strong style={{ fontSize: '0.88rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
            765 kV SINGLE-PHASE TRANSFORMER CORE SATURATION & PHASOR DEFICIT
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (Non-Linear Faraday & B-H Magnetizing Dynamics)
          </span>
        </div>

        {/* Tab & Saturation Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: isSaturated ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            color: isSaturated ? '#dc2626' : '#059669',
            fontWeight: 700,
            border: `1px solid ${isSaturated ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
          }}>
            {isSaturated ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            )}
            <span>{isSaturated ? 'HALF-CYCLE SATURATION DETECTED' : 'NOMINAL LINEAR CORE FLUX'}</span>
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('3d-cad')}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTab === '3d-cad' ? '#0284c7' : 'transparent',
                color: activeTab === '3d-cad' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              3D CAD Cutaway
            </button>
            <button
              onClick={() => setActiveTab('physics-curves')}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTab === 'physics-curves' ? '#0284c7' : 'transparent',
                color: activeTab === 'physics-curves' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              B-H Physics & Harmonics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === '3d-cad' ? (
        <div style={{ padding: '20px' }}>
          {/* Top Interactive Injection Slider & Stat Gauges */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            padding: '12px 18px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Quasi-DC GIC Injection:</span>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={interactiveGic}
                onChange={e => setInteractiveGic(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#dc2626', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: interactiveGic > 20 ? '#dc2626' : '#0284c7', fontSize: '0.92rem', minWidth: '48px' }}>
                {interactiveGic} A
              </span>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Core Flux B</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: isSaturated ? '#dc2626' : '#0f172a', fontFamily: 'monospace' }}>
                  {totalFlux.toFixed(2)} T {isSaturated ? '(Saturated)' : ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Hotspot ΔT</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: coreTemperatureRiseC > 35 ? '#dc2626' : '#d97706', fontFamily: 'monospace' }}>
                  +{coreTemperatureRiseC} °C
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Q_loss Deficit</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                  {((interactiveGic / 25) * qLossMvar).toFixed(1)} MVAR
                </div>
              </div>
            </div>
          </div>

          {/* Hyper-Realistic 3D Isometric CAD Cutaway of 765kV Transformer Core with glowing saturation */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '380px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <svg viewBox="0 0 800 380" style={{ width: '100%', height: '100%' }}>
              <defs>
                {/* Metallic Shaders & Gradients */}
                <linearGradient id="core-steel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isSaturated ? '#7f1d1d' : '#475569'} />
                  <stop offset="50%" stopColor={isSaturated ? '#dc2626' : '#64748b'} />
                  <stop offset="100%" stopColor={isSaturated ? '#991b1b' : '#334155'} />
                </linearGradient>

                <linearGradient id="copper-winding-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="40%" stopColor="#d97706" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                <linearGradient id="bushing-porcelain" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="50%" stopColor="#854d0e" />
                  <stop offset="100%" stopColor="#713f12" />
                </linearGradient>

                <filter id="thermal-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Floor Isometric Markings */}
              <g opacity="0.35" stroke="#cbd5e1" strokeWidth="0.8">
                {Array.from({ length: 11 }).map((_, i) => (
                  <line key={`x-${i}`} x1={150 + i * 50} y1="360" x2={50 + i * 50} y2="280" />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`y-${i}`} x1={100 + i * 20} y1={280 + i * 16} x2={650 + i * 20} y2={280 + i * 16} />
                ))}
              </g>

              {/* Oil Tank Cutaway Structural Walls (Isometric Enclosure) */}
              <polygon
                points="180,330 620,330 680,240 240,240"
                fill="#f1f5f9"
                fillOpacity="0.9"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <polygon
                points="180,330 180,140 240,80 240,240"
                fill="#e2e8f0"
                fillOpacity="0.85"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <polygon
                points="620,330 620,140 680,80 680,240"
                fill="#e2e8f0"
                fillOpacity="0.7"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {/* Cooling Radiator Fins (Left External) */}
              {Array.from({ length: 7 }).map((_, i) => (
                <g key={`fin-${i}`}>
                  <rect
                    x={120 + i * 7}
                    y={160}
                    width="4"
                    height="120"
                    fill="#94a3b8"
                    stroke="#64748b"
                    strokeWidth="0.6"
                  />
                  <line x1={122 + i * 7} y1={160} x2={132 + i * 7} y2={150} stroke="#64748b" strokeWidth="0.6" />
                </g>
              ))}

              {/* 765kV High-Voltage Bushings (Top Porcelain Sheds) */}
              <g transform="translate(300, 40)">
                <polygon points="15,40 25,40 28,10 12,10" fill="url(#bushing-porcelain)" stroke="#451a03" strokeWidth="1" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <ellipse key={`shed1-${i}`} cx="20" cy={14 + i * 4} rx={14 - i * 1.2} ry="3.5" fill="#713f12" stroke="#451a03" strokeWidth="0.8" />
                ))}
                <line x1="20" y1="10" x2="20" y2="-10" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="20" cy="-12" r="3" fill="#f59e0b" />
              </g>

              <g transform="translate(400, 40)">
                <polygon points="15,40 25,40 28,10 12,10" fill="url(#bushing-porcelain)" stroke="#451a03" strokeWidth="1" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <ellipse key={`shed2-${i}`} cx="20" cy={14 + i * 4} rx={14 - i * 1.2} ry="3.5" fill="#713f12" stroke="#451a03" strokeWidth="0.8" />
                ))}
                <line x1="20" y1="10" x2="20" y2="-10" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="20" cy="-12" r="3" fill="#f59e0b" />
              </g>

              <g transform="translate(500, 40)">
                <polygon points="15,40 25,40 28,10 12,10" fill="url(#bushing-porcelain)" stroke="#451a03" strokeWidth="1" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <ellipse key={`shed3-${i}`} cx="20" cy={14 + i * 4} rx={14 - i * 1.2} ry="3.5" fill="#713f12" stroke="#451a03" strokeWidth="0.8" />
                ))}
                <line x1="20" y1="10" x2="20" y2="-10" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="20" cy="-12" r="3" fill="#f59e0b" />
              </g>

              {/* Laminated Grain-Oriented Silicon Steel Core (Three-Limb Core) */}
              <g id="transformer-core" filter={isSaturated ? 'url(#thermal-glow)' : undefined}>
                {/* Bottom Yoke */}
                <rect x="270" y="270" width="280" height="35" fill="url(#core-steel-grad)" stroke={isSaturated ? '#ef4444' : '#475569'} strokeWidth="1.2" />
                {/* Top Yoke */}
                <rect x="270" y="115" width="280" height="35" fill="url(#core-steel-grad)" stroke={isSaturated ? '#ef4444' : '#475569'} strokeWidth="1.2" />
                {/* Left Limb */}
                <rect x="290" y="150" width="40" height="120" fill="url(#core-steel-grad)" stroke={isSaturated ? '#ef4444' : '#475569'} strokeWidth="1.2" />
                {/* Center Limb (Primary Flux Carrier) */}
                <rect x="390" y="150" width="45" height="120" fill="url(#core-steel-grad)" stroke={isSaturated ? '#ef4444' : '#475569'} strokeWidth="1.5" />
                {/* Right Limb */}
                <rect x="490" y="150" width="40" height="120" fill="url(#core-steel-grad)" stroke={isSaturated ? '#ef4444' : '#475569'} strokeWidth="1.2" />
              </g>

              {/* Copper Windings (Low Voltage & High Voltage Cylinders) */}
              <g id="windings">
                {/* Left Winding */}
                <rect x="282" y="165" width="56" height="90" rx="4" fill="url(#copper-winding-grad)" stroke="#78350f" strokeWidth="1.5" opacity="0.9" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`w-l-${i}`} x1="282" y1={170 + i * 11} x2="338" y2={175 + i * 11} stroke="#fef3c7" strokeWidth="0.8" opacity="0.6" />
                ))}

                {/* Center Winding (Saturated Region) */}
                <rect x="382" y="165" width="61" height="90" rx="4" fill="url(#copper-winding-grad)" stroke="#78350f" strokeWidth="1.5" opacity="0.95" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`w-c-${i}`} x1="382" y1={170 + i * 11} x2="443" y2={175 + i * 11} stroke="#fef3c7" strokeWidth="0.8" opacity="0.6" />
                ))}

                {/* Right Winding */}
                <rect x="482" y="165" width="56" height="90" rx="4" fill="url(#copper-winding-grad)" stroke="#78350f" strokeWidth="1.5" opacity="0.9" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`w-r-${i}`} x1="482" y1={170 + i * 11} x2="538" y2={175 + i * 11} stroke="#fef3c7" strokeWidth="0.8" opacity="0.6" />
                ))}
              </g>

              {/* Dynamic Magnetic Flux Lines Circulating in Core */}
              <g stroke={isSaturated ? '#ef4444' : '#0284c7'} strokeWidth={isSaturated ? '2.5' : '1.4'} fill="none" opacity="0.85">
                {/* Left Loop */}
                <path
                  d="M 310 150 L 310 270 L 412 270 L 412 150 Z"
                  strokeDasharray="6 4"
                  strokeDashoffset={-phaseAngle}
                />
                {/* Right Loop */}
                <path
                  d="M 510 150 L 510 270 L 412 270 L 412 150 Z"
                  strokeDasharray="6 4"
                  strokeDashoffset={phaseAngle}
                />
              </g>

              {/* Stray Flux Loops when Saturated (Glowing vibrant red escape paths) */}
              {isSaturated && (
                <g opacity="0.9">
                  <path
                    d="M 370 180 C 330 130, 330 290, 370 250"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.2"
                    strokeDasharray="5 3"
                  />
                  <path
                    d="M 450 180 C 490 130, 490 290, 450 250"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.2"
                    strokeDasharray="5 3"
                  />
                  <rect x="250" y="206" width="320" height="20" rx="4" fill="rgba(254, 242, 242, 0.95)" stroke="#f87171" strokeWidth="1" />
                  <text x="410" y="220" fill="#b91c1c" fontSize="9.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.02em">
                    CORE SATURATION FLUX ESCAPING INTO TANK WALLS
                  </text>
                </g>
              )}
            </svg>

            {/* Bottom CAD Info Callout */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '14px',
              right: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.74rem',
              color: '#475569',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}>
              <div>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>765kV Autotransformer Bank (Perseus / Hydra Specification)</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontFamily: 'monospace' }}>
                <span>Core: <strong style={{ color: '#0284c7' }}>Grain-Oriented M4 Silicon Steel</strong></span>
                <span>Oil: <strong style={{ color: '#d97706' }}>Mineral Inhibited Class I</strong></span>
                <span>Saturation Knee: <strong style={{ color: '#dc2626' }}>1.80 Tesla</strong></span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Diagram 2: Physics Curves & Harmonics */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          padding: '20px'
        }}>
          {/* B-H Curve */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', textAlign: 'center' }}>
              B-H Magnetizing Loop with Quasi-DC Bias
            </div>
            <svg width="220" height="180" viewBox="-110 -90 220 180" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
              <line x1="-95" y1="0" x2="95" y2="0" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="0" y1="-80" x2="0" y2="80" stroke="#cbd5e1" strokeWidth="1" />
              <text x="90" y="12" fill="#64748b" fontSize="8" textAnchor="end">H (A/m)</text>
              <text x="6" y="-72" fill="#64748b" fontSize="8" textAnchor="start">B (Tesla)</text>

              {/* B_sat lines */}
              <line x1="-85" y1="-50" x2="85" y2="-50" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 3" />
              <text x="-85" y="-54" fill="#dc2626" fontSize="7" fontWeight="600">B_sat (+1.8T)</text>

              {/* Hysteresis curve */}
              <path
                d="M -75 48 C -40 45, -25 35, 0 0 C 25 -35, 40 -45, 75 -48"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.2"
              />

              {/* Dynamic Operating Point */}
              {(() => {
                const ptX = (Math.sin(rad) * 45) + (dcBiasOffset * 40);
                const clampedY = Math.max(-65, Math.min(65, -totalFlux * 28));
                return (
                  <circle
                    cx={ptX}
                    cy={clampedY}
                    r={isSaturated ? 5.5 : 4}
                    fill={isSaturated ? '#dc2626' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth="1.8"
                  />
                );
              })()}
            </svg>
            <div style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'center', marginTop: '8px', fontFamily: 'monospace' }}>
              Operating Point: <strong style={{ color: isSaturated ? '#dc2626' : '#0284c7' }}>{totalFlux.toFixed(2)} Tesla</strong>
            </div>
          </div>

          {/* Harmonic Spectrum Breakdown */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              Harmonic Distortion Spectrum (Half-Cycle Asymmetry)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {harmonics.map((h, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#475569', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>{h.harmonic}</span>
                    <span style={{ fontFamily: 'monospace', color: i === 0 ? '#0284c7' : '#dc2626', fontWeight: 700 }}>{h.amp} A</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${h.pct}%`,
                      height: '100%',
                      backgroundColor: i === 0 ? '#0284c7' : '#dc2626',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
