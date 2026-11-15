import React, { useState, useEffect } from 'react';

interface StationScint {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  s4: number;
  sigmaPhi: number;
  errorM: number;
}

export default function GnssScintillationDiagram(): JSX.Element {
  const [driftOffset, setDriftOffset] = useState<number>(0);

  // Eastward drift animation of ionospheric plasma bubbles
  useEffect(() => {
    const timer = setInterval(() => {
      setDriftOffset(prev => (prev + 0.8) % 100);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const stations: StationScint[] = [
    { id: 'LSK', name: 'Lusaka', country: 'Zambia', lat: -15.4, lng: 28.3, s4: 0.62, sigmaPhi: 0.44, errorM: 6.8 },
    { id: 'HRE', name: 'Harare', country: 'Zimbabwe', lat: -17.8, lng: 31.0, s4: 0.52, sigmaPhi: 0.38, errorM: 5.2 },
    { id: 'TSU', name: 'Tsumeb', country: 'Namibia', lat: -19.2, lng: 17.6, s4: 0.38, sigmaPhi: 0.28, errorM: 3.4 },
    { id: 'SUT', name: 'Sutherland', country: 'South Africa', lat: -32.4, lng: 20.8, s4: 0.18, sigmaPhi: 0.12, errorM: 1.2 },
    { id: 'HER', name: 'Hermanus', country: 'South Africa', lat: -34.4, lng: 19.2, s4: 0.12, sigmaPhi: 0.08, errorM: 0.9 },
  ];

  // SVG coordinate projection helpers (Lat -10 to -36, Lng 12 to 36)
  const svgWidth = 560;
  const svgHeight = 240;
  const getX = (lng: number) => ((lng - 12) / (36 - 12)) * svgWidth;
  const getY = (lat: number) => ((lat - (-10)) / ((-36) - (-10))) * svgHeight;

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '20px'
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
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12s1.5-2 4-2 4 2 4 2" />
            <line x1="12" y1="15" x2="12.01" y2="15" />
          </svg>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            Equatorial Plasma Bubble (EPB) Scintillation Drift & EIA Anomaly Map
          </strong>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 700, padding: '2px 6px', backgroundColor: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
          SEPTENTRIO POLARX5 &bull; LIVE S4 NOWCAST
        </span>
      </div>

      {/* SVG Canvas - Clean Light Cartographic View */}
      <div style={{ position: 'relative', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Latitude guide lines */}
          {[-15, -20, -25, -30, -35].map(lat => (
            <g key={lat}>
              <line x1="0" y1={getY(lat)} x2={svgWidth} y2={getY(lat)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <text x="8" y={getY(lat) - 3} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">{lat}°S</text>
            </g>
          ))}

          {/* Equatorial Ionization Anomaly (EIA) Crest Zone (-12 to -18 Lat) */}
          <rect x="0" y={getY(-10)} width={svgWidth} height={getY(-18) - getY(-10)} fill="rgba(239, 68, 68, 0.05)" />
          <text x={svgWidth - 10} y={getY(-12)} fill="#991b1b" fontSize="8" fontWeight="bold" textAnchor="end">
            Equatorial Ionization Anomaly (EIA Crest) - Rayleigh-Taylor Instability Zone
          </text>

          {/* Drifting Plasma Bubble Plumes (Clean Flat Contours) */}
          {[16, 23, 30].map((baseLng, i) => {
            const currentLng = baseLng + (driftOffset * 0.12);
            const plumeX = getX(currentLng > 36 ? currentLng - 24 : currentLng);
            const plumeY = getY(-16);
            return (
              <g key={i}>
                <ellipse cx={plumeX} cy={plumeY} rx="45" ry="30" fill="rgba(239, 68, 68, 0.06)" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3 2" />
                <line x1={plumeX} y1={plumeY - 22} x2={plumeX} y2={plumeY + 22} stroke="#f87171" strokeWidth="1" strokeDasharray="2 2" />
                <text x={plumeX} y={plumeY + 34} fill="#b91c1c" fontSize="7" fontWeight="bold" textAnchor="middle">
                  EPB Plume #{i + 1} (120 m/s →)
                </text>
              </g>
            );
          })}

          {/* Monitoring Ground Stations */}
          {stations.map(st => {
            const x = getX(st.lng);
            const y = getY(st.lat);
            const color = st.s4 >= 0.5 ? '#991b1b' : st.s4 >= 0.3 ? '#d97706' : '#059669';

            return (
              <g key={st.id}>
                <circle cx={x} cy={y} r="4.5" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                <text x={x} y={y - 8} fill="#0f172a" fontSize="8" fontWeight="700" textAnchor="middle">
                  {st.name} ({st.country})
                </text>
                <text x={x} y={y + 13} fill={color} fontSize="7.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  S4 = {st.s4} • ±{st.errorM}m
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend - Clean White Card */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          backgroundColor: '#ffffff',
          padding: '6px 10px',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          fontSize: '0.68rem',
          color: '#475569',
          display: 'flex',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div><span style={{ color: '#991b1b', fontWeight: 'bold' }}>●</span> S4 &gt; 0.5 (Severe Loss-of-Lock)</div>
          <div><span style={{ color: '#d97706', fontWeight: 'bold' }}>●</span> S4 0.3 - 0.5 (Degraded RTK)</div>
          <div><span style={{ color: '#059669', fontWeight: 'bold' }}>●</span> S4 &lt; 0.3 (Nominal)</div>
        </div>
      </div>
    </div>
  );
}
