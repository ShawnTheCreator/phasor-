import React from 'react';

export interface HazardScores {
  grid: number;         // 0 - 100
  aviation: number;     // 0 - 100
  gnss: number;         // 0 - 100
  satellites: number;   // 0 - 100
  health: number;       // 0 - 100
  publicSafety: number; // 0 - 100
}

interface MultiHazardRadarDiagramProps {
  scores?: Partial<HazardScores>;
}

export default function MultiHazardRadarDiagram({
  scores = {}
}: MultiHazardRadarDiagramProps): JSX.Element {
  const currentScores: HazardScores = {
    grid: scores.grid ?? 85,
    aviation: scores.aviation ?? 78,
    gnss: scores.gnss ?? 64,
    satellites: scores.satellites ?? 90,
    health: scores.health ?? 45,
    publicSafety: scores.publicSafety ?? 52
  };

  const axes = [
    { key: 'grid', label: '1. Power Grid GIC', score: currentScores.grid, unit: '85% (Critical Q_loss)' },
    { key: 'aviation', label: '2. Aviation HF/Rad', score: currentScores.aviation, unit: '78% (FL390 Advisory)' },
    { key: 'gnss', label: '3. GNSS RTK Scint.', score: currentScores.gnss, unit: '64% (S4 = 0.62)' },
    { key: 'satellites', label: '4. LEO Sat Drag', score: currentScores.satellites, unit: '90% (4.2x Density)' },
    { key: 'health', label: '5. Hospital Power', score: currentScores.health, unit: '45% (UPS Staged)' },
    { key: 'publicSafety', label: '6. Public Safety', score: currentScores.publicSafety, unit: '52% (VHF Degraded)' }
  ];

  const size = 260;
  const center = size / 2;
  const radius = 95;
  const numAxes = axes.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate radar polygon points
  const polygonPoints = axes.map((axis, i) => {
    const { x, y } = getCoordinates(i, axis.score);
    return `${x},${y}`;
  }).join(' ');

  // Critical threshold polygon points (at 70%)
  const warningPoints = axes.map((_, i) => {
    const { x, y } = getCoordinates(i, 70);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            Multi-Hazard Cross-Sector Threat Radar
          </strong>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 700, padding: '2px 6px', backgroundColor: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
          G5 SUPERSTORM PROFILE
        </span>
      </div>

      {/* Content: Radar Visual + Axis Cards */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        gap: '16px'
      }}>
        {/* SVG Radar Spider Chart */}
        <div style={{ flex: '0 0 auto' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="radar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#991b1b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Concentric Guide Polygons (20%, 40%, 60%, 80%, 100%) */}
            {[20, 40, 60, 80, 100].map((lvl, idx) => {
              const pts = axes.map((_, i) => {
                const { x, y } = getCoordinates(i, lvl);
                return `${x},${y}`;
              }).join(' ');
              return (
                <polygon
                  key={idx}
                  points={pts}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={lvl === 100 ? undefined : '2 2'}
                />
              );
            })}

            {/* Critical 70% Alert Perimeter Line */}
            <polygon
              points={warningPoints}
              fill="none"
              stroke="#fca5a5"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Radial Axis Spokes */}
            {axes.map((_, i) => {
              const { x, y } = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Threat Area Polygon */}
            <polygon
              points={polygonPoints}
              fill="url(#radar-grad)"
              stroke="#991b1b"
              strokeWidth="2.5"
            />

            {/* Axis Data Points & Markers */}
            {axes.map((axis, i) => {
              const { x, y } = getCoordinates(i, axis.score);
              const isHigh = axis.score >= 70;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHigh ? 4.5 : 3.5}
                    fill={isHigh ? '#991b1b' : '#d97706'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Breakdown List */}
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {axes.map((axis, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: axis.score >= 70 ? '#fef2f2' : '#f8fafc',
                border: `1px solid ${axis.score >= 70 ? '#fecaca' : '#eaecf0'}`
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#0f172a' }}>
                  {axis.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: axis.score >= 70 ? '#991b1b' : '#64748b' }}>
                  {axis.unit}
                </div>
              </div>

              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: axis.score >= 70 ? '#991b1b' : '#0f172a'
              }}>
                {axis.score}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
