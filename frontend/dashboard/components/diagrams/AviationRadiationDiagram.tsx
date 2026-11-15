import React, { useState } from 'react';

interface AviationRadiationDiagramProps {
  currentDoseRateFL390?: number;
  currentDoseRateFL310?: number;
}

export default function AviationRadiationDiagram({
  currentDoseRateFL390 = 64.2,
  currentDoseRateFL310 = 36.8
}: AviationRadiationDiagramProps): JSX.Element {
  const [selectedFL, setSelectedFL] = useState<number>(390);

  // Flight levels data: FL250, FL290, FL310, FL350, FL390, FL410, FL450
  const flightLevels = [
    { fl: 250, altFt: '25,000 ft', doseQuiet: 2.1, doseStorm: 14.5, icao: 'NOMINAL' },
    { fl: 290, altFt: '29,000 ft', doseQuiet: 3.5, doseStorm: 26.2, icao: 'NOMINAL' },
    { fl: 310, altFt: '31,000 ft', doseQuiet: 4.8, doseStorm: currentDoseRateFL310, icao: 'MODERATE' },
    { fl: 350, altFt: '35,000 ft', doseQuiet: 6.2, doseStorm: 48.0, icao: 'MODERATE' },
    { fl: 390, altFt: '39,000 ft', doseQuiet: 7.9, doseStorm: currentDoseRateFL390, icao: 'SEVERE' },
    { fl: 410, altFt: '41,000 ft', doseQuiet: 9.1, doseStorm: 78.4, icao: 'SEVERE' },
    { fl: 450, altFt: '45,000 ft', doseQuiet: 11.2, doseStorm: 104.0, icao: 'SEVERE' },
  ];

  // HF aeronautical frequencies absorption data (3 MHz to 30 MHz)
  const hfFrequencies = [
    { freq: '3.4 MHz', band: 'Aero-Route 1', db: 14.2, status: 'BLACKOUT' },
    { freq: '5.6 MHz', band: 'Aero-Route 2', db: 9.8, status: 'BLACKOUT' },
    { freq: '8.8 MHz', band: 'Northbound', db: 6.4, status: 'DEGRADED' },
    { freq: '11.3 MHz', band: 'Trans-Atlantic', db: 3.8, status: 'DEGRADED' },
    { freq: '13.3 MHz', band: 'High Oceanic', db: 2.1, status: 'USABLE' },
    { freq: '17.9 MHz', band: 'Solar Quiet', db: 1.2, status: 'OPTIMAL' },
  ];

  const svgWidth = 460;
  const svgHeight = 200;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const maxDose = 110; // uSv/h
  const getX = (dose: number) => paddingLeft + (dose / maxDose) * plotWidth;
  const getY = (idx: number) => paddingTop + (idx / (flightLevels.length - 1)) * plotHeight;

  // Generate curves
  const stormPath = flightLevels.reduce((acc, fl, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(fl.doseStorm)} ${getY(i)}`, '');
  const quietPath = flightLevels.reduce((acc, fl, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(fl.doseQuiet)} ${getY(i)}`, '');

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
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
          </svg>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            Aviation Ionizing Radiation Cross-Section & HF Fadeout
          </strong>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 700, padding: '2px 6px', backgroundColor: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
          ICAO SWIS &bull; PECASUS Aligned
        </span>
      </div>

      {/* Two Column Split: Altitude Radiation Profile + HF Riometer Spectrum */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        padding: '16px'
      }}>
        {/* Left: Flight Level vs Dose Rate Curve */}
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #eaecf0' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
            Altitude Dose Profile: FL250 to FL450 (&mu;Sv/h)
          </div>

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* ICAO Moderate Threshold at 30 uSv/h */}
            <line
              x1={getX(30)}
              y1={paddingTop}
              x2={getX(30)}
              y2={paddingTop + plotHeight}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <text x={getX(30)} y={paddingTop - 6} fill="#b45309" fontSize="7.5" textAnchor="middle" fontWeight="bold">
              ICAO Moderate (30 &mu;Sv/h)
            </text>

            {/* ICAO Severe Threshold at 80 uSv/h */}
            <line
              x1={getX(80)}
              y1={paddingTop}
              x2={getX(80)}
              y2={paddingTop + plotHeight}
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <text x={getX(80)} y={paddingTop - 6} fill="#991b1b" fontSize="7.5" textAnchor="middle" fontWeight="bold">
              ICAO Severe (80 &mu;Sv/h)
            </text>

            {/* Flight Level Horizontal Y-Lines */}
            {flightLevels.map((fl, i) => (
              <g key={fl.fl}>
                <line
                  x1={paddingLeft}
                  y1={getY(i)}
                  x2={paddingLeft + plotWidth}
                  y2={getY(i)}
                  stroke="#e2e8f0"
                  strokeWidth="0.8"
                />
                <text x={paddingLeft - 6} y={getY(i) + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                  FL{fl.fl}
                </text>
              </g>
            ))}

            {/* Quiet Sun Baseline Curve (Green) */}
            <path d={quietPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />

            {/* Solar Storm G5 Curve (Red) */}
            <path d={stormPath} fill="none" stroke="#991b1b" strokeWidth="2.5" />

            {/* FL390 to FL310 Stepped Descent Arrow */}
            {(() => {
              const x390 = getX(currentDoseRateFL390);
              const y390 = getY(4); // FL390
              const x310 = getX(currentDoseRateFL310);
              const y310 = getY(2); // FL310
              return (
                <g>
                  <line x1={x390} y1={y390} x2={x310} y2={y310} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                  <circle cx={x390} cy={y390} r="4" fill="#991b1b" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={x310} cy={y310} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={x310 + 6} y={y310 - 4} fill="#2563eb" fontSize="7.5" fontWeight="bold">
                    &darr; Step Down (-42% Dose Rate)
                  </text>
                </g>
              );
            })()}
          </svg>

          <div style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
            FL390: <strong style={{ color: '#991b1b', fontFamily: 'monospace' }}>{currentDoseRateFL390} &mu;Sv/h</strong> &rarr; FL310: <strong style={{ color: '#15803d', fontFamily: 'monospace' }}>{currentDoseRateFL310} &mu;Sv/h</strong>
          </div>
        </div>

        {/* Right: HF Riometer Absorption Spectrum */}
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #eaecf0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              D-Region HF Riometer Absorption (dB)
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '10px' }}>
              Polar cap absorption (PCA) and solar flare D-region ionization attenuate high-frequency radio.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {hfFrequencies.map((hf, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
                  <span style={{ width: '60px', color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>{hf.freq}</span>
                  <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(hf.db / 16) * 100}%`,
                      height: '100%',
                      backgroundColor: hf.status === 'BLACKOUT' ? '#991b1b' : hf.status === 'DEGRADED' ? '#d97706' : '#10b981',
                      borderRadius: '3px'
                    }} />
                  </div>
                  <span style={{ width: '45px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    -{hf.db} dB
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: hf.status === 'BLACKOUT' ? '#fef2f2' : hf.status === 'DEGRADED' ? '#fffbeb' : '#f0fdf4',
                    color: hf.status === 'BLACKOUT' ? '#991b1b' : hf.status === 'DEGRADED' ? '#b45309' : '#15803d',
                    fontWeight: 700
                  }}>
                    {hf.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: '0.66rem',
            color: '#64748b',
            lineHeight: 1.4,
            padding: '6px 8px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            marginTop: '8px'
          }}>
            &#128225; <strong>Advisory:</strong> Reroute sub-polar oceanic flight plans to SATVOICE / CPDLC due to HF fadeout below 10 MHz.
          </div>
        </div>
      </div>
    </div>
  );
}
