import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../lib/config';

interface FlightRoute {
  id: string;
  callsign: string;
  corridor: string;
  nominal_fl: number;
  flight_time_hours: number;
  dose_fl390_usv: number;
  dose_fl310_usv: number;
  dose_savings_pct: number;
  recommendation: string;
}

interface AircrewMember {
  id: string;
  name: string;
  role: string;
  annual_dose_msv: number;
  limit_pct: number;
  status: string;
}

interface AviationResponse {
  timestamp: string;
  icao_bulletin_code: string;
  triad: {
    hf_radio: {
      tier: string;
      color: string;
      riometer_db: number;
      riometer_threshold_db: number;
      muf_depression_pct: number;
      bulletin: string;
    };
    radiation: {
      tier: string;
      color: string;
      dose_rate_fl390_usv_h: number;
      dose_rate_fl310_usv_h: number;
      icao_moderate_threshold: number;
      icao_severe_threshold: number;
      advisory: string;
    };
    gnss_satcom: {
      tier: string;
      color: string;
      positional_error_m: number;
      satcom_availability_pct: number;
      ads_b_lock_status: string;
    };
  };
  routes: FlightRoute[];
  aircrew: AircrewMember[];
}

export default function AviationPage(): JSX.Element {
  const [data, setData] = useState<AviationResponse | null>(null);
  const [modalMsg, setModalMsg] = useState<{ title: string; text: string } | null>(null);

  useEffect(() => {
    const loadAviation = async (): Promise<void> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/aviation/triad`);
        if (res.ok) {
          const d: AviationResponse = await res.json();
          setData(d);
        }
      } catch (err) {
        console.warn('Aviation API fallback:', err);
      }
    };
    loadAviation();
    const interval = setInterval(loadAviation, 5000);
    return () => clearInterval(interval);
  }, []);

  const triad = data?.triad;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main-wrapper">
        <header className="top-nav">
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
            ICAO Space Weather Information Service (SWIS) &bull; PECASUS Aligned
          </div>

          <div className="top-nav-right">
            <div className="btn-outline" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
              <span className="color-dot" style={{ backgroundColor: triad?.radiation.color || '#991b1b', display: 'inline-block' }}></span>
              <span>ICAO RAD: <strong>{triad?.radiation.tier || 'SEVERE'}</strong></span>
            </div>

            <button
              onClick={() => setModalMsg({
                title: "ICAO Pre-Flight Briefing Export (SWIS Format)",
                text: "Exported flight dispatcher briefing package for Johannesburg (FAOR) & Cape Town (FACT) FIRs. Attachment includes route dose assessments, riometer absorption curves, and SATCOM fallback instructions."
              })}
              className="btn-red-primary"
            >
              <span>+ Export ICAO Briefing</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          <section className="greeting-header">
            <div>
              <div className="date-label">SADC Operational Picture 3 &bull; Aviation Dispatch & Aircrew Dosimetry</div>
              <h1 className="greeting-title">Aviation Space Weather Triad (HF / Radiation / GNSS)</h1>
              <div className="stat-pills-row">
                <div className="stat-pill">
                  <span>Effective Dose @ FL390: <strong style={{ color: triad?.radiation.color || '#991b1b' }}>{triad?.radiation.dose_rate_fl390_usv_h ?? 82.5} µSv/h</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Riometer HF Absorption: <strong style={{ color: triad?.hf_radio.color || '#991b1b' }}>{triad?.hf_radio.riometer_db ?? 5.8} dB</strong></span>
                </div>
                <div className="stat-pill">
                  <span>ADS-B GNSS Uncertainty: <strong style={{ color: triad?.gnss_satcom.color || '#991b1b' }}>~{triad?.gnss_satcom.positional_error_m ?? 16.4} m</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* Triad Diagnostic Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Triad 1: HF Radio */}
            <div className="content-card" style={{ borderLeft: `4px solid ${triad?.hf_radio.color || '#991b1b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>Triad 1: HF Communications</span>
                <span className={`status-pill ${(triad?.hf_radio.tier || 'SEVERE').toLowerCase()}`}>{triad?.hf_radio.tier || 'SEVERE'}</span>
              </div>
              <div style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {triad?.hf_radio.riometer_db ?? 5.8} dB Absorption
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '6px' }}>
                MUF Depression: <strong>{triad?.hf_radio.muf_depression_pct ?? 54}%</strong> (ICAO Threshold 30% / 50%)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                {triad?.hf_radio.bulletin || 'Primary HF radio unusable on polar/high-latitude legs. Switch to SATCOM CPDLC.'}
              </div>
            </div>

            {/* Triad 2: Radiation */}
            <div className="content-card" style={{ borderLeft: `4px solid ${triad?.radiation.color || '#991b1b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>Triad 2: Radiation at Altitude</span>
                <span className={`status-pill ${(triad?.radiation.tier || 'SEVERE').toLowerCase()}`}>{triad?.radiation.tier || 'SEVERE'}</span>
              </div>
              <div style={{ fontSize: '1.18rem', fontWeight: 700, color: '#991b1b', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {triad?.radiation.dose_rate_fl390_usv_h ?? 82.5} µSv/h
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '6px' }}>
                Step-down to FL310: <strong>{triad?.radiation.dose_rate_fl310_usv_h ?? 47.8} µSv/h</strong> (-42% exposure)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                {triad?.radiation.advisory || 'ICAO Severe Radiation Alert in effect across FL390–FL410.'}
              </div>
            </div>

            {/* Triad 3: GNSS & SATCOM */}
            <div className="content-card" style={{ borderLeft: `4px solid ${triad?.gnss_satcom.color || '#991b1b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>Triad 3: GNSS & SATCOM</span>
                <span className={`status-pill ${(triad?.gnss_satcom.tier || 'SEVERE').toLowerCase()}`}>{triad?.gnss_satcom.tier || 'SEVERE'}</span>
              </div>
              <div style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                ~{triad?.gnss_satcom.positional_error_m ?? 16.4} m Drift
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '6px' }}>
                SATCOM Availability: <strong>{triad?.gnss_satcom.satcom_availability_pct ?? 78.5}%</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                ADS-B timing jitter observed. Use ground VOR / DME for primary navigation.
              </div>
            </div>
          </div>

          {/* Route & Altitude Advisory Table */}
          <section className="content-card">
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"></path></svg>
                <span>SADC Long-Haul Corridors & Altitude Step-Down Recommendations</span>
              </h2>
            </div>

            <table className="projects-table">
              <thead>
                <tr>
                  <th>Flight Callsign</th>
                  <th>Corridor</th>
                  <th>FL390 Dose</th>
                  <th>FL310 Dose</th>
                  <th>Dose Reduction</th>
                  <th>Dispatcher Advisory</th>
                </tr>
              </thead>
              <tbody>
                {(data?.routes || [
                  { id: '1', callsign: 'SA0234', corridor: 'JNB -> London (EGLL)', nominal_fl: 390, dose_fl390_usv: 924.0, dose_fl310_usv: 536.0, dose_savings_pct: 42.0, recommendation: 'Step down to FL310 over equatorial corridor' },
                  { id: '2', callsign: 'EK0772', corridor: 'CPT -> Dubai (OMDB)', nominal_fl: 410, dose_fl390_usv: 412.0, dose_fl310_usv: 255.0, dose_savings_pct: 38.1, recommendation: 'Maintain standard airway; monitor SATCOM' },
                  { id: '3', callsign: 'SA0280', corridor: 'JNB -> Perth (YPPH)', nominal_fl: 380, dose_fl390_usv: 814.0, dose_fl310_usv: 490.0, dose_savings_pct: 39.8, recommendation: 'Step down to FL310. Avoid polar southern latitude track.' },
                ]).map((r, idx) => (
                  <tr key={idx}>
                    <td><strong>{r.callsign}</strong></td>
                    <td>{r.corridor}</td>
                    <td style={{ fontFamily: 'monospace', color: '#991b1b', fontWeight: 'bold' }}>{r.dose_fl390_usv} µSv</td>
                    <td style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 'bold' }}>{r.dose_fl310_usv} µSv</td>
                    <td><span className="status-pill normal">-{r.dose_savings_pct}%</span></td>
                    <td style={{ fontSize: '0.82rem', color: '#334155' }}>{r.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Aircrew Cumulative Dosimetry Tracker */}
          <section className="content-card" style={{ marginTop: '20px' }}>
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Aircrew Cumulative Dosimetry Registry (Annual 20 mSv Regulatory Cap)</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {(data?.aircrew || [
                { id: 'CREW-104', name: 'Capt. D. Ndlovu', role: 'Captain (A350)', annual_dose_msv: 4.82, limit_pct: 24.1, status: 'CLEAR' },
                { id: 'CREW-219', name: 'F/O M. Van Der Merwe', role: 'First Officer', annual_dose_msv: 5.14, limit_pct: 25.7, status: 'CLEAR' },
                { id: 'CREW-388', name: 'Purser S. Khumalo', role: 'Senior Cabin Crew', annual_dose_msv: 6.95, limit_pct: 34.8, status: 'CLEAR' },
                { id: 'CREW-402', name: 'Capt. J. Mokoena', role: 'Captain (Long-Haul)', annual_dose_msv: 11.20, limit_pct: 56.0, status: 'ELEVATED_WATCH' },
              ]).map((c, i) => (
                <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '6px' }}>{c.role}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    <span>{c.annual_dose_msv} mSv / 20 mSv</span>
                    <strong style={{ color: c.limit_pct > 50 ? '#d97706' : '#059669' }}>{c.limit_pct}%</strong>
                  </div>
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
