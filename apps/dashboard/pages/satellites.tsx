import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../lib/config';

interface DecayPoint {
  day: number;
  altitude_km: number;
  cumulative_drop_m: number;
}

interface LeoSatellite {
  id: string;
  name: string;
  operator: string;
  norad_id: number;
  nominal_altitude_km: number;
  seven_day_altitude_loss_m: number;
  mission: string;
  decay_curve: DecayPoint[];
  requires_orbit_raise: boolean;
}

interface RollingDay {
  day: number;
  date: string;
  f107_sfu: number;
  kp: number;
  ap: number;
  tier: string;
  color: string;
}

interface SatelliteResponse {
  timestamp: string;
  thermospheric_density_factor: number;
  conjunction_bubble_km: number;
  bubble_status: string;
  bubble_advisory: string;
  rolling_14_day_forecast: RollingDay[];
  satellites: LeoSatellite[];
}

export default function SatellitesPage(): JSX.Element {
  const [data, setData] = useState<SatelliteResponse | null>(null);
  const [modalMsg, setModalMsg] = useState<{ title: string; text: string } | null>(null);

  useEffect(() => {
    const loadDrag = async (): Promise<void> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/satellites/drag`);
        if (res.ok) {
          const d: SatelliteResponse = await res.json();
          setData(d);
        }
      } catch (err) {
        console.warn('Satellite Drag API fallback:', err);
      }
    };
    loadDrag();
    const interval = setInterval(loadDrag, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main-wrapper">
        <header className="top-nav">
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
            Satellite Drag & Orbital Decay Forecaster (NRLMSISE-00 + SGP4)
          </div>

          <div className="top-nav-right">
            <div className="btn-outline" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
              <span className="color-dot" style={{ backgroundColor: '#991b1b', display: 'inline-block' }}></span>
              <span>Density Factor: <strong>{data?.thermospheric_density_factor ?? 4.2}x</strong></span>
            </div>

            <button
              onClick={() => setModalMsg({
                title: "Collision Avoidance Conjunction Bubble Adjusted",
                text: `Conjunction assessment safety screening bubble widened from 1.0 km to ${data?.conjunction_bubble_km ?? 3.5} km. Space-Track ephemeris updated to compensate for solar storm thermospheric expansion.`
              })}
              className="btn-red-primary"
            >
              <span>+ Conjunction Bubble (3.5 km)</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          <section className="greeting-header">
            <div>
              <div className="date-label">SADC Operational Picture 5 &bull; Satellite Operators & Constellation Safety</div>
              <h1 className="greeting-title">Thermospheric Swelling & Orbital Drag Risk</h1>
              <div className="stat-pills-row">
                <div className="stat-pill">
                  <span>Conjunction Bubble: <strong style={{ color: '#991b1b' }}>{data?.conjunction_bubble_km ?? 3.5} km Radius</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Thermospheric Density: <strong style={{ color: '#991b1b' }}>+{((data?.thermospheric_density_factor ?? 4.2) - 1.0) * 100 | 0}% Expansion</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Orbit-Raise Threshold: <strong style={{ color: '#d97706' }}>&gt; 350m 7-day Decay</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* Monitored LEO Satellite Fleet Table */}
          <section className="content-card">
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                <span>Monitored LEO Fleet (African Satellites & Key Constellations)</span>
              </h2>
            </div>

            <table className="projects-table">
              <thead>
                <tr>
                  <th>Satellite Name</th>
                  <th>Operator & NORAD</th>
                  <th>Nominal Altitude</th>
                  <th>Predicted 7-Day Loss</th>
                  <th>Mission Purpose</th>
                  <th>Action Needed</th>
                </tr>
              </thead>
              <tbody>
                {(data?.satellites || [
                  { id: '1', name: 'ZACube-2 (Nanosatellite)', operator: 'SANSA / CPUT', norad_id: 43907, nominal_altitude_km: 490, seven_day_altitude_loss_m: 412.5, mission: 'Marine AIS & Fire Tracking', requires_orbit_raise: true },
                  { id: '2', name: 'EOSAT-1 (Earth Observation)', operator: 'SANSA', norad_id: 98412, nominal_altitude_km: 520, seven_day_altitude_loss_m: 248.0, mission: 'Agriculture & Drought Mapping', requires_orbit_raise: false },
                  { id: '3', name: 'Starlink-3129', operator: 'SpaceX', norad_id: 51920, nominal_altitude_km: 540, seven_day_altitude_loss_m: 198.5, mission: 'LEO High-Speed Internet', requires_orbit_raise: false },
                  { id: '4', name: 'International Space Station (ISS)', operator: 'NASA / International', norad_id: 25544, nominal_altitude_km: 418, seven_day_altitude_loss_m: 680.0, mission: 'Crewed Laboratory', requires_orbit_raise: true },
                ]).map((sat) => (
                  <tr key={sat.id}>
                    <td><strong>{sat.name}</strong></td>
                    <td>{sat.operator} &bull; <span style={{ fontFamily: 'monospace' }}>#{sat.norad_id}</span></td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{sat.nominal_altitude_km} km</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: sat.seven_day_altitude_loss_m > 350 ? '#991b1b' : '#0f172a' }}>
                      -{sat.seven_day_altitude_loss_m} m
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{sat.mission}</td>
                    <td>
                      <span className={`status-pill ${sat.requires_orbit_raise ? 'critical' : 'normal'}`}>
                        {sat.requires_orbit_raise ? 'ORBIT RAISE REQ' : 'NOMINAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 14-Day Rolling Drag Forecast (F10.7, Kp, Ap) */}
          <section className="content-card" style={{ marginTop: '20px' }}>
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>14-Day Rolling Solar Radio Flux (F10.7) & Planetary Ap Forecast</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))', gap: '8px' }}>
              {(data?.rolling_14_day_forecast || [
                { day: 1, date: 'Nov 14', f107_sfu: 198.5, kp: 6.2, ap: 48, tier: 'CRITICAL DRAG', color: '#991b1b' },
                { day: 2, date: 'Nov 15', f107_sfu: 204.0, kp: 6.8, ap: 54, tier: 'CRITICAL DRAG', color: '#991b1b' },
                { day: 3, date: 'Nov 16', f107_sfu: 192.5, kp: 5.4, ap: 38, tier: 'ELEVATED', color: '#f59e0b' },
                { day: 4, date: 'Nov 17', f107_sfu: 178.0, kp: 4.8, ap: 30, tier: 'ELEVATED', color: '#f59e0b' },
                { day: 5, date: 'Nov 18', f107_sfu: 165.0, kp: 3.5, ap: 22, tier: 'ELEVATED', color: '#f59e0b' },
                { day: 6, date: 'Nov 19', f107_sfu: 154.0, kp: 2.8, ap: 16, tier: 'NOMINAL', color: '#10b981' },
                { day: 7, date: 'Nov 20', f107_sfu: 148.0, kp: 2.4, ap: 12, tier: 'NOMINAL', color: '#10b981' },
              ]).map((d, i) => (
                <div key={i} style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #eaecf0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.date}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: d.f107_sfu >= 180 ? '#991b1b' : '#0f172a', margin: '3px 0' }}>{d.f107_sfu}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Kp {d.kp}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {modalMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '480px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>{modalMsg.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>{modalMsg.text}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalMsg(null)} className="btn-red-primary">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
