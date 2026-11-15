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

  // 60Hz simulated cycle animation
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseAngle(prev => (prev + 12) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Compute flux with DC offset
  const rad = (phaseAngle * Math.PI) / 180;
  const dcBiasOffset = Math.min(1.2, (gicAmps / 25) * 0.9); // Tesla offset
  const acFlux = Math.sin(rad) * 1.5; // AC swing +/- 1.5 T
  const totalFlux = acFlux + dcBiasOffset;

  // Saturated magnetizing current spike (non-linear when totalFlux > 1.8 T)
  const isSaturated = totalFlux > 1.7;
  const magnetizingCurrentSpike = isSaturated
    ? Math.pow(Math.max(0, totalFlux - 1.7) * 4, 3) * 12 + 1.2
    : 1.2;

  // Harmonics breakdown based on GIC DC bias
  const harmonics = [
    { harmonic: 'Fund (50 Hz)', pct: 100, amp: (voltageKv * 1.2).toFixed(0) },
    { harmonic: '2nd (100 Hz)', pct: Math.min(65, (gicAmps / 25) * 48), amp: ((gicAmps / 25) * 38).toFixed(1) },
    { harmonic: '3rd (150 Hz)', pct: Math.min(45, (gicAmps / 25) * 32), amp: ((gicAmps / 25) * 26).toFixed(1) },
    { harmonic: '4th (200 Hz)', pct: Math.min(30, (gicAmps / 25) * 22), amp: ((gicAmps / 25) * 18).toFixed(1) },
    { harmonic: '5th (250 Hz)', pct: Math.min(25, (gicAmps / 25) * 16), amp: ((gicAmps / 25) * 12).toFixed(1) },
  ];

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginTop: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            Transformer Half-Cycle Core Saturation & Phasor Deficit
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (Physics B-H Hysteresis Model)
          </span>
        </div>

        <div style={{
          fontSize: '0.7rem',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: isSaturated ? '#fef2f2' : '#f0fdf4',
          color: isSaturated ? '#991b1b' : '#15803d',
          fontWeight: 700,
          border: `1px solid ${isSaturated ? '#fecaca' : '#bbf7d0'}`
        }}>
          {isSaturated ? '⚡ HALF-CYCLE SATURATION ACTIVE' : 'NOMINAL LINEAR REGION'}
        </div>
      </div>

      {/* 3-Column Visual Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        padding: '16px'
      }}>
        {/* Diagram 1: B-H Magnetic Saturation Loop */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
            B-H Hysteresis Curve with Quasi-DC Bias
          </div>

          <svg width="200" height="170" viewBox="-100 -85 200 170" style={{ overflow: 'visible' }}>
            {/* Axes */}
            <line x1="-90" y1="0" x2="90" y2="0" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="0" y1="-75" x2="0" y2="75" stroke="#cbd5e1" strokeWidth="1" />
            <text x="85" y="12" fill="#64748b" fontSize="8" textAnchor="end">H (A/m)</text>
            <text x="6" y="-70" fill="#64748b" fontSize="8" textAnchor="start">B (Tesla)</text>

            {/* Saturation Knees (Horizontal lines at +/- 1.8 T) */}
            <line x1="-80" y1="-50" x2="80" y2="-50" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3 3" />
            <text x="-80" y="-53" fill="#ef4444" fontSize="7">B_sat (+1.8T)</text>
            <line x1="-80" y1="50" x2="80" y2="50" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />

            {/* S-shaped B-H Curve */}
            <path
              d="M -75 48 C -40 45, -25 35, 0 0 C 25 -35, 40 -45, 75 -48"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.8"
            />

            {/* DC Offset operating point line */}
            <line
              x1={dcBiasOffset * 40}
              y1="-60"
              x2={dcBiasOffset * 40}
              y2="60"
              stroke="#991b1b"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <text x={dcBiasOffset * 40 + 3} y="40" fill="#991b1b" fontSize="7" fontWeight="bold">
              DC Flux Bias ({dcBiasOffset.toFixed(2)}T)
            </text>

            {/* Dynamic Real-Time Operating Point */}
            {(() => {
              const ptX = (Math.sin(rad) * 45) + (dcBiasOffset * 40);
              const clampedY = Math.max(-65, Math.min(65, -totalFlux * 28));
              return (
                <g>
                  <circle
                    cx={ptX}
                    cy={clampedY}
                    r={isSaturated ? 4.5 : 3.5}
                    fill={isSaturated ? '#991b1b' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })()}
          </svg>

          <div style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
            Instantaneous Core Flux: <strong style={{ color: isSaturated ? '#991b1b' : '#0f172a', fontFamily: 'monospace' }}>{totalFlux.toFixed(2)} T</strong>
          </div>
        </div>

        {/* Diagram 2: Voltage & Reactive Power Phasor Circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
            Phasor Diagram & Q_loss Reactive Vector
          </div>

          <svg width="200" height="170" viewBox="-100 -85 200 170" style={{ overflow: 'visible' }}>
            {/* Circular Perimeter */}
            <circle cx="0" cy="0" r="65" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="0" cy="0" r="45" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="-75" y1="0" x2="75" y2="0" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="0" y1="-75" x2="0" y2="75" stroke="#cbd5e1" strokeWidth="0.8" />

            {/* Reference Voltage Phasor V (Horizontal Blue Arrow) */}
            <line x1="0" y1="0" x2="60" y2="0" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="65,0 58,-3 58,3" fill="#0284c7" />
            <text x="68" y="3" fill="#0284c7" fontSize="8" fontWeight="bold">V</text>

            {/* Active Power Current Phasor I_p (Lagging) */}
            <line x1="0" y1="0" x2="40" y2="15" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <text x="44" y="20" fill="#10b981" fontSize="8">I_active</text>

            {/* Magnetizing Spike Vector / Q_loss Deficit (Lagging 90 deg, pointing down) */}
            {(() => {
              const qLen = Math.min(65, (qLossMvar / 12) * 55);
              return (
                <g>
                  <line x1="0" y1="0" x2="0" y2={qLen} stroke="#991b1b" strokeWidth="3" strokeLinecap="round" />
                  <polygon points={`0,${qLen + 5} -3,${qLen - 1} 3,${qLen - 1}`} fill="#991b1b" />
                  <text x="6" y={qLen} fill="#991b1b" fontSize="8" fontWeight="bold">
                    Q_loss ({qLossMvar} MVAR)
                  </text>
                </g>
              );
            })()}

            {/* Center Origin Dot */}
            <circle cx="0" cy="0" r="2.5" fill="#0f172a" />
          </svg>

          <div style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
            Power Factor Depression: <strong style={{ fontFamily: 'monospace' }}>cos &phi; = 0.82</strong>
          </div>
        </div>

        {/* Diagram 3: Harmonic Distortion Breakdown (Bar Meter) */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #eaecf0', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Even & Odd Harmonic Current Injection
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '10px' }}>
              Half-cycle saturation generates even harmonics (2nd, 4th), tripping differential relays.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {harmonics.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
                  <span style={{ width: '70px', color: '#475569', flexShrink: 0 }}>{h.harmonic}</span>
                  <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${h.pct}%`,
                      height: '100%',
                      backgroundColor: i === 0 ? '#0284c7' : i === 1 ? '#991b1b' : '#d97706',
                      borderRadius: '3px'
                    }} />
                  </div>
                  <span style={{ width: '38px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#0f172a' }}>
                    {h.amp}A
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: '0.66rem',
            color: '#991b1b',
            backgroundColor: '#fef2f2',
            padding: '6px 8px',
            borderRadius: '4px',
            border: '1px solid #fecaca',
            marginTop: '8px'
          }}>
            &#9888; <strong>2nd Harmonic Level:</strong> {(gicAmps * 1.4).toFixed(1)}% (Restraint filter active).
          </div>
        </div>
      </div>
    </div>
  );
}
