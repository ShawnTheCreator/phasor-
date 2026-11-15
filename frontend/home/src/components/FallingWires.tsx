import React, { useEffect, useState } from 'react';

export default function FallingWires(): JSX.Element {
  const [hasFallen, setHasFallen] = useState<boolean>(false);

  useEffect(() => {
    // Trigger drop-down animation on mount / section view
    const timer = setTimeout(() => setHasFallen(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`falling-wires-container ${hasFallen ? 'wires-fallen' : ''}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1600 360"
        preserveAspectRatio="xMidYTop meet"
        className="falling-wires-svg"
      >
        <defs>
          {/* Spark glow filter */}
          <filter id="spark-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Copper cable gradient */}
          <linearGradient id="cableGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#334155" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="cableGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#334155" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* =====================================================================
            LEFT FALLING CABLE CLUSTER (Severed transmission lines)
            ===================================================================== */}
        <g className="wire-cluster-left">
          {/* Snapped Cable 1 - Longest */}
          <path
            d="M -30 -20 C 30 90, 60 180, 95 280"
            stroke="url(#cableGradLeft)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Snapped Cable 2 - Middle */}
          <path
            d="M 10 -20 C 70 80, 110 160, 145 235"
            stroke="url(#cableGradLeft)"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Snapped Cable 3 - Shortest */}
          <path
            d="M 50 -20 C 110 70, 160 130, 205 180"
            stroke="url(#cableGradLeft)"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Insulator Fragment */}
          <rect x="80" y="140" width="14" height="24" rx="3" fill="#64748b" transform="rotate(18, 80, 140)" />

          {/* Electric Arcing Sparks at Cable 1 Tip */}
          <g transform="translate(95, 280)" filter="url(#spark-glow)">
            <circle cx="0" cy="0" r="4" fill="#38bdf8" className="spark-burst-1" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
            <line x1="0" y1="0" x2="-8" y2="10" stroke="#60a5fa" strokeWidth="1.5" className="spark-line-1" />
            <line x1="0" y1="0" x2="10" y2="6" stroke="#f59e0b" strokeWidth="1.2" className="spark-line-2" />
            <line x1="0" y1="0" x2="-4" y2="-8" stroke="#ef4444" strokeWidth="1.2" className="spark-line-3" />
          </g>

          {/* Electric Arcing Sparks at Cable 2 Tip */}
          <g transform="translate(145, 235)" filter="url(#spark-glow)">
            <circle cx="0" cy="0" r="3.5" fill="#f59e0b" className="spark-burst-2" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            <line x1="0" y1="0" x2="8" y2="8" stroke="#f97316" strokeWidth="1.2" className="spark-line-1" />
            <line x1="0" y1="0" x2="-6" y2="6" stroke="#38bdf8" strokeWidth="1.2" className="spark-line-2" />
          </g>
        </g>

        {/* =====================================================================
            RIGHT FALLING CABLE CLUSTER (Severed transmission lines)
            ===================================================================== */}
        <g className="wire-cluster-right">
          {/* Snapped Cable 1 - Longest */}
          <path
            d="M 1630 -20 C 1570 90, 1540 180, 1505 280"
            stroke="url(#cableGradRight)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Snapped Cable 2 - Middle */}
          <path
            d="M 1590 -20 C 1530 80, 1490 160, 1455 235"
            stroke="url(#cableGradRight)"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Snapped Cable 3 - Shortest */}
          <path
            d="M 1550 -20 C 1490 70, 1440 130, 1395 180"
            stroke="url(#cableGradRight)"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Insulator Fragment */}
          <rect x="1510" y="140" width="14" height="24" rx="3" fill="#64748b" transform="rotate(-18, 1510, 140)" />

          {/* Electric Arcing Sparks at Right Cable 1 Tip */}
          <g transform="translate(1505, 280)" filter="url(#spark-glow)">
            <circle cx="0" cy="0" r="4" fill="#38bdf8" className="spark-burst-1" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
            <line x1="0" y1="0" x2="8" y2="10" stroke="#60a5fa" strokeWidth="1.5" className="spark-line-1" />
            <line x1="0" y1="0" x2="-10" y2="6" stroke="#ef4444" strokeWidth="1.2" className="spark-line-2" />
            <line x1="0" y1="0" x2="4" y2="-8" stroke="#f59e0b" strokeWidth="1.2" className="spark-line-3" />
          </g>

          {/* Electric Arcing Sparks at Right Cable 2 Tip */}
          <g transform="translate(1455, 235)" filter="url(#spark-glow)">
            <circle cx="0" cy="0" r="3.5" fill="#f59e0b" className="spark-burst-2" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
            <line x1="0" y1="0" x2="-8" y2="8" stroke="#f97316" strokeWidth="1.2" className="spark-line-1" />
            <line x1="0" y1="0" x2="6" y2="6" stroke="#38bdf8" strokeWidth="1.2" className="spark-line-2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
