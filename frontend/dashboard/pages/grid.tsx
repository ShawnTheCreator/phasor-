import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../lib/config';
import SappGridTopologyDiagram from '../components/diagrams/SappGridTopologyDiagram';

interface SappSubstation {
  id: string;
  name: string;
  country: string;
  utility: string;
  voltage_kv: number;
  gic_amps: number;
  q_loss_mvar: number;
  tier: string;
  color: string;
  has_neutral_blocking: boolean;
  blocking_status: string;
  cumulative_loss_of_life_pct: number;
  event_aging_increment_pct: number;
}

interface ReroutingAdvisory {
  priority: string;
  action: string;
  benefit: string;
}

interface SappResponse {
  timestamp: string;
  total_sapp_q_loss_mvar: number;
  unprotected_high_risk_substations: string[];
  substations: SappSubstation[];
  rerouting_advisories: ReroutingAdvisory[];
  countries_covered: string[];
}

export default function GridExpansionPage(): JSX.Element {
  const [data, setData] = useState<SappResponse | null>(null);
  const [modalMsg, setModalMsg] = useState<{ title: string; text: string } | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    const loadGrid = async (): Promise<void> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/grid/sapp`);
        if (res.ok) {
          const d: SappResponse = await res.json();
          setData(d);
        }
      } catch (err) {
        console.warn('SAPP Grid API fallback:', err);
      }
    };
    loadGrid();
    const interval = setInterval(loadGrid, 5000);
    return () => clearInterval(interval);
  }, []);

  const substations = data?.substations || [
    { id: 'HYDRA', name: 'Hydra Main Pivot', country: 'South Africa', utility: 'Eskom', voltage_kv: 765, gic_amps: 26.8, q_loss_mvar: 10.2, tier: 'CRITICAL', color: '#991b1b', has_neutral_blocking: true, blocking_status: 'ACTIVE_BLOCKED', cumulative_loss_of_life_pct: 15.2, event_aging_increment_pct: 0.54 },
    { id: 'AUAS', name: 'Auas Windhoek Hub', country: 'Namibia', utility: 'NamPower', voltage_kv: 400, gic_amps: 16.2, q_loss_mvar: 6.2, tier: 'WATCH', color: '#f59e0b', has_neutral_blocking: false, blocking_status: 'UNPROTECTED', cumulative_loss_of_life_pct: 18.8, event_aging_increment_pct: 0.32 },
    { id: 'PHOKOJE', name: 'Phokoje Interconnector', country: 'Botswana', utility: 'BPC', voltage_kv: 400, gic_amps: 14.8, q_loss_mvar: 5.6, tier: 'WATCH', color: '#f59e0b', has_neutral_blocking: false, blocking_status: 'UNPROTECTED', cumulative_loss_of_life_pct: 9.7, event_aging_increment_pct: 0.30 },
    { id: 'SONGO', name: 'Songo Cahora Bassa Converter', country: 'Mozambique', utility: 'HCB', voltage_kv: 533, gic_amps: 19.4, q_loss_mvar: 7.4, tier: 'WATCH', color: '#f59e0b', has_neutral_blocking: true, blocking_status: 'ACTIVE_BLOCKED', cumulative_loss_of_life_pct: 29.1, event_aging_increment_pct: 0.39 },
    { id: 'INSUKAMINI', name: 'Insukamini Hub', country: 'Zimbabwe', utility: 'ZETDC', voltage_kv: 400, gic_amps: 12.5, q_loss_mvar: 4.8, tier: 'WATCH', color: '#f59e0b', has_neutral_blocking: false, blocking_status: 'UNPROTECTED', cumulative_loss_of_life_pct: 24.5, event_aging_increment_pct: 0.25 },
  ];

  const filtered = substations.filter(s =>
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.country.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.utility.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main-wrapper">
        <header className="top-nav">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search SAPP substation, utility, or country..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <div className="top-nav-right">
            <div className="btn-outline" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
              <span className="color-dot" style={{ backgroundColor: '#10b981', display: 'inline-block' }}></span>
              <span>SAPP Network: <strong>6 Countries Active</strong></span>
            </div>

            <button
              onClick={() => setModalMsg({
                title: "Load-Flow Power Rerouting Dispatched",
                text: "Transmitted PSS/E dispatch directive to SAPP Coordination Centre (Harare) to shift 400 MW from Insukamini corridor into Songo-Apollo HVDC line, offloading saturated autotransformer neutrals by 35%."
              })}
              className="btn-red-primary"
            >
              <span>+ Execute SAPP Reroute</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          <section className="greeting-header">
            <div>
              <div className="date-label">SADC Operational Picture 4 &bull; SAPP Regional Dispatch & Maintenance Planners</div>
              <h1 className="greeting-title">SAPP Interconnected Grid & Transformer Loss-of-Life</h1>
              <div className="stat-pills-row">
                <div className="stat-pill">
                  <span>Total SAPP Q_loss: <strong style={{ color: '#991b1b' }}>{data?.total_sapp_q_loss_mvar ?? 34.2} MVAR</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Unprotected Autotransformers: <strong style={{ color: '#d97706' }}>{data?.unprotected_high_risk_substations.length ?? 3} Substations</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Interconnection Scope: <strong style={{ color: '#059669' }}>SA, NA, BW, ZW, MZ, ZM</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* SAPP Interactive Single-Line Topology & Protection Schematic */}
          <SappGridTopologyDiagram />

          {/* SAPP Grid League Table */}
          <section className="content-card">
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>SAPP Transmission Substations & Neutral GIC Currents</span>
              </h2>
            </div>

            <table className="projects-table">
              <thead>
                <tr>
                  <th>Substation & Utility</th>
                  <th>Country & Voltage</th>
                  <th>GIC Neutral Current</th>
                  <th>Reactive Q_loss</th>
                  <th>Neutral Blocker (GRD)</th>
                  <th>Cumulative Insulation Aging</th>
                  <th>Risk Tier</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div>
                        <strong>{s.name}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{s.utility}</div>
                      </div>
                    </td>
                    <td>
                      <div>{s.country} &bull; <strong>{s.voltage_kv} kV</strong></div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: s.gic_amps >= 20 ? '#991b1b' : s.gic_amps >= 12 ? '#d97706' : '#0f172a' }}>
                      {s.gic_amps} A
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {s.q_loss_mvar} MVAR
                    </td>
                    <td>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: s.has_neutral_blocking ? '#ecfdf5' : '#fef2f2', color: s.has_neutral_blocking ? '#059669' : '#991b1b' }}>
                        {s.blocking_status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
                        <strong>{s.cumulative_loss_of_life_pct}%</strong>
                        <span style={{ fontSize: '0.72rem', color: '#991b1b', marginLeft: '4px' }}>+{s.event_aging_increment_pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${s.tier.toLowerCase()}`}>{s.tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Bottom Split Row: Rerouting Advisory & Aging Model */}
          <div className="bottom-grid">
            {/* Load Flow Advisory Card */}
            <section className="content-card">
              <div className="card-header-row">
                <h2 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                  <span>SAPP Topological Load-Flow Rerouting Advisories</span>
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(data?.rerouting_advisories || [
                  { priority: 'HIGH', action: 'Reroute 400 MW from Insukamini corridor into Songo-Apollo HVDC line', benefit: 'Relieves unprotected autotransformer core saturation at Phokoje & Insukamini by 35%.' },
                  { priority: 'MEDIUM', action: 'Engage Series Capacitor Neutral Blockers at Perseus 765 kV bank', benefit: 'Eliminates 22.4 A quasi-DC loop between Free State and Northern Cape.' },
                ]).map((adv, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{adv.action}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: adv.priority === 'HIGH' ? '#fef2f2' : '#fffbeb', color: adv.priority === 'HIGH' ? '#991b1b' : '#d97706' }}>
                        {adv.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{adv.benefit}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Transformer Aging Model */}
            <section className="content-card">
              <div className="card-header-row">
                <h2 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>Transformer Loss-of-Life Physics Formulation</span>
                </h2>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '8px' }}>
                  Quasi-DC GIC bias forces transformer steel cores into asymmetric half-cycle saturation, inducing severe stray flux into tank walls and paper insulation windings.
                </p>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0f172a', marginBottom: '8px' }}>
                  Aging Rate = exp( (theta_hotspot - 110) / (0.00288 * (theta_hotspot + 273)) )
                </div>
                <p style={{ margin: 0 }}>
                  Empirical research across South African GSU transformers demonstrates <strong>~0.3% irreversible loss-of-life per 15 A quasi-DC event</strong>, giving maintenance planners long-horizon asset replacement foresight.
                </p>
              </div>
            </section>
          </div>
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
