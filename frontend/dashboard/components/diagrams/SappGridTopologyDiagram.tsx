import React, { useState, useEffect } from 'react';

interface SappSubstationVisual {
  id: string;
  name: string;
  country: string;
  voltageKv: number;
  gicAmps: number;
  qLossMvar: number;
  hasBlocking: boolean;
  isBlocked: boolean;
  x: number;
  y: number;
}

export default function SappGridTopologyDiagram(): JSX.Element {
  const [pulse, setPulse] = useState<number>(0);
  const [reroutingActive, setReroutingActive] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>('HYDRA');

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(p => (p + 1) % 60);
    }, 60);
    return () => clearInterval(timer);
  }, []);

  const substations: SappSubstationVisual[] = [
    { id: 'HYDRA', name: 'Hydra 765kV', country: 'South Africa', voltageKv: 765, gicAmps: 26.8, qLossMvar: 10.2, hasBlocking: true, isBlocked: true, x: 280, y: 220 },
    { id: 'AUAS', name: 'Auas Hub', country: 'Namibia', voltageKv: 400, gicAmps: 16.2, qLossMvar: 6.2, hasBlocking: false, isBlocked: false, x: 90, y: 150 },
    { id: 'PHOKOJE', name: 'Phokoje Joint', country: 'Botswana', voltageKv: 400, gicAmps: 14.8, qLossMvar: 5.6, hasBlocking: false, isBlocked: false, x: 260, y: 110 },
    { id: 'SONGO', name: 'Songo Converter', country: 'Mozambique', voltageKv: 533, gicAmps: 19.4, qLossMvar: 7.4, hasBlocking: true, isBlocked: true, x: 440, y: 60 },
    { id: 'INSUKAMINI', name: 'Insukamini', country: 'Zimbabwe', voltageKv: 400, gicAmps: 12.5, qLossMvar: 4.8, hasBlocking: false, isBlocked: false, x: 370, y: 90 },
    { id: 'APOLLO', name: 'Apollo Converter', country: 'South Africa', voltageKv: 533, gicAmps: 15.6, qLossMvar: 6.1, hasBlocking: true, isBlocked: true, x: 330, y: 160 },
  ];

  const selected = substations.find(s => s.id === selectedId) || substations[0];

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
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          </svg>
          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
            SAPP Interconnector Power-Flow & Transformer Protection Schematic
          </strong>
        </div>

        <button
          onClick={() => setReroutingActive(!reroutingActive)}
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: reroutingActive ? '#15803d' : '#991b1b',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {reroutingActive ? '✓ 400 MW Songo-Apollo Reroute Active' : '⚡ Simulate PSS/E Load Rerouting'}
        </button>
      </div>

      {/* SVG Single Line Diagram */}
      <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '260px' }}>
        <div style={{ flex: '1 1 420px', minWidth: '300px', backgroundColor: '#090d16', position: 'relative' }}>
          <svg viewBox="0 0 540 260" style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="sapp-hvdc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Cross-border interconnector transmission lines */}
            {/* Songo -> Apollo HVDC */}
            <line x1="440" y1="60" x2="330" y2="160" stroke="url(#sapp-hvdc-grad)" strokeWidth="3" strokeDasharray="6 4" strokeDashoffset={-pulse * 1.5} />
            <text x="400" y="105" fill="#34d399" fontSize="7.5" fontWeight="bold">Songo-Apollo &plusmn;533kV HVDC</text>

            {/* Insukamini -> Phokoje */}
            <line x1="370" y1="90" x2="260" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
            
            {/* Phokoje -> Apollo */}
            <line x1="260" y1="110" x2="330" y2="160" stroke="#38bdf8" strokeWidth="2.5" />

            {/* Apollo -> Hydra 765kV */}
            <line x1="330" y1="160" x2="280" y2="220" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="8 6" strokeDashoffset={-pulse * 2} />
            <text x="315" y="195" fill="#f87171" fontSize="7.5" fontWeight="bold">765kV</text>

            {/* Auas -> Hydra */}
            <line x1="90" y1="150" x2="280" y2="220" stroke="#38bdf8" strokeWidth="2" />

            {/* Substation Nodes */}
            {substations.map(sub => {
              const isSel = selectedId === sub.id;
              const isHigh = sub.gicAmps > 18;
              return (
                <g key={sub.id} onClick={() => setSelectedId(sub.id)} style={{ cursor: 'pointer' }}>
                  {/* Transformer Star-Winding Symbol */}
                  <circle cx={sub.x} cy={sub.y} r={isSel ? 10 : 8} fill={sub.isBlocked ? '#10b981' : isHigh ? '#991b1b' : '#3b82f6'} stroke="#ffffff" strokeWidth="2" />
                  
                  {/* Neutral Grounding Line */}
                  <line x1={sub.x} y1={sub.y + (isSel ? 10 : 8)} x2={sub.x} y2={sub.y + 22} stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Ground Earth Symbol (3 horizontal lines) */}
                  <line x1={sub.x - 7} y1={sub.y + 22} x2={sub.x + 7} y2={sub.y + 22} stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1={sub.x - 4} y1={sub.y + 25} x2={sub.x + 4} y2={sub.y + 25} stroke="#94a3b8" strokeWidth="1.2" />
                  <line x1={sub.x - 2} y1={sub.y + 28} x2={sub.x + 2} y2={sub.y + 28} stroke="#94a3b8" strokeWidth="1" />

                  {/* Neutral Blocking Capacitor Indicator */}
                  {sub.hasBlocking && (
                    <g transform={`translate(${sub.x + 4}, ${sub.y + 13})`}>
                      <rect x="0" y="0" width="12" height="7" fill="#10b981" rx="1.5" />
                      <text x="6" y="5.5" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">BLOCKED</text>
                    </g>
                  )}

                  {/* Name Label */}
                  <text x={sub.x} y={sub.y - 12} fill={isSel ? '#ffffff' : '#cbd5e1'} fontSize={isSel ? '9.5' : '8'} fontWeight={isSel ? 'bold' : 'normal'} textAnchor="middle">
                    {sub.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Inspector */}
        <div style={{ flex: '0 0 220px', padding: '14px', backgroundColor: '#ffffff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              {selected.country} &bull; {selected.voltageKv} kV
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 10px 0' }}>
              {selected.name}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Neutral GIC:</span>
                <strong style={{ fontFamily: 'monospace', color: selected.gicAmps > 20 ? '#991b1b' : '#0f172a' }}>
                  {selected.gicAmps} A
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Reactive Loss:</span>
                <strong style={{ fontFamily: 'monospace' }}>{selected.qLossMvar} MVAR</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Neutral Blocking:</span>
                <span style={{
                  fontWeight: 700,
                  color: selected.isBlocked ? '#15803d' : '#b45309',
                  fontSize: '0.68rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: selected.isBlocked ? '#f0fdf4' : '#fffbeb'
                }}>
                  {selected.isBlocked ? 'CAPACITOR INSERTED' : 'UNPROTECTED'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.66rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #eaecf0' }}>
            &#128065; <strong>SAPP Dispatch Rule:</strong> Cross-border GIC circulation between Botswana (BPC) and South Africa (Eskom) is stabilized via series-capacitor compensated lines.
          </div>
        </div>
      </div>
    </div>
  );
}
