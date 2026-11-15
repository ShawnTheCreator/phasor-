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
      backgroundColor: '#0a0f1d',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      overflow: 'hidden',
      marginTop: '16px',
      color: '#f8fafc'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isSaturated ? '#ef4444' : '#22c55e',
            boxShadow: isSaturated ? '0 0 10px #ef4444' : '0 0 8px #22c55e'
          }} />
          <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
            765 kV SINGLE-PHASE TRANSFORMER CORE SATURATION & PHASOR DEFICIT
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            (Non-Linear Faraday & B-H Magnetizing Dynamics)
          </span>
        </div>

        {/* Tab & Saturation Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: '0.7rem',
            padding: '3px 9px',
            borderRadius: '4px',
            backgroundColor: isSaturated ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isSaturated ? '#f87171' : '#34d399',
            fontWeight: 800,
            border: `1px solid ${isSaturated ? '#ef4444' : '#10b981'}`
          }}>
            {isSaturated ? '⚡ HALF-CYCLE SATURATION DETECTED' : 'NOMINAL LINEAR CORE FLUX'}
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '2px', borderRadius: '6px' }}>
            <button
              onClick={() => setActiveTab('3d-cad')}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTab === '3d-cad' ? '#0284c7' : 'transparent',
                color: activeTab === '3d-cad' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              3D CAD Cutaway
            </button>
            <button
              onClick={() => setActiveTab('physics-curves')}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTab === 'physics-curves' ? '#0284c7' : 'transparent',
                color: activeTab === 'physics-curves' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer'
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
            backgroundColor: '#0f172a',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
              <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>Quasi-DC GIC Injection:</span>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={interactiveGic}
                onChange={e => setInteractiveGic(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#ef4444', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: interactiveGic > 20 ? '#ef4444' : '#38bdf8', fontSize: '0.9rem', minWidth: '45px' }}>
                {interactiveGic} A
              </span>
            </div>

            <div style={{ display: 'flex', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b', textTransform: 'uppercase' }}>Core Flux B</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isSaturated ? '#ef4444' : '#f8fafc', fontFamily: 'monospace' }}>
                  {totalFlux.toFixed(2)} T {isSaturated ? '(Saturated)' : ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b', textTransform: 'uppercase' }}>Hotspot ΔT</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: coreTemperatureRiseC > 35 ? '#ef4444' : '#f59e0b', fontFamily: 'monospace' }}>
                  +{coreTemperatureRiseC} °C
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.64rem', color: '#64748b', textTransform: 'uppercase' }}>Q_loss Deficit</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                  {((interactiveGic / 25) * qLossMvar).toFixed(1)} MVAR
                </div>
              </div>
            </div>
          </div>

          {/* Hyper-Realistic 3D Isometric CAD Cutaway of 765kV Transformer Core */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '380px',
            backgroundColor: '#070b14',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            overflow: 'hidden'
          }}>
            <svg viewBox="0 0 800 380" style={{ width: '100%', height: '100%' }}>
              <defs>
                {/* Metallic Shaders & Gradients */}
                <linearGradient id="core-steel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isSaturated ? '#7f1d1d' : '#334155'} />
                  <stop offset="50%" stopColor={isSaturated ? '#dc2626' : '#64748b'} />
                  <stop offset="100%" stopColor={isSaturated ? '#991b1b' : '#1e293b'} />
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
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Floor Isometric Markings */}
              <g opacity="0.15" stroke="#38bdf8" strokeWidth="0.8">
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
                fill="#0f172a"
                fillOpacity="0.8"
                stroke="#334155"
                strokeWidth="1.5"
              />
              <polygon
                points="180,330 180,180 240,140 240,240"
                fill="#1e293b"
                fillOpacity="0.4"
                stroke="#334155"
                strokeWidth="1.2"
              />

              {/* Transformer Core Base Yoke (Silicon Steel Laminated Beam) */}
              <polygon
                points="240,310 560,310 600,270 280,270"
                fill="url(#core-steel-grad)"
                stroke="#475569"
                strokeWidth="1.5"
                filter={isSaturated ? 'url(#thermal-glow)' : undefined}
              />

              {/* 3 Silicon Steel Limbs (Phase A, Phase B, Phase C) */}
              {/* Limb A (Left) */}
              <polygon
                points="280,270 340,270 340,150 280,150"
                fill="url(#core-steel-grad)"
                stroke="#475569"
                strokeWidth="1.5"
                filter={isSaturated ? 'url(#thermal-glow)' : undefined}
              />
              {/* Limb B (Center - Highest Saturation) */}
              <polygon
                points="380,270 440,270 440,150 380,150"
                fill="url(#core-steel-grad)"
                stroke="#475569"
                strokeWidth="1.5"
                filter={isSaturated ? 'url(#thermal-glow)' : undefined}
              />
              {/* Limb C (Right) */}
              <polygon
                points="480,270 540,270 540,150 480,150"
                fill="url(#core-steel-grad)"
                stroke="#475569"
                strokeWidth="1.5"
                filter={isSaturated ? 'url(#thermal-glow)' : undefined}
              />

              {/* Top Yoke Steel Beam */}
              <polygon
                points="240,150 560,150 600,120 280,120"
                fill="url(#core-steel-grad)"
                stroke="#475569"
                strokeWidth="1.5"
                filter={isSaturated ? 'url(#thermal-glow)' : undefined}
              />

              {/* Copper Windings (Cylindrical coils wound around core limbs) */}
              {/* Winding Phase A */}
              <rect x="270" y="170" width="80" height="85" rx="10" fill="url(#copper-winding-grad)" stroke="#92400e" strokeWidth="1.5" />
              {/* Winding Phase B (Center) */}
              <rect x="370" y="170" width="80" height="85" rx="10" fill="url(#copper-winding-grad)" stroke="#92400e" strokeWidth="1.5" />
              {/* Winding Phase C */}
              <rect x="470" y="170" width="80" height="85" rx="10" fill="url(#copper-winding-grad)" stroke="#92400e" strokeWidth="1.5" />

              {/* Porcelain Bushings on Tank Top */}
              {/* Bushing A */}
              <g transform="translate(310, 50)">
                <polygon points="0,70 16,70 12,0 4,0" fill="url(#bushing-porcelain)" stroke="#78350f" strokeWidth="1.2" />
                {/* Bushing Sheds */}
                <ellipse cx="8" cy="18" rx="14" ry="4" fill="#854d0e" stroke="#713f12" />
                <ellipse cx="8" cy="34" rx="16" ry="4.5" fill="#854d0e" stroke="#713f12" />
                <ellipse cx="8" cy="50" rx="18" ry="5" fill="#854d0e" stroke="#713f12" />
                {/* Corona Ring */}
                <circle cx="8" cy="-2" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                <text x="8" y="-14" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">Phase A</text>
              </g>

              {/* Bushing B (Center) */}
              <g transform="translate(410, 50)">
                <polygon points="0,70 16,70 12,0 4,0" fill="url(#bushing-porcelain)" stroke="#78350f" strokeWidth="1.2" />
                <ellipse cx="8" cy="18" rx="14" ry="4" fill="#854d0e" stroke="#713f12" />
                <ellipse cx="8" cy="34" rx="16" ry="4.5" fill="#854d0e" stroke="#713f12" />
                <ellipse cx="8" cy="50" rx="18" ry="5" fill="#854d0e" stroke="#713f12" />
                <circle cx="8" cy="-2" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                <text x="8" y="-14" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">Phase B</text>
              </g>

              {/* Bushing C */}
              <g transform="translate(510, 50)">
                <polygon points="0,70 16,70 12,0 4,0" fill="url(#bushing-porcelain)" stroke="#78350f" strokeWidth="1.2" />
                <ellipse cx="8" cy="18" rx="14" ry="4" fill="#854d0e" stroke="#713f12" />
                <ellipse cx="8" cy="34" rx="16" ry="4.5" fill="#854d0e" stroke="#713f12" />
                <ellipse cx="8" cy="50" rx="18" ry="5" fill="#854d0e" stroke="#713f12" />
                <circle cx="8" cy="-2" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                <text x="8" y="-14" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">Phase C</text>
              </g>

              {/* Neutral Grounding Terminal & Quasi-DC GIC Flow Arrow */}
              <g transform="translate(610, 260)">
                <line x1="0" y1="0" x2="30" y2="40" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                <polygon points="35,46 25,40 33,32" fill="#ef4444" />
                <text x="42" y="46" fill="#ef4444" fontSize="9" fontWeight="bold">GIC Neutral ({interactiveGic}A DC)</text>
                <text x="42" y="58" fill="#94a3b8" fontSize="7.5">Earth Mat Rg: 0.08 Ω</text>
              </g>

              {/* Stray Flux Loops when Saturated */}
              {isSaturated && (
                <g opacity="0.8">
                  <path
                    d="M 370 180 C 330 130, 330 290, 370 250"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                  />
                  <path
                    d="M 450 180 C 490 130, 490 290, 450 250"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                  />
                  <text x="410" y="220" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle">
                    ⚠ CORE SATURATION FLUX ESCAPING INTO TANK
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
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #1e293b',
              fontSize: '0.72rem',
              color: '#94a3b8'
            }}>
              <div>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>765kV Autotransformer Bank (Perseus / Hydra Specification)</span>
              </div>
              <div style={{ display: 'flex', gap: '14px', fontFamily: 'monospace' }}>
                <span>Core: <strong style={{ color: '#38bdf8' }}>Grain-Oriented M4 Silicon Steel</strong></span>
                <span>Oil: <strong style={{ color: '#f59e0b' }}>Mineral Inhibited Class I</strong></span>
                <span>Saturation Knee: <strong style={{ color: '#ef4444' }}>1.80 Tesla</strong></span>
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
          <div style={{ backgroundColor: '#070b14', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', textAlign: 'center' }}>
              B-H Magnetizing Loop with Quasi-DC Bias
            </div>
            <svg width="220" height="180" viewBox="-110 -90 220 180" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
              <line x1="-95" y1="0" x2="95" y2="0" stroke="#334155" strokeWidth="1" />
              <line x1="0" y1="-80" x2="0" y2="80" stroke="#334155" strokeWidth="1" />
              <text x="90" y="12" fill="#64748b" fontSize="8" textAnchor="end">H (A/m)</text>
              <text x="6" y="-72" fill="#64748b" fontSize="8" textAnchor="start">B (Tesla)</text>

              {/* B_sat lines */}
              <line x1="-85" y1="-50" x2="85" y2="-50" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
              <text x="-85" y="-54" fill="#f87171" fontSize="7">B_sat (+1.8T)</text>

              {/* Hysteresis curve */}
              <path
                d="M -75 48 C -40 45, -25 35, 0 0 C 25 -35, 40 -45, 75 -48"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* Dynamic Operating Point */}
              {(() => {
                const ptX = (Math.sin(rad) * 45) + (dcBiasOffset * 40);
                const clampedY = Math.max(-65, Math.min(65, -totalFlux * 28));
                return (
                  <circle
                    cx={ptX}
                    cy={clampedY}
                    r={isSaturated ? 5 : 3.5}
                    fill={isSaturated ? '#ef4444' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })()}
            </svg>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: '6px', fontFamily: 'monospace' }}>
              Operating Point: <strong style={{ color: isSaturated ? '#ef4444' : '#38bdf8' }}>{totalFlux.toFixed(2)} Tesla</strong>
            </div>
          </div>

          {/* Harmonic Spectrum Breakdown */}
          <div style={{ backgroundColor: '#070b14', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Harmonic Distortion Spectrum (Half-Cycle Asymmetry)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {harmonics.map((h, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '3px' }}>
                    <span>{h.harmonic}</span>
                    <span style={{ fontFamily: 'monospace', color: i === 0 ? '#38bdf8' : '#ef4444' }}>{h.amp} A</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${h.pct}%`,
                      height: '100%',
                      backgroundColor: i === 0 ? '#0284c7' : '#ef4444',
                      borderRadius: '3px'
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
