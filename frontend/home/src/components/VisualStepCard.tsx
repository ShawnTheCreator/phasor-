import React from 'react';

interface VisualStepCardProps {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  isDark?: boolean;
}

export default function VisualStepCard({ step, isDark = false }: VisualStepCardProps): JSX.Element {
  const cardClass = `step-card-thumbnail ${isDark ? 'step-card-dark' : ''}`;
  const textMuted = isDark ? '#94a3b8' : '#475569';
  const textSub = isDark ? '#cbd5e1' : '#64748b';
  const gridLine = isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';

  switch (step) {
    case 1:
      // DSCOVR L1 Satellite Ingestion & Solar Wind Telemetry
      return (
        <div className={cardClass}>
          <div className="step-card-header">
            <span className="dot-red" />
            <span className="card-sub">DSCOVR L1 • 1.5M km</span>
          </div>
          <svg className="step-card-svg" viewBox="0 0 160 90" fill="none">
            {/* Sun-Earth L1 line */}
            <line x1="15" y1="45" x2="145" y2="45" stroke={gridLine} strokeDasharray="3 3" strokeWidth="1" />
            {/* L1 marker */}
            <circle cx="50" cy="45" r="4" fill="#ef4444" />
            <text x="50" y="35" fontSize="8" fill="#ef4444" textAnchor="middle" fontWeight="700">L1 Orbit</text>
            {/* Satellite Icon */}
            <rect x="44" y="42" width="12" height="6" rx="1" fill={isDark ? "#f8fafc" : "#1e293b"} />
            <line x1="38" y1="45" x2="44" y2="45" stroke="#38bdf8" strokeWidth="2" />
            <line x1="56" y1="45" x2="62" y2="45" stroke="#38bdf8" strokeWidth="2" />
            {/* Earth */}
            <circle cx="135" cy="45" r="9" fill="#3b82f6" />
            <circle cx="135" cy="45" r="14" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 2" />
            {/* Solar wind stream */}
            <path d="M 15 35 Q 32 30 50 35 T 85 35 T 120 40" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.9" />
            <path d="M 15 55 Q 32 60 50 55 T 85 55 T 120 50" stroke="#f97316" strokeWidth="1.2" fill="none" opacity="0.9" />
            <text x="15" y="78" fontSize="7.5" fill={textSub} fontWeight="600">Bz: -18.4 nT • 680 km/s</text>
          </svg>
        </div>
      );

    case 2:
      // 1D MT Lithospheric Impedance Layers (Kaapvaal Craton)
      return (
        <div className={cardClass}>
          <div className="step-card-header">
            <span className="dot-amber" />
            <span className="card-sub">Wait MT 1D • Kaapvaal</span>
          </div>
          <svg className="step-card-svg" viewBox="0 0 160 90" fill="none">
            {/* Layer 1: Sedimentary */}
            <rect x="15" y="24" width="130" height="12" fill={isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"} rx="1" />
            <text x="22" y="33" fontSize="6.5" fill={textMuted} fontWeight="600">Sediments (100 Ω·m)</text>
            {/* Layer 2: Highly Resistive Cratonic Crust */}
            <rect x="15" y="38" width="130" height="22" fill={isDark ? "rgba(249, 115, 22, 0.25)" : "#fed7aa"} rx="1" />
            <text x="22" y="52" fontSize="7" fill={isDark ? "#fdba74" : "#9a3412"} fontWeight="700">Kaapvaal Craton (8,500 Ω·m)</text>
            {/* Layer 3: Upper Mantle */}
            <rect x="15" y="62" width="130" height="16" fill={isDark ? "rgba(255, 255, 255, 0.04)" : "#cbd5e1"} rx="1" />
            <text x="22" y="73" fontSize="6.5" fill={textMuted}>Mantle (30 Ω·m)</text>
            {/* Induced E-field Vector */}
            <line x1="110" y1="28" x2="135" y2="28" stroke="#ef4444" strokeWidth="2" />
            <polygon points="135,28 130,25 130,31" fill="#ef4444" />
            <text x="122" y="22" fontSize="7" fill="#ef4444" fontWeight="700">E = 3.8 V/km</text>
          </svg>
        </div>
      );

    case 3:
      // Lehtinen-Pirjola Transmission Admittance Grid
      return (
        <div className={cardClass}>
          <div className="step-card-header">
            <span className="dot-blue" />
            <span className="card-sub">LP Admittance [Y]</span>
          </div>
          <svg className="step-card-svg" viewBox="0 0 160 90" fill="none">
            {/* Transmission line between nodes */}
            <line x1="30" y1="42" x2="80" y2="35" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="80" y1="35" x2="130" y2="45" stroke="#0284c7" strokeWidth="2.5" />
            {/* Substations */}
            <circle cx="30" cy="42" r="5" fill={isDark ? "#f8fafc" : "#1e293b"} />
            <circle cx="80" cy="35" r="6" fill="#ef4444" />
            <circle cx="130" cy="45" r="5" fill={isDark ? "#f8fafc" : "#1e293b"} />
            <text x="30" y="30" fontSize="7" fill={textMuted} textAnchor="middle" fontWeight="600">Majuba</text>
            <text x="80" y="22" fontSize="7.5" fill="#ef4444" textAnchor="middle" fontWeight="700">Hydra</text>
            <text x="130" y="33" fontSize="7" fill={textMuted} textAnchor="middle" fontWeight="600">Perseus</text>
            {/* Earth grounding neutral arrow */}
            <line x1="80" y1="41" x2="80" y2="60" stroke="#dc2626" strokeWidth="2" strokeDasharray="2 1" />
            <line x1="72" y1="60" x2="88" y2="60" stroke={textMuted} strokeWidth="2" />
            <line x1="75" y1="64" x2="85" y2="64" stroke={textMuted} strokeWidth="1.5" />
            <line x1="78" y1="68" x2="82" y2="68" stroke={textMuted} strokeWidth="1" />
            <text x="94" y="55" fontSize="7.5" fill="#dc2626" fontWeight="700">I_gic = 26.8 A</text>
            <text x="15" y="80" fontSize="7" fill={textSub}>Kirchhoff ΣI = 0 balanced</text>
          </svg>
        </div>
      );

    case 4:
      // Bi-LSTM Dst Neural Network Forecast Curve
      return (
        <div className={cardClass}>
          <div className="step-card-header">
            <span className="dot-purple" />
            <span className="card-sub">Bi-LSTM • 6h Horizon</span>
          </div>
          <svg className="step-card-svg" viewBox="0 0 160 90" fill="none">
            {/* Grid lines */}
            <line x1="20" y1="20" x2="20" y2="75" stroke={gridLine} strokeWidth="1" />
            <line x1="20" y1="50" x2="145" y2="50" stroke={gridLine} strokeWidth="1" strokeDasharray="2 2" />
            <text x="8" y="52" fontSize="6.5" fill={textSub}>0</text>
            <text x="2" y="73" fontSize="6.5" fill="#dc2626">-250</text>
            {/* Shaded confidence interval band */}
            <path
              d="M 20 48 Q 50 50 75 58 T 110 72 T 140 68 L 140 76 T 110 82 T 75 64 T 20 52 Z"
              fill={isDark ? "rgba(168, 85, 247, 0.25)" : "rgba(147, 51, 234, 0.15)"}
            />
            {/* Observed historical Dst */}
            <path d="M 20 50 Q 45 49 70 56" stroke={textMuted} strokeWidth="2" fill="none" />
            {/* Forecasted Curve */}
            <path d="M 70 56 Q 95 68 115 76 T 140 72" stroke="#a855f7" strokeWidth="2.2" strokeDasharray="3 2" fill="none" />
            <circle cx="70" cy="56" r="3" fill={textMuted} />
            <text x="70" y="44" fontSize="7" fill={textMuted} fontWeight="700">T_0 (Now)</text>
            <circle cx="115" cy="76" r="3" fill="#ef4444" />
            <text x="115" y="86" fontSize="7" fill="#ef4444" fontWeight="700">Dst -245 nT</text>
          </svg>
        </div>
      );

    case 5:
      // Transformer Core Saturation & Reactive Deficit
      return (
        <div className={cardClass}>
          <div className="step-card-header">
            <span className="dot-red" />
            <span className="card-sub">Core Saturation • Q_loss</span>
          </div>
          <svg className="step-card-svg" viewBox="0 0 160 90" fill="none">
            {/* B-H Curve with DC Shift */}
            <line x1="80" y1="18" x2="80" y2="78" stroke={gridLine} strokeWidth="1" />
            <line x1="25" y1="48" x2="135" y2="48" stroke={gridLine} strokeWidth="1" />
            <text x="83" y="24" fontSize="6.5" fill={textSub}>B (Flux)</text>
            <text x="122" y="44" fontSize="6.5" fill={textSub}>H (Field)</text>
            {/* Normal symmetric loop */}
            <path
              d="M 50 68 C 65 65 72 52 80 48 C 88 44 95 31 110 28 C 95 31 88 44 80 48 C 72 52 65 65 50 68 Z"
              stroke={textSub}
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="2 2"
            />
            {/* Saturated Offset Loop */}
            <path
              d="M 65 72 C 80 70 90 56 100 48 C 112 40 125 24 135 22 C 120 25 110 40 100 48 C 90 56 80 70 65 72 Z"
              stroke="#ef4444"
              strokeWidth="2"
              fill="rgba(239, 68, 68, 0.2)"
            />
            <text x="25" y="32" fontSize="7" fill="#ef4444" fontWeight="700">Q_loss = 9.8 MVAR</text>
            <text x="25" y="80" fontSize="7" fill={isDark ? "#fca5a5" : "#b91c1c"} fontWeight="600">Half-Cycle DC Bias Saturation</text>
          </svg>
        </div>
      );

    case 6:
      // NERC TPL-007 Automated Advisory Document
      return (
        <div className={cardClass}>
          <div className="step-card-header">
            <span className="dot-green" />
            <span className="card-sub">NERC TPL-007 Dispatch</span>
          </div>
          <svg className="step-card-svg" viewBox="0 0 160 90" fill="none">
            {/* Document sheet */}
            <rect x="25" y="16" width="110" height="64" rx="3" fill={isDark ? "#1e293b" : "#ffffff"} stroke={gridLine} strokeWidth="1" />
            {/* Header bar */}
            <rect x="25" y="16" width="110" height="12" rx="3" fill="#991b1b" />
            <text x="32" y="25" fontSize="6.5" fill="#ffffff" fontWeight="700">PHASOR DISPATCH BULLETIN</text>
            {/* Text lines */}
            <line x1="32" y1="36" x2="100" y2="36" stroke={isDark ? "#94a3b8" : "#334155"} strokeWidth="2.5" />
            <line x1="32" y1="43" x2="120" y2="43" stroke={textSub} strokeWidth="1.5" />
            <line x1="32" y1="50" x2="115" y2="50" stroke={textSub} strokeWidth="1.5" />
            <line x1="32" y1="57" x2="85" y2="57" stroke={textSub} strokeWidth="1.5" />
            {/* Status tag */}
            <rect x="32" y="64" width="44" height="11" rx="2" fill={isDark ? "rgba(220, 38, 38, 0.2)" : "#fef2f2"} stroke="#dc2626" strokeWidth="0.8" />
            <text x="36" y="72" fontSize="6" fill="#ef4444" fontWeight="700">G4 WATCH ACTIVE</text>
            {/* Verified check */}
            <circle cx="120" cy="68" r="6" fill="#16a34a" />
            <path d="M 117 68 L 119 70 L 123 66" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
      );

    default:
      return <div className={cardClass} />;
  }
}
