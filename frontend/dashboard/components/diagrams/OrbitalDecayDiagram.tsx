import React, { useState } from 'react';

interface SatelliteDecay {
  name: string;
  norad: number;
  initialAltKm: number;
  color: string;
  dailyLossM: number[]; // 7 days of daily drops in meters
}

interface OrbitalDecayDiagramProps {
  densityFactor?: number;
}

export default function OrbitalDecayDiagram({
  densityFactor = 4.2
}: OrbitalDecayDiagramProps): JSX.Element {
  const [selectedSat, setSelectedSat] = useState<string>('ZACube-2');

  const satellites: SatelliteDecay[] = [
    {
      name: 'ZACube-2',
      norad: 43907,
      initialAltKm: 490,
      color: '#991b1b',
      dailyLossM: [45, 52, 60, 68, 62, 58, 67] // Total ~412m
    },
    {
      name: 'ISS (Expedition 71)',
      norad: 25544,
      initialAltKm: 418,
      color: '#d97706',
      dailyLossM: [85, 92, 105, 112, 98, 94, 94] // Total ~680m (High drag cross-section)
    },
    {
      name: 'EOSAT-1',
      norad: 98412,
      initialAltKm: 520,
      color: '#0284c7',
      dailyLossM: [28, 32, 36, 40, 38, 36, 38] // Total ~248m
    },
    {
      name: 'Starlink-3129',
      norad: 51920,
      initialAltKm: 540,
      color: '#10b981',
      dailyLossM: [22, 25, 29, 32, 31, 29, 30] // Total ~198m
    }
  ];

  const svgWidth = 580;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const days = ['Day 0', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  // Calculate cumulative loss for each satellite across 7 days
  const cumulativeData = satellites.map(sat => {
    let running = 0;
    const points = [0];
    for (const loss of sat.dailyLossM) {
      running += loss;
      points.push(running);
    }
    return { ...sat, points };
  });

  const maxLoss = 750; // meters

  const getX = (dayIdx: number) => paddingLeft + (dayIdx / 7) * plotWidth;
  const getY = (lossM: number) => paddingTop + (lossM / maxLoss) * plotHeight;

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
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            7-Day Projected LEO Orbital Decay & Altitude Loss
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (NRLMSISE-00 Atmospheric Expansion: {densityFactor}x)
          </span>
        </div>

        {/* Satellite filter pill buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {satellites.map(sat => (
            <button
              key={sat.name}
              onClick={() => setSelectedSat(sat.name)}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: selectedSat === sat.name ? sat.color : '#cbd5e1',
                backgroundColor: selectedSat === sat.name ? sat.color : '#ffffff',
                color: selectedSat === sat.name ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {sat.name}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Multi-Line Chart */}
      <div style={{ padding: '12px 16px' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Horizontal grid lines */}
          {[0, 200, 400, 600].map((loss, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={getY(loss)}
                x2={paddingLeft + plotWidth}
                y2={getY(loss)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text x={paddingLeft - 6} y={getY(loss) + 3} fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">
                -{loss}m
              </text>
            </g>
          ))}

          {/* Critical Orbit-Raise threshold at 350m */}
          <line
            x1={paddingLeft}
            y1={getY(350)}
            x2={paddingLeft + plotWidth}
            y2={getY(350)}
            stroke="#fca5a5"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x={paddingLeft + plotWidth - 4} y={getY(350) - 4} fill="#991b1b" fontSize="7.5" textAnchor="end">
            Threshold: Re-boost Thruster Burn Advised (&gt;350m drop)
          </text>

          {/* Day X-Axis Labels */}
          {days.map((day, idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={paddingTop + plotHeight + 16}
              fill="#64748b"
              fontSize="8"
              textAnchor="middle"
            >
              {day}
            </text>
          ))}

          {/* Render Decay Trajectory Curves */}
          {cumulativeData.map(sat => {
            const isSelected = selectedSat === sat.name;
            const pathD = sat.points.reduce((acc, loss, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(loss)}`, '');

            return (
              <g key={sat.name} opacity={selectedSat === sat.name ? 1 : 0.45}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={sat.color}
                  strokeWidth={isSelected ? 3 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Point Dots */}
                {sat.points.map((loss, i) => (
                  <circle
                    key={i}
                    cx={getX(i)}
                    cy={getY(loss)}
                    r={isSelected ? 3.5 : 2.5}
                    fill={sat.color}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                ))}

                {/* Final End-Label */}
                <text
                  x={getX(7) + 5}
                  y={getY(sat.points[7]) + 3}
                  fill={sat.color}
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  -{sat.points[7]}m
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Info Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #eaecf0',
        fontSize: '0.72rem',
        color: '#64748b'
      }}>
        <span>&bull; Thermospheric heating swells upper neutral density, tripling aerodynamic drag at 400-500 km altitudes.</span>
        <span style={{ color: '#991b1b', fontWeight: 600 }}>2 Satellites require orbit-raise maneuver</span>
      </div>
    </div>
  );
}
