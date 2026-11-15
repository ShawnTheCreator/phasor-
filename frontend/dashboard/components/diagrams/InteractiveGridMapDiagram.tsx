import React, { useState } from 'react';

export interface GridSubstation {
  id: string;
  name: string;
  x: number; // SVG x coordinate (0 - 800)
  y: number; // SVG y coordinate (0 - 450)
  voltageKv: number;
  neutralGicAmps: number;
  qLossMvar: number;
  riskTier: 'NORMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL';
  province: string;
  utility: string;
  rgOhms: number;
}

export interface GridLine {
  id: string;
  from: string;
  to: string;
  voltageKv: number;
  lengthKm: number;
  currentAmps: number;
  type: '765kv' | '400kv' | 'hvdc';
}

interface InteractiveGridMapDiagramProps {
  substations?: GridSubstation[];
  exVkm?: number;
  eyVkm?: number;
  onSelectSubstation?: (substation: GridSubstation) => void;
}

const DEFAULT_SUBSTATIONS: GridSubstation[] = [
  { id: 'KOEBERG', name: 'Koeberg Nuclear Hub', x: 190, y: 395, voltageKv: 400, neutralGicAmps: 18.5, qLossMvar: 5.2, riskTier: 'ADVISORY', province: 'Western Cape', utility: 'Eskom', rgOhms: 0.12 },
  { id: 'HYDRA', name: 'Hydra Main Pivot', x: 380, y: 320, voltageKv: 765, neutralGicAmps: 26.8, qLossMvar: 9.8, riskTier: 'CRITICAL', province: 'Northern Cape', utility: 'Eskom', rgOhms: 0.08 },
  { id: 'ARIES', name: 'Aries Substation', x: 260, y: 280, voltageKv: 400, neutralGicAmps: 14.1, qLossMvar: 4.5, riskTier: 'WATCH', province: 'Northern Cape', utility: 'Eskom', rgOhms: 0.15 },
  { id: 'PERSEUS', name: 'Perseus Central Pivot', x: 470, y: 230, voltageKv: 765, neutralGicAmps: 22.4, qLossMvar: 8.2, riskTier: 'WATCH', province: 'Free State', utility: 'Eskom', rgOhms: 0.09 },
  { id: 'BETA', name: 'Beta Trans-Karoo', x: 440, y: 250, voltageKv: 765, neutralGicAmps: 8.3, qLossMvar: 3.0, riskTier: 'NORMAL', province: 'Free State', utility: 'Eskom', rgOhms: 0.11 },
  { id: 'MAJUBA', name: 'Majuba Generation Hub', x: 580, y: 195, voltageKv: 765, neutralGicAmps: 12.1, qLossMvar: 4.4, riskTier: 'ADVISORY', province: 'Mpumalanga', utility: 'Eskom', rgOhms: 0.10 },
  { id: 'TUTUKA', name: 'Tutuka Power Station', x: 570, y: 175, voltageKv: 400, neutralGicAmps: 9.5, qLossMvar: 3.6, riskTier: 'NORMAL', province: 'Mpumalanga', utility: 'Eskom', rgOhms: 0.14 },
  { id: 'KENDAL', name: 'Kendal Baseload Hub', x: 550, y: 155, voltageKv: 400, neutralGicAmps: 11.2, qLossMvar: 4.0, riskTier: 'ADVISORY', province: 'Mpumalanga', utility: 'Eskom', rgOhms: 0.12 },
  { id: 'APOLLO', name: 'Apollo HVDC Converter', x: 535, y: 135, voltageKv: 533, neutralGicAmps: 15.6, qLossMvar: 6.1, riskTier: 'WATCH', province: 'Gauteng', utility: 'Eskom', rgOhms: 0.07 },
  { id: 'MATIMBA', name: 'Matimba Super-Critical', x: 505, y: 75, voltageKv: 400, neutralGicAmps: 7.2, qLossMvar: 2.8, riskTier: 'NORMAL', province: 'Limpopo', utility: 'Eskom', rgOhms: 0.16 },
  { id: 'SONGO', name: 'Songo (Cahora Bassa)', x: 710, y: 40, voltageKv: 533, neutralGicAmps: 19.4, qLossMvar: 7.4, riskTier: 'WATCH', province: 'Tete (Mozambique)', utility: 'HCB', rgOhms: 0.08 },
  { id: 'AUAS', name: 'Auas Interconnector', x: 130, y: 160, voltageKv: 400, neutralGicAmps: 16.2, qLossMvar: 6.2, riskTier: 'WATCH', province: 'Windhoek (Namibia)', utility: 'NamPower', rgOhms: 0.13 },
  { id: 'PHOKOJE', name: 'Phokoje Cross-Border', x: 440, y: 120, voltageKv: 400, neutralGicAmps: 14.8, qLossMvar: 5.6, riskTier: 'WATCH', province: 'Selebi-Phikwe (Botswana)', utility: 'BPC', rgOhms: 0.14 },
  { id: 'INSUKAMINI', name: 'Insukamini Pivot', x: 560, y: 60, voltageKv: 400, neutralGicAmps: 12.5, qLossMvar: 4.8, riskTier: 'WATCH', province: 'Bulawayo (Zimbabwe)', utility: 'ZETDC', rgOhms: 0.15 }
];

const GRID_LINES: GridLine[] = [
  // 765 kV Super-Grid Backbone
  { id: 'L1', from: 'MAJUBA', to: 'PERSEUS', voltageKv: 765, lengthKm: 320, currentAmps: 1420, type: '765kv' },
  { id: 'L2', from: 'PERSEUS', to: 'BETA', voltageKv: 765, lengthKm: 48, currentAmps: 1210, type: '765kv' },
  { id: 'L3', from: 'BETA', to: 'HYDRA', voltageKv: 765, lengthKm: 290, currentAmps: 1530, type: '765kv' },
  { id: 'L4', from: 'PERSEUS', to: 'HYDRA', voltageKv: 765, lengthKm: 310, currentAmps: 1480, type: '765kv' },
  
  // 400 kV Transmission Network
  { id: 'L5', from: 'HYDRA', to: 'KOEBERG', voltageKv: 400, lengthKm: 680, currentAmps: 920, type: '400kv' },
  { id: 'L6', from: 'HYDRA', to: 'ARIES', voltageKv: 400, lengthKm: 240, currentAmps: 640, type: '400kv' },
  { id: 'L7', from: 'ARIES', to: 'AUAS', voltageKv: 400, lengthKm: 780, currentAmps: 450, type: '400kv' },
  { id: 'L8', from: 'KENDAL', to: 'TUTUKA', voltageKv: 400, lengthKm: 95, currentAmps: 1100, type: '400kv' },
  { id: 'L9', from: 'TUTUKA', to: 'MAJUBA', voltageKv: 400, lengthKm: 65, currentAmps: 1180, type: '400kv' },
  { id: 'L10', from: 'KENDAL', to: 'APOLLO', voltageKv: 400, lengthKm: 85, currentAmps: 1250, type: '400kv' },
  { id: 'L11', from: 'APOLLO', to: 'MATIMBA', voltageKv: 400, lengthKm: 340, currentAmps: 980, type: '400kv' },
  { id: 'L12', from: 'MATIMBA', to: 'PHOKOJE', voltageKv: 400, lengthKm: 210, currentAmps: 520, type: '400kv' },
  { id: 'L13', from: 'PHOKOJE', to: 'INSUKAMINI', voltageKv: 400, lengthKm: 380, currentAmps: 480, type: '400kv' },
  
  // ±533 kV SAPP HVDC Interconnector
  { id: 'L14', from: 'SONGO', to: 'APOLLO', voltageKv: 533, lengthKm: 1420, currentAmps: 1850, type: 'hvdc' }
];

export default function InteractiveGridMapDiagram({
  substations = DEFAULT_SUBSTATIONS,
  exVkm = 0.12,
  eyVkm = -0.08,
  onSelectSubstation
}: InteractiveGridMapDiagramProps): JSX.Element {
  const [selected, setSelected] = useState<GridSubstation>(substations[1] || DEFAULT_SUBSTATIONS[1]); // Default Hydra
  const [activeLayer, setActiveLayer] = useState<'all' | '765kv' | '400kv' | 'hvdc'>('all');

  // Compute geoelectric field vector angle and magnitude
  const eMag = Math.sqrt(exVkm * exVkm + eyVkm * eyVkm);
  const eAngleDeg = (Math.atan2(eyVkm, exVkm) * 180) / Math.PI;

  const handleSelect = (sub: GridSubstation) => {
    setSelected(sub);
    if (onSelectSubstation) onSelectSubstation(sub);
  };

  const getSubstationColor = (tier: string) => {
    switch (tier) {
      case 'CRITICAL': return '#991b1b'; // Deep Dark Red
      case 'WATCH': return '#d97706';    // Amber/Gold
      case 'ADVISORY': return '#2563eb'; // Technical Blue
      default: return '#059669';         // Emerald Green
    }
  };

  const filteredLines = GRID_LINES.filter(line => {
    if (activeLayer === 'all') return true;
    return line.type === activeLayer;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Diagram Top Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981'
          }} />
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            SAPP Transmission Network & GIC Vector Topology
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '4px' }}>
            (Interactive Vector Schematic)
          </span>
        </div>

        {/* Layer Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginRight: '4px' }}>Layer:</span>
          {(['all', '765kv', '400kv', 'hvdc'] as const).map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: activeLayer === layer ? '#991b1b' : '#e2e8f0',
                backgroundColor: activeLayer === layer ? '#991b1b' : '#ffffff',
                color: activeLayer === layer ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {layer === 'all' ? 'All Corridors' : layer === '765kv' ? '765 kV Super-Grid' : layer === '400kv' ? '400 kV' : '±533 kV HVDC'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas and Telemetry Split Pane */}
      <div style={{ display: 'flex', flexWrap: 'wrap', position: 'relative', width: '100%', minHeight: '380px' }}>
        {/* Main Vector SVG Map - Clean Light Slate Theme (No Dark Box, No Glows) */}
        <div style={{ flex: '1 1 540px', minWidth: '320px', position: 'relative', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
          <svg
            viewBox="0 0 800 450"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            {/* Regional Province / Geographic Outlines */}
            <path
              d="M 120 140 L 260 170 L 410 110 L 450 60 L 580 40 L 730 35 L 750 90 L 640 180 L 620 280 L 520 380 L 370 410 L 240 420 L 170 390 L 110 240 Z"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />

            {/* Geologic Subsurface Boundary: Kaapvaal Craton Strike Line */}
            <path
              d="M 370 190 Q 480 150 590 120"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              strokeDasharray="5 3"
            />
            <text x="460" y="140" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
              Kaapvaal Craton Boundary (&rho; &gt; 5,000 &Omega;&middot;m)
            </text>

            {/* Render Transmission Corridors (Clean Solid Lines) */}
            {filteredLines.map(line => {
              const fromSub = substations.find(s => s.id === line.from);
              const toSub = substations.find(s => s.id === line.to);
              if (!fromSub || !toSub) return null;

              const is765 = line.type === '765kv';
              const isHvdc = line.type === 'hvdc';
              const strokeColor = is765 ? '#991b1b' : isHvdc ? '#059669' : '#2563eb';
              const strokeWidth = is765 ? 2.5 : isHvdc ? 2.2 : 1.8;

              return (
                <g key={line.id}>
                  <line
                    x1={fromSub.x}
                    y1={fromSub.y}
                    x2={toSub.x}
                    y2={toSub.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={isHvdc ? '6 3' : undefined}
                  />
                </g>
              );
            })}

            {/* Render Substation Nodes (Crisp Flat Circles) */}
            {substations.map(sub => {
              const isSelected = selected?.id === sub.id;
              const color = getSubstationColor(sub.riskTier);
              const radius = sub.voltageKv === 765 ? 7 : sub.voltageKv === 533 ? 6.5 : 5.5;

              return (
                <g
                  key={sub.id}
                  onClick={() => handleSelect(sub)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Selection Outline */}
                  {isSelected && (
                    <circle
                      cx={sub.x}
                      cy={sub.y}
                      r={radius + 4}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Core Node Circle */}
                  <circle
                    cx={sub.x}
                    cy={sub.y}
                    r={radius}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Substation Label */}
                  <text
                    x={sub.x}
                    y={sub.y - radius - 5}
                    fill="#0f172a"
                    fontSize={isSelected ? '10' : '8.5'}
                    fontWeight={isSelected ? '700' : '600'}
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {sub.id}
                  </text>

                  {/* Neutral GIC Badge */}
                  <text
                    x={sub.x}
                    y={sub.y + radius + 11}
                    fill={Math.abs(sub.neutralGicAmps) > 20 ? '#991b1b' : '#64748b'}
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {sub.neutralGicAmps}A
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Compass & Induced Geoelectric Field Vector Overlay - Clean White Card */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#0f172a',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {/* SVG Polar Compass */}
            <svg width="40" height="40" viewBox="-22 -22 44 44">
              <circle r="18" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#f1f5f9" strokeWidth="1" />
              <text x="0" y="-11" fill="#94a3b8" fontSize="6.5" textAnchor="middle" fontWeight="bold">N</text>
              <text x="12" y="2" fill="#94a3b8" fontSize="6.5" textAnchor="middle" fontWeight="bold">E</text>

              {/* Clean E-Field Vector Arrow */}
              <g transform={`rotate(${eAngleDeg})`}>
                <line
                  x1="0"
                  y1="0"
                  x2={Math.min(16, Math.max(8, eMag * 90))}
                  y2="0"
                  stroke="#991b1b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polygon
                  points={`${Math.min(16, Math.max(8, eMag * 90)) + 3},0 ${Math.min(16, Math.max(8, eMag * 90)) - 2},-2.5 ${Math.min(16, Math.max(8, eMag * 90)) - 2},2.5`}
                  fill="#991b1b"
                />
              </g>
            </svg>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Induced E-Field
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                |E| = {eMag.toFixed(3)} V/km
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Ex: <span style={{ fontFamily: 'monospace' }}>{exVkm > 0 ? `+${exVkm}` : exVkm}</span> &bull; Ey: <span style={{ fontFamily: 'monospace' }}>{eyVkm > 0 ? `+${eyVkm}` : eyVkm}</span>
              </div>
            </div>
          </div>

          {/* Map Legend - Clean White Card */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            fontSize: '0.7rem',
            color: '#475569',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2.5px', backgroundColor: '#991b1b', borderRadius: '1px' }} />
              <span>765 kV Super-Grid</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: '#2563eb', borderRadius: '1px' }} />
              <span>400 kV Transmission</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: '#059669', borderRadius: '1px' }} />
              <span>±533 kV HVDC Link</span>
            </div>
          </div>
        </div>

        {/* Right Side Inspector & Live Substation Telemetry */}
        <div style={{
          flex: '0 0 260px',
          padding: '16px',
          borderLeft: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: selected.riskTier === 'CRITICAL' ? '#fef2f2' : selected.riskTier === 'WATCH' ? '#fffbeb' : '#f0fdf4',
                color: selected.riskTier === 'CRITICAL' ? '#991b1b' : selected.riskTier === 'WATCH' ? '#b45309' : '#15803d',
                border: `1px solid ${selected.riskTier === 'CRITICAL' ? '#fecaca' : selected.riskTier === 'WATCH' ? '#fde68a' : '#bbf7d0'}`
              }}>
                {selected.riskTier} STATE
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{selected.voltageKv} kV Class</span>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {selected.name}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '14px' }}>
              {selected.province} &bull; {selected.utility}
            </div>

            {/* Metric Meters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Neutral GIC */}
              <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #eaecf0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
                  <span>Neutral GIC Current:</span>
                  <strong style={{
                    color: Math.abs(selected.neutralGicAmps) > 20 ? '#991b1b' : '#0f172a',
                    fontFamily: 'monospace'
                  }}>
                    {selected.neutralGicAmps} A
                  </strong>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (Math.abs(selected.neutralGicAmps) / 35) * 100)}%`,
                    height: '100%',
                    backgroundColor: Math.abs(selected.neutralGicAmps) > 20 ? '#991b1b' : '#d97706',
                    borderRadius: '2px'
                  }} />
                </div>
              </div>

              {/* Reactive Loss (Q_loss) */}
              <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #eaecf0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
                  <span>Reactive Deficit (Q_loss):</span>
                  <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                    {selected.qLossMvar} MVAR
                  </strong>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (selected.qLossMvar / 15) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#2563eb',
                    borderRadius: '2px'
                  }} />
                </div>
              </div>

              {/* Grounding Impedance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', padding: '4px 0' }}>
                <span style={{ color: '#64748b' }}>Earth Mat Resistance (Rg):</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selected.rgOhms} &Omega;</span>
              </div>

              {/* Transformer Top-Oil Rise */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', padding: '4px 0' }}>
                <span style={{ color: '#64748b' }}>Estimated &Delta;T Hotspot:</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: selected.neutralGicAmps > 20 ? '#991b1b' : '#0f172a'
                }}>
                  +{(selected.neutralGicAmps * 1.8).toFixed(1)} &deg;C
                </span>
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.68rem',
            color: '#64748b',
            lineHeight: 1.4,
            padding: '8px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #eaecf0'
          }}>
            &#9888; <strong>Mitigation Directive:</strong> When neutral current exceeds 20A, initiate automatic tertiary-winding capacitor bank insertion.
          </div>
        </div>
      </div>
    </div>
  );
}
