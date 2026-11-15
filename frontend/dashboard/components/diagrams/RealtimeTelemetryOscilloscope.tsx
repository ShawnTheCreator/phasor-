import React, { useState, useEffect } from 'react';

export interface TelemetryPoint {
  time: string;
  bz: number;        // IMF Bz (nT)
  speed: number;     // Solar wind speed (km/s)
  eField: number;    // Induced electric field (V/km)
  gicAmps: number;   // Max neutral GIC (A)
}

interface OscilloscopeProps {
  currentBz?: number;
  currentSpeed?: number;
  currentEField?: number;
  currentGic?: number;
}

export default function RealtimeTelemetryOscilloscope({
  currentBz = -18.4,
  currentSpeed = 745,
  currentEField = 0.14,
  currentGic = 26.8
}: OscilloscopeProps): JSX.Element {
  const [data, setData] = useState<TelemetryPoint[]>(() => {
    // Generate initial 25-point historical baseline
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const t = new Date(now - i * 2000);
      const timeStr = t.toTimeString().split(' ')[0];
      const variance = (Math.sin(i * 0.4) + Math.cos(i * 0.7)) * 0.5;
      points.push({
        time: timeStr,
        bz: -16.5 + variance * 4.2,
        speed: 730 + variance * 30,
        eField: 0.11 + Math.abs(variance) * 0.05,
        gicAmps: 22.0 + variance * 6.5
      });
    }
    return points;
  });

  const [activeChannel, setActiveChannel] = useState<'all' | 'bz' | 'efield' | 'gic'>('all');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Live real-time tick to update waveform
  useEffect(() => {
    const timer = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        
        // Realistic small jitter around incoming prop values
        const jitter = (Math.random() - 0.48) * 1.5;
        const newPoint: TelemetryPoint = {
          time: timeStr,
          bz: Number((currentBz + jitter * 0.8).toFixed(1)),
          speed: Math.round(currentSpeed + jitter * 5),
          eField: Number(Math.max(0.01, currentEField + jitter * 0.01).toFixed(3)),
          gicAmps: Number(Math.max(0, currentGic + jitter * 1.2).toFixed(1))
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [currentBz, currentSpeed, currentEField, currentGic]);

  // Dimensions for SVG canvas
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Normalized coordinate helpers
  const getX = (idx: number) => paddingLeft + (idx / (data.length - 1)) * plotWidth;

  // Scale Bz: range [-30, +10]
  const getYBz = (val: number) => {
    const min = -30;
    const max = 10;
    const clamped = Math.max(min, Math.min(max, val));
    return paddingTop + plotHeight - ((clamped - min) / (max - min)) * plotHeight;
  };

  // Scale EField: range [0, 0.4] V/km
  const getYEField = (val: number) => {
    const min = 0;
    const max = 0.35;
    const clamped = Math.max(min, Math.min(max, val));
    return paddingTop + plotHeight - ((clamped - min) / (max - min)) * plotHeight;
  };

  // Scale GIC: range [0, 45] A
  const getYGic = (val: number) => {
    const min = 0;
    const max = 45;
    const clamped = Math.max(min, Math.min(max, val));
    return paddingTop + plotHeight - ((clamped - min) / (max - min)) * plotHeight;
  };

  // Generate SVG path strings
  const bzPath = data.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYBz(pt.bz)}`, '');
  const eFieldPath = data.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYEField(pt.eField)}`, '');
  const gicPath = data.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYGic(pt.gicAmps)}`, '');

  // Fill gradient path for GIC
  const gicAreaPath = `${gicPath} L ${getX(data.length - 1)} ${paddingTop + plotHeight} L ${getX(0)} ${paddingTop + plotHeight} Z`;

  const latest = data[data.length - 1] || { bz: currentBz, speed: currentSpeed, eField: currentEField, gicAmps: currentGic, time: '' };
  const hoveredPoint = hoveredIdx !== null ? data[hoveredIdx] : latest;

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginTop: '16px'
    }}>
      {/* Header Bar */}
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
            Real-Time Induction Waveform Oscilloscope
          </strong>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            fontWeight: 700,
            border: '1px solid #fecaca'
          }}>
            L1 &bull; 60s Stream
          </span>
        </div>

        {/* Channel Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginRight: '4px' }}>Trace:</span>
          {(['all', 'bz', 'efield', 'gic'] as const).map(chan => (
            <button
              key={chan}
              onClick={() => setActiveChannel(chan)}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: activeChannel === chan ? '#991b1b' : '#cbd5e1',
                backgroundColor: activeChannel === chan ? '#991b1b' : '#ffffff',
                color: activeChannel === chan ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {chan === 'all' ? 'All Channels' : chan === 'bz' ? 'IMF Bz' : chan === 'efield' ? 'E-Field (V/km)' : 'Neutral GIC (A)'}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Readout Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '10px',
        padding: '12px 16px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#fafbfc'
      }}>
        {/* IMF Bz */}
        <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>IMF Bz (Southward)</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: hoveredPoint.bz < -10 ? '#991b1b' : '#0f172a', fontFamily: 'monospace' }}>
            {hoveredPoint.bz} nT
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Solar Wind: {hoveredPoint.speed} km/s</div>
        </div>

        {/* E-Field */}
        <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Induced Geoelectric |E|</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: hoveredPoint.eField > 0.1 ? '#d97706' : '#0f172a', fontFamily: 'monospace' }}>
            {hoveredPoint.eField} V/km
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Wait 1D Multi-Layer Model</div>
        </div>

        {/* GIC Neutral Current */}
        <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Max Neutral GIC</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: hoveredPoint.gicAmps > 20 ? '#991b1b' : '#0f172a', fontFamily: 'monospace' }}>
            {hoveredPoint.gicAmps} A
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Hydra 765 kV Transformer</div>
        </div>

        {/* Time Stamp */}
        <div style={{ padding: '8px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Time (UTC+2)</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
            {hoveredPoint.time}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#10b981' }}>&bull; Live Synced</div>
        </div>
      </div>

      {/* SVG Waveform Oscilloscope Display */}
      <div style={{ padding: '10px 16px', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="gic-glow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + plotHeight * pct;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + plotWidth}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Zero Line for Bz (where Bz = 0) */}
          <line
            x1={paddingLeft}
            y1={getYBz(0)}
            x2={paddingLeft + plotWidth}
            y2={getYBz(0)}
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x={paddingLeft - 6} y={getYBz(0) + 3} fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">
            0 nT
          </text>

          {/* Y Axis Reference Labels */}
          <text x={paddingLeft - 6} y={getYBz(-25)} fill="#ef4444" fontSize="8" textAnchor="end" fontFamily="monospace">
            -25nT
          </text>
          <text x={paddingLeft - 6} y={paddingTop + plotHeight + 15} fill="#64748b" fontSize="8" textAnchor="start">
            T-48s
          </text>
          <text x={paddingLeft + plotWidth} y={paddingTop + plotHeight + 15} fill="#64748b" fontSize="8" textAnchor="end">
            Now
          </text>

          {/* Danger Threshold Line for GIC: 20A */}
          <line
            x1={paddingLeft}
            y1={getYGic(20)}
            x2={paddingLeft + plotWidth}
            y2={getYGic(20)}
            stroke="#fca5a5"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text x={paddingLeft + plotWidth - 4} y={getYGic(20) - 4} fill="#ef4444" fontSize="8" textAnchor="end" fontFamily="monospace">
            Critical Threshold (20 A)
          </text>

          {/* Render Channel Curves */}

          {/* 1. Neutral GIC (Red Curve with Area Fill) */}
          {(activeChannel === 'all' || activeChannel === 'gic') && (
            <>
              <path d={gicAreaPath} fill="url(#gic-glow-grad)" />
              <path
                d={gicPath}
                fill="none"
                stroke="#991b1b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* 2. Geoelectric Field (Gold / Amber Curve) */}
          {(activeChannel === 'all' || activeChannel === 'efield') && (
            <path
              d={eFieldPath}
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 3. Solar Wind IMF Bz (Cyan / Navy Curve) */}
          {(activeChannel === 'all' || activeChannel === 'bz') && (
            <path
              d={bzPath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Scrubbing Cursor */}
          {hoveredIdx !== null && (
            <g>
              <line
                x1={getX(hoveredIdx)}
                y1={paddingTop}
                x2={getX(hoveredIdx)}
                y2={paddingTop + plotHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoveredIdx)}
                y={getYGic(data[hoveredIdx].gicAmps)}
                r="4"
                fill="#991b1b"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(hoveredIdx)}
                y={getYBz(data[hoveredIdx].bz)}
                r="3.5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Hover Capture Overlay Rectangles */}
          {data.map((_, i) => (
            <rect
              key={i}
              x={getX(i) - (plotWidth / data.length) / 2}
              y={paddingTop}
              width={plotWidth / data.length}
              height={plotHeight}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoveredIdx(i)}
            />
          ))}
        </svg>
      </div>

      {/* Legend Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '8px 16px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #eaecf0',
        fontSize: '0.72rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#991b1b', borderRadius: '2px' }} />
          <span><strong>Neutral GIC Current (A)</strong> &bull; Hydra 765 kV</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: '#d97706', borderRadius: '2px' }} />
          <span><strong>Induced Geoelectric Field |E| (V/km)</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: '#0284c7', borderRadius: '2px', borderTop: '1px dashed #0284c7' }} />
          <span><strong>IMF Bz Component (nT)</strong> &bull; L1 Monitor</span>
        </div>
      </div>
    </div>
  );
}
