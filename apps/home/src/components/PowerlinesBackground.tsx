import React from 'react';

interface PowerlinesBackgroundProps {
  whiteProgress: number;
  scrollProgress: number;
}

export default function PowerlinesBackground({ whiteProgress, scrollProgress }: PowerlinesBackgroundProps): JSX.Element {
  const t = Math.min(1, Math.max(0, whiteProgress));

  // Interpolate tower and cable strokes between dark phase and white phase
  // When t=0 (dark): luminous light lines (255, 255, 255)
  // When t=1 (white): dark charcoal high-contrast vector lines (15, 23, 42)
  const r = Math.round(255 * (1 - t) + 15 * t);
  const g = Math.round(255 * (1 - t) + 23 * t);
  const b = Math.round(255 * (1 - t) + 42 * t);

  const towerAlpha = (0.28 * (1 - t) + 0.78 * t).toFixed(3);
  const cableAlpha = (0.35 * (1 - t) + 0.88 * t).toFixed(3);

  const towerStroke = `rgba(${r}, ${g}, ${b}, ${towerAlpha})`;
  const towerFill = `rgba(${r}, ${g}, ${b}, ${(0.03 * (1 - t) + 0.06 * t).toFixed(3)})`;
  const cableStroke = `rgba(${r}, ${g}, ${b}, ${cableAlpha})`;

  // Current pulse color
  const pulseR = Math.round(239 * (1 - t) + 153 * t);
  const pulseG = Math.round(68 * (1 - t) + 27 * t);
  const pulseB = Math.round(68 * (1 - t) + 27 * t);
  const cablePulse = `rgba(${pulseR}, ${pulseG}, ${pulseB}, 0.92)`;

  const landscapeFill = `rgba(${r}, ${g}, ${b}, ${(0.04 * (1 - t) + 0.08 * t).toFixed(3)})`;

  // Horizontal movement to the right applied to inner graphics (NOT the SVG box itself!)
  // This guarantees the SVG element always covers 100% of the screen with ZERO white gaps on edges
  const moveRightX = scrollProgress * 320;

  // 14 towers spanning 5,850px from x = -1800 to x = 4050 at 450px pitch
  const TOWER_X = [-1800, -1350, -900, -450, 0, 450, 900, 1350, 1800, 2250, 2700, 3150, 3600, 4050];

  // Helper to render an Eskom 765 kV steel lattice transmission tower
  const renderTower = (cx: number, key: string | number): JSX.Element => (
    <g key={key} id={`pylon-${key}`}>
      {/* Main tapered vertical lattice body */}
      <polygon
        points={`${cx},70 ${cx - 55},650 ${cx + 55},650`}
        fill={towerFill}
        stroke={towerStroke}
        strokeWidth="2.2"
      />

      {/* Sky-wire peak spire */}
      <line x1={cx} y1={35} x2={cx} y2={70} stroke={towerStroke} strokeWidth="2.6" />
      <circle cx={cx} cy={35} r="3.5" fill={towerStroke} />

      {/* Top Cross-Arm (y=135, width 260px) */}
      <line x1={cx - 130} y1={135} x2={cx + 130} y2={135} stroke={towerStroke} strokeWidth="3.2" />
      <line x1={cx - 130} y1={135} x2={cx} y2={90} stroke={towerStroke} strokeWidth="1.8" />
      <line x1={cx + 130} y1={135} x2={cx} y2={90} stroke={towerStroke} strokeWidth="1.8" />
      <line x1={cx - 95} y1={135} x2={cx} y2={165} stroke={towerStroke} strokeWidth="1.5" />
      <line x1={cx + 95} y1={135} x2={cx} y2={165} stroke={towerStroke} strokeWidth="1.5" />

      {/* Middle Cross-Arm (y=215, width 320px) */}
      <line x1={cx - 160} y1={215} x2={cx + 160} y2={215} stroke={towerStroke} strokeWidth="3.4" />
      <line x1={cx - 160} y1={215} x2={cx} y2={165} stroke={towerStroke} strokeWidth="1.8" />
      <line x1={cx + 160} y1={215} x2={cx} y2={165} stroke={towerStroke} strokeWidth="1.8" />
      <line x1={cx - 115} y1={215} x2={cx} y2={255} stroke={towerStroke} strokeWidth="1.5" />
      <line x1={cx + 115} y1={215} x2={cx} y2={255} stroke={towerStroke} strokeWidth="1.5" />

      {/* Bottom Cross-Arm (y=295, width 280px) */}
      <line x1={cx - 140} y1={295} x2={cx + 140} y2={295} stroke={towerStroke} strokeWidth="3" />
      <line x1={cx - 140} y1={295} x2={cx} y2={255} stroke={towerStroke} strokeWidth="1.6" />
      <line x1={cx + 140} y1={295} x2={cx} y2={255} stroke={towerStroke} strokeWidth="1.6" />

      {/* Diagonal Lattice X-Bracing */}
      <line x1={cx - 16} y1={135} x2={cx + 16} y2={185} stroke={towerStroke} strokeWidth="1.4" />
      <line x1={cx + 16} y1={135} x2={cx - 16} y2={185} stroke={towerStroke} strokeWidth="1.4" />

      <line x1={cx - 22} y1={215} x2={cx + 22} y2={275} stroke={towerStroke} strokeWidth="1.5" />
      <line x1={cx + 22} y1={215} x2={cx - 22} y2={275} stroke={towerStroke} strokeWidth="1.5" />

      <line x1={cx - 28} y1={295} x2={cx + 28} y2={355} stroke={towerStroke} strokeWidth="1.6" />
      <line x1={cx + 28} y1={295} x2={cx - 28} y2={355} stroke={towerStroke} strokeWidth="1.6" />

      <line x1={cx - 34} y1={355} x2={cx + 34} y2={425} stroke={towerStroke} strokeWidth="1.7" />
      <line x1={cx + 34} y1={355} x2={cx - 34} y2={425} stroke={towerStroke} strokeWidth="1.7" />

      <line x1={cx - 40} y1={425} x2={cx + 40} y2={500} stroke={towerStroke} strokeWidth="1.8" />
      <line x1={cx + 40} y1={425} x2={cx - 40} y2={500} stroke={towerStroke} strokeWidth="1.8" />

      <line x1={cx - 47} y1={500} x2={cx + 47} y2={575} stroke={towerStroke} strokeWidth="2" />
      <line x1={cx + 47} y1={500} x2={cx - 47} y2={575} stroke={towerStroke} strokeWidth="2" />

      {/* Hanging Insulator Strings where cables physically attach */}
      <line x1={cx - 120} y1={135} x2={cx - 120} y2={165} stroke={towerStroke} strokeWidth="3.2" strokeDasharray="3 1" />
      <line x1={cx + 120} y1={135} x2={cx + 120} y2={165} stroke={towerStroke} strokeWidth="3.2" strokeDasharray="3 1" />
      <line x1={cx - 150} y1={215} x2={cx - 150} y2={245} stroke={towerStroke} strokeWidth="3.2" strokeDasharray="3 1" />
      <line x1={cx + 150} y1={215} x2={cx + 150} y2={245} stroke={towerStroke} strokeWidth="3.2" strokeDasharray="3 1" />
      <line x1={cx - 130} y1={295} x2={cx - 130} y2={325} stroke={towerStroke} strokeWidth="3.2" strokeDasharray="3 1" />
      <line x1={cx + 130} y1={295} x2={cx + 130} y2={325} stroke={towerStroke} strokeWidth="3.2" strokeDasharray="3 1" />
    </g>
  );

  // Generate uninterrupted, continuous catenary cables linking every single tower
  let skyWirePath = `M ${TOWER_X[0]} 35`;
  let topArmLeftPath = `M ${TOWER_X[0] - 120} 165`;
  let topArmRightPath = `M ${TOWER_X[0] + 120} 165`;
  let midArmLeftPath = `M ${TOWER_X[0] - 150} 245`;
  let midArmRightPath = `M ${TOWER_X[0] + 150} 245`;
  let botArmLeftPath = `M ${TOWER_X[0] - 130} 325`;
  let botArmRightPath = `M ${TOWER_X[0] + 130} 325`;

  for (let i = 0; i < TOWER_X.length - 1; i++) {
    const x1 = TOWER_X[i];
    const x2 = TOWER_X[i + 1];
    const midX = (x1 + x2) / 2;

    // Smooth physical catenary sag curves between tower pairs
    skyWirePath += ` Q ${midX} 85 ${x2} 35`;
    topArmLeftPath += ` Q ${midX - 120} 215 ${x2 - 120} 165`;
    topArmRightPath += ` Q ${midX + 120} 215 ${x2 + 120} 165`;
    midArmLeftPath += ` Q ${midX - 150} 315 ${x2 - 150} 245`;
    midArmRightPath += ` Q ${midX + 150} 315 ${x2 + 150} 245`;
    botArmLeftPath += ` Q ${midX - 130} 405 ${x2 - 130} 325`;
    botArmRightPath += ` Q ${midX + 130} 405 ${x2 + 130} 325`;
  }

  // Pre- and post-extensions spanning 1,200px beyond outermost towers
  const firstX = TOWER_X[0];
  const lastX = TOWER_X[TOWER_X.length - 1];

  return (
    <div
      className="powerlines-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* SVG stays permanently stationary covering 100% of the viewport from edge to edge */}
      <svg
        viewBox="-600 0 3200 700"
        preserveAspectRatio="xMidYBottom slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <defs>
          <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="electricFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={cableStroke} stopOpacity="0.45" />
            <stop offset="45%" stopColor={cableStroke} stopOpacity="0.8" />
            <stop offset="50%" stopColor={cablePulse} stopOpacity="1" />
            <stop offset="55%" stopColor={cableStroke} stopOpacity="0.8" />
            <stop offset="100%" stopColor={cableStroke} stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* The inner group moves to the right as you scroll, with towers & lines spanning far beyond all screen edges */}
        <g
          id="powerlines-corridor"
          transform={`translate(${moveRightX}, 0)`}
          style={{ transition: 'transform 0.1s linear' }}
        >
          {/* Continuous unbroken landscape horizon */}
          <path
            d="M -2200 620 Q -1000 590 0 625 T 1000 600 T 2000 625 T 3000 600 T 4200 625 L 4200 750 L -2200 750 Z"
            fill={landscapeFill}
          />

          {/* Connected Transmission Towers */}
          {TOWER_X.map((cx, idx) => renderTower(cx, idx))}

          {/* Endless Interconnected Transmission Cables with ZERO breaks */}
          <g id="catenary-cables">
            {/* Upper Sky Lightning Wire */}
            <path
              d={`M ${firstX - 1000} 10 Q ${firstX - 500} 70 ${firstX} 35 ${skyWirePath.slice(skyWirePath.indexOf('Q'))} Q ${lastX + 500} 70 ${lastX + 1000} 10`}
              stroke={cableStroke}
              strokeWidth="1.4"
              strokeDasharray="4 2"
              fill="none"
              opacity="0.75"
            />

            {/* Phase Conductor 1 (Top Left) */}
            <path
              d={`M ${firstX - 1000} 120 Q ${firstX - 500} 190 ${firstX - 120} 165 ${topArmLeftPath.slice(topArmLeftPath.indexOf('Q'))} Q ${lastX + 500} 190 ${lastX + 1000} 120`}
              stroke="url(#electricFlow)"
              strokeWidth="2.4"
              fill="none"
              filter="url(#wire-glow)"
            />

            {/* Phase Conductor 2 (Top Right) */}
            <path
              d={`M ${firstX - 1000} 110 Q ${firstX - 500} 190 ${firstX + 120} 165 ${topArmRightPath.slice(topArmRightPath.indexOf('Q'))} Q ${lastX + 500} 190 ${lastX + 1000} 110`}
              stroke={cableStroke}
              strokeWidth="2"
              fill="none"
            />

            {/* Phase Conductor 3 (Middle Left with Active Flow) */}
            <path
              d={`M ${firstX - 1000} 190 Q ${firstX - 500} 275 ${firstX - 150} 245 ${midArmLeftPath.slice(midArmLeftPath.indexOf('Q'))} Q ${lastX + 500} 275 ${lastX + 1000} 190`}
              stroke="url(#electricFlow)"
              strokeWidth="2.6"
              fill="none"
              filter="url(#wire-glow)"
            />

            {/* Phase Conductor 4 (Middle Right) */}
            <path
              d={`M ${firstX - 1000} 180 Q ${firstX - 500} 275 ${firstX + 150} 245 ${midArmRightPath.slice(midArmRightPath.indexOf('Q'))} Q ${lastX + 500} 275 ${lastX + 1000} 180`}
              stroke={cableStroke}
              strokeWidth="2"
              fill="none"
            />

            {/* Phase Conductor 5 (Bottom Left) */}
            <path
              d={`M ${firstX - 1000} 260 Q ${firstX - 500} 355 ${firstX - 130} 325 ${botArmLeftPath.slice(botArmLeftPath.indexOf('Q'))} Q ${lastX + 500} 355 ${lastX + 1000} 260`}
              stroke={cableStroke}
              strokeWidth="2.2"
              fill="none"
            />

            {/* Phase Conductor 6 (Bottom Right) */}
            <path
              d={`M ${firstX - 1000} 250 Q ${firstX - 500} 355 ${firstX + 130} 325 ${botArmRightPath.slice(botArmRightPath.indexOf('Q'))} Q ${lastX + 500} 355 ${lastX + 1000} 250`}
              stroke={cableStroke}
              strokeWidth="2.2"
              fill="none"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
