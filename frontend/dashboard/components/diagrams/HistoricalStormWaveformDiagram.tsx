import React from 'react';

interface HistoricalStormWaveformDiagramProps {
  minuteIndex: number;
  stormId: string;
  onScrub?: (minute: number) => void;
}

export default function HistoricalStormWaveformDiagram({
  minuteIndex,
  stormId = 'may_2024_g5',
  onScrub
}: HistoricalStormWaveformDiagramProps): JSX.Element {
  // Generate 24-hour storm data profile (every 30 mins -> 48 points)
  const totalMinutes = 1440;
  const numPoints = 48;
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const min = (i / numPoints) * totalMinutes;
    // Storm shock peaks between minute 720 and 840 (12:00 to 14:00)
    const distFromPeak = Math.abs(min - 780);
    const shockFactor = Math.exp(-Math.pow(distFromPeak / 180, 2));

    const peakDst = stormId === 'march_1989_quebec' ? -589 : stormId === 'oct_2003_halloween' ? -383 : -412;
    const dst = -25 + (peakDst + 25) * shockFactor;
    const kp = 2.0 + 7.0 * shockFactor;
    const hermanusDeltaH = -15 + (-380) * shockFactor;

    points.push({ min, dst, kp, hermanusDeltaH });
  }

  const svgWidth = 680;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 30;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const minDst = -600;
  const maxDst = 20;

  const getX = (m: number) => paddingLeft + (m / totalMinutes) * plotWidth;
  const getYDst = (dst: number) => paddingTop + plotHeight - ((dst - minDst) / (maxDst - minDst)) * plotHeight;

  // Generate Dst curve path
  const dstPath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(pt.min)} ${getYDst(pt.dst)}`, '');
  const dstAreaPath = `${dstPath} L ${getX(totalMinutes)} ${getYDst(0)} L ${getX(0)} ${getYDst(0)} Z`;

  // Compute current scrubbed telemetry
  const currentDistFromPeak = Math.abs(minuteIndex - 780);
  const currentShock = Math.exp(-Math.pow(currentDistFromPeak / 180, 2));
  const currentDst = Math.round(-25 + (-412 + 25) * currentShock);
  const currentKp = Number((2.0 + 7.0 * currentShock).toFixed(1));
  const currentEField = Number((0.04 + 0.32 * currentShock).toFixed(3));

  const scrubHour = Math.floor(minuteIndex / 60);
  const scrubMin = minuteIndex % 60;
  const timeFormatted = `${String(scrubHour).padStart(2, '0')}:${String(scrubMin).padStart(2, '0')} UTC`;

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
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            24-Hour Storm Shock Waveform & Ring Current Disturbance (Dst)
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Time: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{timeFormatted}</strong></span>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: currentKp >= 8 ? '#fef2f2' : '#f0fdf4',
            color: currentKp >= 8 ? '#991b1b' : '#15803d',
            fontWeight: 700,
            border: `1px solid ${currentKp >= 8 ? '#fecaca' : '#bbf7d0'}`
          }}>
            Kp {currentKp} {currentKp >= 8 ? '&bull; G5 EXTREME' : '&bull; UNSETTLED'}
          </span>
        </div>
      </div>

      {/* SVG Waveform Chart */}
      <div style={{ padding: '12px 16px', position: 'relative' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Zero baseline */}
          <line
            x1={paddingLeft}
            y1={getYDst(0)}
            x2={paddingLeft + plotWidth}
            y2={getYDst(0)}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <text x={paddingLeft - 6} y={getYDst(0) + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
            0 nT
          </text>

          {/* G5 Threshold Line at -400 nT */}
          <line
            x1={paddingLeft}
            y1={getYDst(-400)}
            x2={paddingLeft + plotWidth}
            y2={getYDst(-400)}
            stroke="#fca5a5"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x={paddingLeft - 6} y={getYDst(-400) + 3} fill="#991b1b" fontSize="8" textAnchor="end" fontFamily="monospace">
            -400 nT
          </text>
          <text x={paddingLeft + plotWidth - 4} y={getYDst(-400) - 4} fill="#991b1b" fontSize="7.5" textAnchor="end">
            G5 Superstorm Ring Current Threshold (-400 nT)
          </text>

          {/* X Axis Hours */}
          {[0, 4, 8, 12, 16, 20, 24].map((hr, idx) => {
            const x = paddingLeft + (idx / 6) * plotWidth;
            return (
              <g key={idx}>
                <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + plotHeight} stroke="#f1f5f9" strokeWidth="1" />
                <text x={x} y={paddingTop + plotHeight + 16} fill="#64748b" fontSize="8" textAnchor="middle">
                  {String(hr).padStart(2, '0')}:00
                </text>
              </g>
            );
          })}

          {/* Dst Danger Area Fill */}
          <path d={dstAreaPath} fill="rgba(153, 27, 27, 0.05)" />

          {/* Dst Line */}
          <path d={dstPath} fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />

          {/* Playhead Scrub Line */}
          {(() => {
            const scrubX = getX(minuteIndex);
            return (
              <g>
                <line
                  x1={scrubX}
                  y1={paddingTop}
                  x2={scrubX}
                  y2={paddingTop + plotHeight}
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <circle
                  cx={scrubX}
                  cy={getYDst(currentDst)}
                  r="5"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Scrubbed Live Metrics Footer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #eaecf0',
        fontSize: '0.74rem'
      }}>
        <div>
          <span style={{ color: '#64748b' }}>Disturbance Storm Time:</span>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: currentDst < -200 ? '#991b1b' : '#0f172a', fontSize: '0.95rem' }}>
            {currentDst} nT
          </div>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Planetary Kp Index:</span>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: currentKp >= 8 ? '#991b1b' : '#0f172a', fontSize: '0.95rem' }}>
            {currentKp}
          </div>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>SANSA Hermanus &Delta;H:</span>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
            {Math.round(-15 + (-380) * currentShock)} nT
          </div>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Kaapvaal Induced |E|:</span>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: currentEField > 0.1 ? '#d97706' : '#0f172a', fontSize: '0.95rem' }}>
            {currentEField} V/km
          </div>
        </div>
      </div>
    </div>
  );
}
