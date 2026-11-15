import React, { useState, useEffect } from 'react';

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
  lat: number;
  lon: number;
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

export interface UserDeviceLocation {
  lat: number;
  lon: number;
  x: number;
  y: number;
  accuracyMeters: number;
  nearestSubstation: GridSubstation;
  distanceKm: number;
  localEFieldMvKm: number;
  localRiskTier: 'NORMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL';
  timestamp: string;
  isWithinBounds: boolean;
}

interface InteractiveGridMapDiagramProps {
  substations?: GridSubstation[];
  exVkm?: number;
  eyVkm?: number;
  onSelectSubstation?: (substation: GridSubstation) => void;
}

const DEFAULT_SUBSTATIONS: GridSubstation[] = [
  { id: 'KOEBERG', name: 'Koeberg Nuclear Hub', x: 190, y: 395, voltageKv: 400, neutralGicAmps: 18.5, qLossMvar: 5.2, riskTier: 'ADVISORY', province: 'Western Cape', utility: 'Eskom', rgOhms: 0.12, lat: -33.67, lon: 18.43 },
  { id: 'HYDRA', name: 'Hydra Main Pivot', x: 380, y: 320, voltageKv: 765, neutralGicAmps: 26.8, qLossMvar: 9.8, riskTier: 'CRITICAL', province: 'Northern Cape', utility: 'Eskom', rgOhms: 0.08, lat: -30.71, lon: 24.00 },
  { id: 'ARIES', name: 'Aries Substation', x: 260, y: 280, voltageKv: 400, neutralGicAmps: 14.1, qLossMvar: 4.5, riskTier: 'WATCH', province: 'Northern Cape', utility: 'Eskom', rgOhms: 0.15, lat: -29.49, lon: 20.79 },
  { id: 'PERSEUS', name: 'Perseus Central Pivot', x: 470, y: 230, voltageKv: 765, neutralGicAmps: 22.4, qLossMvar: 8.2, riskTier: 'WATCH', province: 'Free State', utility: 'Eskom', rgOhms: 0.09, lat: -28.39, lon: 26.24 },
  { id: 'BETA', name: 'Beta Trans-Karoo', x: 440, y: 250, voltageKv: 765, neutralGicAmps: 8.3, qLossMvar: 3.0, riskTier: 'NORMAL', province: 'Free State', utility: 'Eskom', rgOhms: 0.11, lat: -28.91, lon: 25.56 },
  { id: 'MAJUBA', name: 'Majuba Generation Hub', x: 580, y: 195, voltageKv: 765, neutralGicAmps: 12.1, qLossMvar: 4.4, riskTier: 'ADVISORY', province: 'Mpumalanga', utility: 'Eskom', rgOhms: 0.10, lat: -27.09, lon: 29.77 },
  { id: 'TUTUKA', name: 'Tutuka Power Station', x: 570, y: 175, voltageKv: 400, neutralGicAmps: 9.5, qLossMvar: 3.6, riskTier: 'NORMAL', province: 'Mpumalanga', utility: 'Eskom', rgOhms: 0.14, lat: -26.77, lon: 29.35 },
  { id: 'KENDAL', name: 'Kendal Baseload Hub', x: 550, y: 155, voltageKv: 400, neutralGicAmps: 11.2, qLossMvar: 4.0, riskTier: 'ADVISORY', province: 'Mpumalanga', utility: 'Eskom', rgOhms: 0.12, lat: -26.09, lon: 28.97 },
  { id: 'APOLLO', name: 'Apollo HVDC Converter', x: 535, y: 135, voltageKv: 533, neutralGicAmps: 15.6, qLossMvar: 6.1, riskTier: 'WATCH', province: 'Gauteng', utility: 'Eskom', rgOhms: 0.07, lat: -25.92, lon: 28.28 },
  { id: 'MATIMBA', name: 'Matimba Super-Critical', x: 505, y: 75, voltageKv: 400, neutralGicAmps: 7.2, qLossMvar: 2.8, riskTier: 'NORMAL', province: 'Limpopo', utility: 'Eskom', rgOhms: 0.16, lat: -23.66, lon: 27.61 },
  { id: 'SONGO', name: 'Songo (Cahora Bassa)', x: 710, y: 40, voltageKv: 533, neutralGicAmps: 19.4, qLossMvar: 7.4, riskTier: 'WATCH', province: 'Tete (Mozambique)', utility: 'HCB', rgOhms: 0.08, lat: -15.61, lon: 32.77 },
  { id: 'AUAS', name: 'Auas Interconnector', x: 130, y: 160, voltageKv: 400, neutralGicAmps: 16.2, qLossMvar: 6.2, riskTier: 'WATCH', province: 'Windhoek (Namibia)', utility: 'NamPower', rgOhms: 0.13, lat: -22.56, lon: 17.15 },
  { id: 'PHOKOJE', name: 'Phokoje Cross-Border', x: 440, y: 120, voltageKv: 400, neutralGicAmps: 14.8, qLossMvar: 5.6, riskTier: 'WATCH', province: 'Selebi-Phikwe (Botswana)', utility: 'BPC', rgOhms: 0.14, lat: -21.98, lon: 27.84 },
  { id: 'INSUKAMINI', name: 'Insukamini Pivot', x: 560, y: 60, voltageKv: 400, neutralGicAmps: 12.5, qLossMvar: 4.8, riskTier: 'WATCH', province: 'Bulawayo (Zimbabwe)', utility: 'ZETDC', rgOhms: 0.15, lat: -20.14, lon: 28.53 }
];

const GRID_LINES: GridLine[] = [
  { id: 'L1', from: 'MAJUBA', to: 'PERSEUS', voltageKv: 765, lengthKm: 320, currentAmps: 1420, type: '765kv' },
  { id: 'L2', from: 'PERSEUS', to: 'BETA', voltageKv: 765, lengthKm: 48, currentAmps: 1210, type: '765kv' },
  { id: 'L3', from: 'BETA', to: 'HYDRA', voltageKv: 765, lengthKm: 290, currentAmps: 1530, type: '765kv' },
  { id: 'L4', from: 'PERSEUS', to: 'HYDRA', voltageKv: 765, lengthKm: 310, currentAmps: 1480, type: '765kv' },
  { id: 'L5', from: 'HYDRA', to: 'KOEBERG', voltageKv: 400, lengthKm: 680, currentAmps: 920, type: '400kv' },
  { id: 'L6', from: 'HYDRA', to: 'ARIES', voltageKv: 400, lengthKm: 240, currentAmps: 640, type: '400kv' },
  { id: 'L7', from: 'ARIES', to: 'AUAS', voltageKv: 400, lengthKm: 780, currentAmps: 450, type: '400kv' },
  { id: 'L8', from: 'KENDAL', to: 'TUTUKA', voltageKv: 400, lengthKm: 95, currentAmps: 1100, type: '400kv' },
  { id: 'L9', from: 'TUTUKA', to: 'MAJUBA', voltageKv: 400, lengthKm: 65, currentAmps: 1180, type: '400kv' },
  { id: 'L10', from: 'KENDAL', to: 'APOLLO', voltageKv: 400, lengthKm: 85, currentAmps: 1250, type: '400kv' },
  { id: 'L11', from: 'APOLLO', to: 'MATIMBA', voltageKv: 400, lengthKm: 340, currentAmps: 980, type: '400kv' },
  { id: 'L12', from: 'MATIMBA', to: 'PHOKOJE', voltageKv: 400, lengthKm: 210, currentAmps: 520, type: '400kv' },
  { id: 'L13', from: 'PHOKOJE', to: 'INSUKAMINI', voltageKv: 400, lengthKm: 380, currentAmps: 480, type: '400kv' },
  { id: 'L14', from: 'SONGO', to: 'APOLLO', voltageKv: 533, lengthKm: 1420, currentAmps: 1850, type: 'hvdc' }
];

// Haversine distance calculator in kilometers
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function InteractiveGridMapDiagram({
  substations = DEFAULT_SUBSTATIONS,
  exVkm = 0.12,
  eyVkm = -0.08,
  onSelectSubstation
}: InteractiveGridMapDiagramProps): JSX.Element {
  const [selected, setSelected] = useState<GridSubstation>(substations[1] || DEFAULT_SUBSTATIONS[1]); // Default Hydra
  const [activeLayer, setActiveLayer] = useState<'all' | '765kv' | '400kv' | 'hvdc'>('all');
  const [showConductivityLayer, setShowConductivityLayer] = useState<boolean>(true);
  const [pulsePhase, setPulsePhase] = useState<number>(0);

  // Live User Device Location Tracking
  const [userLocation, setUserLocation] = useState<UserDeviceLocation | null>(null);
  const [geoStatus, setGeoStatus] = useState<'IDLE' | 'ACQUIRING' | 'LOCKED' | 'DENIED' | 'UNSUPPORTED'>('IDLE');
  const [geoError, setGeoError] = useState<string>('');

  // Continuous power flow animation
  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // Compute geoelectric field vector angle and magnitude
  const eMag = Math.sqrt(exVkm * exVkm + eyVkm * eyVkm);
  const eAngleDeg = (Math.atan2(eyVkm, exVkm) * 180) / Math.PI;

  // Real-time device geolocation acquisition
  const requestDeviceLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoStatus('UNSUPPORTED');
      setGeoError('HTML5 Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('ACQUIRING');
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy || 25.0;

        // Map lat/lon to SVG (800 x 450)
        // SAPP grid domain: Lon 12.0°E to 36.0°E, Lat -35.0°S to -15.0°S
        const minLon = 12.0;
        const maxLon = 36.0;
        const minLat = -35.0; // Southern Cape
        const maxLat = -15.0; // Zambezi / Cahora

        const svgX = ((lon - minLon) / (maxLon - minLon)) * 620 + 90;
        const svgY = ((lat - maxLat) / (minLat - maxLat)) * 370 + 40;

        const isWithin = lon >= 10.0 && lon <= 38.0 && lat <= -14.0 && lat >= -36.0;
        const clampedX = Math.max(30, Math.min(770, svgX));
        const clampedY = Math.max(30, Math.min(420, svgY));

        // Find nearest substation to user's device
        let nearest = substations[0];
        let minDist = Infinity;
        substations.forEach(sub => {
          const d = calculateHaversineKm(lat, lon, sub.lat, sub.lon);
          if (d < minDist) {
            minDist = d;
            nearest = sub;
          }
        });

        // Compute local induced field
        const localEField = Math.round(eMag * 1000 * (minDist < 150 ? 1.4 : 1.0));
        const localTier: 'NORMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL' =
          localEField > 500 ? 'CRITICAL' : localEField > 250 ? 'WATCH' : localEField > 100 ? 'ADVISORY' : 'NORMAL';

        const locationData: UserDeviceLocation = {
          lat,
          lon,
          x: clampedX,
          y: clampedY,
          accuracyMeters: accuracy,
          nearestSubstation: nearest,
          distanceKm: Math.round(minDist * 10) / 10,
          localEFieldMvKm: localEField,
          localRiskTier: localTier,
          timestamp: new Date().toLocaleTimeString(),
          isWithinBounds: isWithin
        };

        setUserLocation(locationData);
        setGeoStatus('LOCKED');
      },
      error => {
        setGeoStatus('DENIED');
        setGeoError(error.message || 'Permission denied for device location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // Auto-acquire device location on initial load
  useEffect(() => {
    requestDeviceLocation();
  }, []);

  const handleSelect = (sub: GridSubstation) => {
    setSelected(sub);
    if (onSelectSubstation) onSelectSubstation(sub);
  };

  const getSubstationColor = (tier: string) => {
    switch (tier) {
      case 'CRITICAL': return '#dc2626'; // Vivid Dark Red
      case 'WATCH': return '#f59e0b';    // Amber/Gold
      case 'ADVISORY': return '#38bdf8'; // Electric Cyan
      default: return '#10b981';         // Emerald Green
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
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
      overflow: 'hidden'
    }}>
      {/* Tactical SCADA Control Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Title & Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-block',
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <strong style={{ fontSize: '0.88rem', color: '#0f172a', letterSpacing: '0.01em' }}>
            SAPP SYNCHRONOUS TRANSMISSION GRID & SADC CORRIDORS
          </strong>
          <span style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            fontFamily: 'monospace'
          }}>
            765kV / 400kV / ±533kV HVDC
          </span>
        </div>

        {/* Action Controls: Live GPS Detector & Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Real-Time Device Location GPS Button with SVG Icon */}
          <button
            onClick={requestDeviceLocation}
            title="Detect live GPS coordinates from this computer or mobile device"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '6px',
              border: geoStatus === 'LOCKED' ? '1px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: geoStatus === 'LOCKED' ? '#f0f9ff' : '#ffffff',
              color: geoStatus === 'LOCKED' ? '#0284c7' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {geoStatus === 'LOCKED' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            ) : geoStatus === 'ACQUIRING' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
                <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="22" y1="12" x2="18" y2="12" />
                <line x1="6" y1="12" x2="2" y2="12" />
                <line x1="12" y1="6" x2="12" y2="2" />
                <line x1="12" y1="22" x2="12" y2="18" />
              </svg>
            )}
            <span>
              {geoStatus === 'LOCKED' && userLocation
                ? `Device GPS: ${userLocation.lat.toFixed(2)}°, ${userLocation.lon.toFixed(2)}° (±${userLocation.accuracyMeters.toFixed(0)}m)`
                : geoStatus === 'ACQUIRING'
                ? 'Acquiring Device GPS...'
                : 'Detect My Location'}
            </span>
          </button>

          {/* Subsurface Conductivity Layer Toggle */}
          <button
            onClick={() => setShowConductivityLayer(s => !s)}
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: showConductivityLayer ? '#faf5ff' : '#ffffff',
              color: showConductivityLayer ? '#7e22ce' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Lithosphere ρ(Ω·m)
          </button>

          {/* Voltage Corridor Filters */}
          <div style={{ display: 'flex', gap: '3px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
            {(['all', '765kv', '400kv', 'hvdc'] as const).map(layer => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: activeLayer === layer ? '#0f172a' : 'transparent',
                  color: activeLayer === layer ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {layer === 'all' ? 'All' : layer === '765kv' ? '765 kV' : layer === '400kv' ? '400 kV' : 'HVDC'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Vector Interactive Canvas & Inspector Split View */}
      <div style={{ display: 'flex', flexWrap: 'wrap', position: 'relative', width: '100%', minHeight: '430px' }}>
        {/* Vector SVG Map Container (Crisp Clean White/Light Slate) */}
        <div style={{ flex: '1 1 540px', minWidth: '320px', position: 'relative', backgroundColor: '#ffffff', overflow: 'hidden' }}>
          <svg
            viewBox="0 0 800 450"
            style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
          >
            <defs>
              {/* Glow Filters for Glowing Transmission Sparks and Radar */}
              <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="radar-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Kaapvaal Craton Resistive Heatmap Gradient */}
              <radialGradient id="craton-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.18" />
                <stop offset="60%" stopColor="#7e22ce" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.0" />
              </radialGradient>

              {/* Karoo Conductive Basin Gradient */}
              <radialGradient id="karoo-gradient" cx="45%" cy="55%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="70%" stopColor="#0369a1" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Latitude / Longitude Geodesic Grid (Subtle Light Slate) */}
            <g opacity="0.4" stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="3 4">
              {/* Latitudes */}
              <line x1="30" y1="80" x2="770" y2="80" />
              <text x="35" y="76" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">20°S</text>

              <line x1="30" y1="180" x2="770" y2="180" />
              <text x="35" y="176" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">25°S</text>

              <line x1="30" y1="280" x2="770" y2="280" />
              <text x="35" y="276" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">30°S</text>

              <line x1="30" y1="380" x2="770" y2="380" />
              <text x="35" y="376" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">35°S</text>

              {/* Longitudes */}
              <line x1="130" y1="30" x2="130" y2="420" />
              <text x="134" y="415" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">15°E</text>

              <line x1="260" y1="30" x2="260" y2="420" />
              <text x="264" y="415" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">20°E</text>

              <line x1="470" y1="30" x2="470" y2="420" />
              <text x="474" y="415" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">25°E</text>

              <line x1="620" y1="30" x2="620" y2="420" />
              <text x="624" y="415" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">30°E</text>
            </g>

            {/* Subsurface Lithospheric Geology Overlays */}
            {showConductivityLayer && (
              <g>
                {/* Kaapvaal Craton Shield (Resistive Core: >5,000 Ohm-m) */}
                <ellipse cx="500" cy="180" rx="140" ry="90" fill="url(#craton-gradient)" />
                <path
                  d="M 400 130 C 470 100, 580 120, 630 190 C 600 240, 480 250, 410 220 Z"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <text x="500" y="165" fill="#7e22ce" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  KAAPVAAL CRATON SHIELD (ρ &gt; 5,000 Ω·m)
                </text>

                {/* Karoo Conductive Sedimentary Basin (ρ ~ 50-200 Ohm-m) */}
                <ellipse cx="360" cy="320" rx="130" ry="70" fill="url(#karoo-gradient)" />
                <text x="360" y="340" fill="#0284c7" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  KAROO BASIN SEDIMENTS (ρ ~ 120 Ω·m)
                </text>
              </g>
            )}

            {/* Southern African Continental Landmass Background (Clean Architectural Slate) */}
            <path
              d="M 120 140 L 260 170 L 410 110 L 450 60 L 580 40 L 730 35 L 750 90 L 640 180 L 620 280 L 520 380 L 370 410 L 240 420 L 170 390 L 110 240 Z"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.6"
            />

            {/* High-Voltage Transmission Corridors (Glowing Vibrant Lines on Clean Background) */}
            {filteredLines.map(line => {
              const fromSub = substations.find(s => s.id === line.from);
              const toSub = substations.find(s => s.id === line.to);
              if (!fromSub || !toSub) return null;

              const is765 = line.type === '765kv';
              const isHvdc = line.type === 'hvdc';
              const strokeColor = is765 ? '#dc2626' : isHvdc ? '#059669' : '#0284c7';
              const strokeWidth = is765 ? 3.0 : isHvdc ? 2.4 : 2.0;

              return (
                <g key={line.id}>
                  {/* Glowing Underlay */}
                  <line
                    x1={fromSub.x}
                    y1={fromSub.y}
                    x2={toSub.x}
                    y2={toSub.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth + 4}
                    opacity="0.3"
                    strokeLinecap="round"
                    filter="url(#corridor-glow)"
                  />
                  {/* Core Line */}
                  <line
                    x1={fromSub.x}
                    y1={fromSub.y}
                    x2={toSub.x}
                    y2={toSub.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={isHvdc ? '8 4' : undefined}
                  />
                  {/* Dynamic Energy Flow Pulse Packets */}
                  <line
                    x1={fromSub.x}
                    y1={fromSub.y}
                    x2={toSub.x}
                    y2={toSub.y}
                    stroke="#ffffff"
                    strokeWidth={strokeWidth * 0.75}
                    strokeDasharray="6 36"
                    strokeDashoffset={-pulsePhase * 3}
                    opacity="0.9"
                  />
                </g>
              );
            })}

            {/* Substation Nodes */}
            {substations.map(sub => {
              const isSelected = selected?.id === sub.id;
              const color = getSubstationColor(sub.riskTier);
              const radius = sub.voltageKv === 765 ? 8 : sub.voltageKv === 533 ? 7 : 6;

              return (
                <g
                  key={sub.id}
                  onClick={() => handleSelect(sub)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer Pulsing Halo when Critical or Selected */}
                  {(isSelected || sub.riskTier === 'CRITICAL') && (
                    <circle
                      cx={sub.x}
                      cy={sub.y}
                      r={radius + 6}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.75"
                    >
                      <animate attributeName="r" from={radius + 3} to={radius + 10} dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Transformer Substation Double-Ring Symbol */}
                  <circle
                    cx={sub.x}
                    cy={sub.y}
                    r={radius}
                    fill="#ffffff"
                    stroke={color}
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={sub.x}
                    cy={sub.y}
                    r={radius * 0.45}
                    fill={color}
                  />

                  {/* Substation Name Label */}
                  <text
                    x={sub.x}
                    y={sub.y - radius - 5}
                    fill="#0f172a"
                    fontSize={isSelected ? '9.5' : '8'}
                    fontWeight={isSelected ? '800' : '600'}
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {sub.id}
                  </text>

                  {/* Neutral GIC Badge */}
                  <text
                    x={sub.x}
                    y={sub.y + radius + 11}
                    fill={Math.abs(sub.neutralGicAmps) > 20 ? '#dc2626' : '#64748b'}
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

            {/* =========================================================================
                GLOWING LIVE USER DEVICE LOCATION RADAR PING (HIGH-CONTRAST)
                ========================================================================= */}
            {userLocation && (
              <g id="live-device-radar" transform={`translate(${userLocation.x}, ${userLocation.y})`}>
                {/* 1. Geodesic Connection Line to Nearest Substation */}
                <line
                  x1="0"
                  y1="0"
                  x2={userLocation.nearestSubstation.x - userLocation.x}
                  y2={userLocation.nearestSubstation.y - userLocation.y}
                  stroke="#0284c7"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />

                {/* 2. Expanding Glowing Sonar Rings */}
                <circle r="36" fill="none" stroke="#0284c7" strokeWidth="1.8" opacity="0.3">
                  <animate attributeName="r" from="8" to="44" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle r="22" fill="none" stroke="#0ea5e9" strokeWidth="1.4" opacity="0.5">
                  <animate attributeName="r" from="8" to="30" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" />
                </circle>

                {/* 3. Tactical Target Reticle (Cyan Crosshairs) */}
                <circle r="8" fill="none" stroke="#0284c7" strokeWidth="2" />
                <line x1="-12" y1="0" x2="-4" y2="0" stroke="#0284c7" strokeWidth="1.8" />
                <line x1="4" y1="0" x2="12" y2="0" stroke="#0284c7" strokeWidth="1.8" />
                <line x1="0" y1="-12" x2="0" y2="-4" stroke="#0284c7" strokeWidth="1.8" />
                <line x1="0" y1="4" x2="0" y2="12" stroke="#0284c7" strokeWidth="1.8" />

                {/* 4. Glowing Center Beacon Core */}
                <circle r="4.5" fill="#0284c7" filter="url(#radar-glow)" />

                {/* 5. Live Tactical Callout Tag (Clean Crisp White Badge) */}
                <g transform="translate(14, -28)">
                  <rect
                    width="175"
                    height="32"
                    rx="5"
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="1.4"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
                  />
                  <text x="8" y="13" fill="#0284c7" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    GPS LOCKED: YOUR LOCATION
                  </text>
                  <text x="8" y="24" fill="#475569" fontSize="7" fontFamily="monospace">
                    {userLocation.distanceKm} km to {userLocation.nearestSubstation.name}
                  </text>
                </g>
              </g>
            )}
          </svg>

          {/* Compass & Induced Geoelectric Field Vector Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#0f172a',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.06)'
          }}>
            {/* Polar Compass */}
            <svg width="44" height="44" viewBox="-22 -22 44 44">
              <circle r="20" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
              <circle r="14" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2 2" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2 2" />
              <text x="0" y="-12" fill="#0284c7" fontSize="7" textAnchor="middle" fontWeight="bold">N</text>
              <text x="14" y="2" fill="#64748b" fontSize="6.5" textAnchor="middle">E</text>

              {/* Dynamic Induced E-Field Vector Arrow */}
              <g transform={`rotate(${eAngleDeg})`}>
                <line
                  x1="0"
                  y1="0"
                  x2={Math.min(18, Math.max(9, eMag * 90))}
                  y2="0"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <polygon
                  points={`${Math.min(18, Math.max(9, eMag * 90)) + 4},0 ${Math.min(18, Math.max(9, eMag * 90)) - 3},-3 ${Math.min(18, Math.max(9, eMag * 90)) - 3},3`}
                  fill="#dc2626"
                />
              </g>
            </svg>

            <div>
              <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                Induced E-Field Tensor
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                |E| = {eMag.toFixed(3)} V/km
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                Ex: <span style={{ color: '#dc2626' }}>{exVkm > 0 ? `+${exVkm}` : exVkm}</span> &bull; Ey: <span style={{ color: '#0284c7' }}>{eyVkm > 0 ? `+${eyVkm}` : eyVkm}</span>
              </div>
            </div>
          </div>

          {/* Map Corridor Legend */}
          <div style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            fontSize: '0.72rem',
            color: '#475569',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '3px', backgroundColor: '#dc2626', borderRadius: '1px', boxShadow: '0 0 6px #dc2626' }} />
              <span style={{ color: '#0f172a', fontWeight: 600 }}>765 kV Super-Grid</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '2.5px', backgroundColor: '#0284c7', borderRadius: '1px' }} />
              <span style={{ color: '#475569' }}>400 kV Transmission</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '14px', height: '2.5px', backgroundColor: '#059669', borderRadius: '1px' }} />
              <span style={{ color: '#475569' }}>±533 kV HVDC Link</span>
            </div>
            {userLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '2px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7', boxShadow: '0 0 8px #0284c7' }} />
                <span style={{ color: '#0284c7', fontWeight: 700 }}>Your Device Location</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Tactical Inspector & Live Substation Telemetry (Clean White Theme) */}
        <div style={{
          flex: '0 0 280px',
          padding: '18px',
          borderLeft: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px',
          color: '#0f172a'
        }}>
          <div>
            {/* Live Substation Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: selected.riskTier === 'CRITICAL' ? '#fef2f2' : selected.riskTier === 'WATCH' ? '#fffbeb' : '#ecfdf5',
                color: selected.riskTier === 'CRITICAL' ? '#dc2626' : selected.riskTier === 'WATCH' ? '#d97706' : '#059669',
                border: `1px solid ${selected.riskTier === 'CRITICAL' ? '#fecaca' : selected.riskTier === 'WATCH' ? '#fde68a' : '#a7f3d0'}`
              }}>
                {selected.riskTier} STATE
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{selected.voltageKv} kV Corridor</span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {selected.name}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '16px' }}>
              {selected.province} &bull; {selected.utility}
            </div>

            {/* Substation Metric Gauges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Neutral GIC Gauge */}
              <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
                  <span>Neutral GIC Current:</span>
                  <strong style={{
                    color: Math.abs(selected.neutralGicAmps) > 20 ? '#dc2626' : '#0f172a',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}>
                    {selected.neutralGicAmps} A
                  </strong>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (Math.abs(selected.neutralGicAmps) / 35) * 100)}%`,
                    height: '100%',
                    backgroundColor: Math.abs(selected.neutralGicAmps) > 20 ? '#dc2626' : '#f59e0b',
                    boxShadow: Math.abs(selected.neutralGicAmps) > 20 ? '0 0 8px #dc2626' : 'none',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>

              {/* Reactive Loss (Q_loss) */}
              <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
                  <span>Reactive Deficit (Q_loss):</span>
                  <strong style={{ color: '#0284c7', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {selected.qLossMvar} MVAR
                  </strong>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (selected.qLossMvar / 15) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#0284c7',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>

              {/* Grounding Impedance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Earth Mat Resistance (Rg):</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{selected.rgOhms} Ω</span>
              </div>

              {/* Transformer Top-Oil Rise */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Estimated ΔT Hotspot:</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: selected.neutralGicAmps > 20 ? '#dc2626' : '#059669'
                }}>
                  +{(selected.neutralGicAmps * 1.8).toFixed(1)} °C
                </span>
              </div>
            </div>

            {/* User Device Telemetry Box (If Located - Crisp Light Badge) */}
            {userLocation && (
              <div style={{
                marginTop: '14px',
                padding: '10px 12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #bae6fd',
                color: '#0369a1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', marginBottom: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>YOUR DEVICE LOCAL TELEMETRY</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#475569', lineHeight: 1.45 }}>
                  <div>GPS: <strong>{userLocation.lat.toFixed(4)}°, {userLocation.lon.toFixed(4)}°</strong></div>
                  <div>Nearest Grid: <strong>{userLocation.nearestSubstation.name}</strong> ({userLocation.distanceKm} km)</div>
                  <div>Estimated E-Field: <strong style={{ color: '#0284c7' }}>{userLocation.localEFieldMvKm} mV/km</strong></div>
                </div>
              </div>
            )}
          </div>

          <div style={{
            fontSize: '0.7rem',
            color: '#475569',
            lineHeight: 1.45,
            padding: '10px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 700, color: '#0f172a' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Mitigation Protocol</span>
            </div>
            When neutral current exceeds 20A, initiate automatic tertiary-winding capacitor bank insertion to shield 765kV transformers from half-cycle saturation.
          </div>
        </div>
      </div>
    </div>
  );
}
