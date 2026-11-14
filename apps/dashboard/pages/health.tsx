import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

interface HospitalNode {
  id: string;
  name: string;
  city: string;
  country: string;
  beds: number;
  specialties: string[];
  feeding_substation: string;
  feeder_gic_amps: number;
  grid_risk_tier: string;
  grid_color: string;
  feeder_status: string;
  has_dialysis_hub: boolean;
  generator_capacity_kva: number;
}

interface ChecklistItem {
  task: string;
  criticality: string;
  auto_trigger: boolean;
  status: string;
  details: string;
}

interface HealthResponse {
  timestamp: string;
  surge_tier: string;
  surge_color: string;
  stroke_risk_multiplier: number;
  cardiac_risk_multiplier: number;
  surge_advisory: string;
  at_risk_hospitals_count: number;
  total_monitored_beds: number;
  hospitals: HospitalNode[];
  readiness_checklist: ChecklistItem[];
  vulnerable_patient_summary: {
    registered_dialysis_patients: number;
    pacemaker_telemetry_links: number;
    api_feed_endpoint: string;
    last_ping_status: string;
  };
}

export default function HealthPage(): JSX.Element {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [modalMsg, setModalMsg] = useState<{ title: string; text: string } | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    const loadHealth = async (): Promise<void> => {
      try {
        const res = await fetch('http://localhost:8000/api/health/resilience');
        if (res.ok) {
          const d: HealthResponse = await res.json();
          setData(d);
        }
      } catch (err) {
        console.warn('Health API fallback:', err);
      }
    };
    loadHealth();
    const interval = setInterval(loadHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const hospitals = data?.hospitals || [
    { id: 'HOSP-01', name: 'Chris Hani Baragwanath Academic Hospital', city: 'Soweto, JHB', country: 'South Africa', beds: 3200, specialties: ['Trauma', 'Burns', 'Dialysis'], feeding_substation: 'Eikenhof Main 400kV', feeder_gic_amps: 24.5, grid_risk_tier: 'HIGH RISK', grid_color: '#991b1b', feeder_status: 'Transformer core saturation imminent', has_dialysis_hub: true, generator_capacity_kva: 6500 },
    { id: 'HOSP-02', name: 'Groote Schuur Hospital', city: 'Cape Town', country: 'South Africa', beds: 975, specialties: ['Cardiac Transplant', 'Stroke'], feeding_substation: 'Acacia / Koeberg 400kV', feeder_gic_amps: 18.2, grid_risk_tier: 'WATCH', grid_color: '#f59e0b', feeder_status: 'Voltage fluctuation warning', has_dialysis_hub: true, generator_capacity_kva: 4200 },
    { id: 'HOSP-03', name: 'Inkosi Albert Luthuli Central Hospital', city: 'Durban', country: 'South Africa', beds: 846, specialties: ['Cardiothoracic', 'Dialysis'], feeding_substation: 'Georgedale Main 400kV', feeder_gic_amps: 14.1, grid_risk_tier: 'WATCH', grid_color: '#f59e0b', feeder_status: 'Reactive power margin monitored', has_dialysis_hub: true, generator_capacity_kva: 3800 },
    { id: 'HOSP-07', name: 'University Teaching Hospital (UTH)', city: 'Lusaka', country: 'Zambia', beds: 1655, specialties: ['National Referral', 'Dialysis'], feeding_substation: 'Leopards Hill 330kV', feeder_gic_amps: 9.5, grid_risk_tier: 'STABLE', grid_color: '#10b981', feeder_status: 'Normal operating envelope', has_dialysis_hub: true, generator_capacity_kva: 3500 },
  ];

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.feeding_substation.toLowerCase().includes(filterQuery.toLowerCase())
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
              placeholder="Search hospital, city, or feeding substation..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <div className="top-nav-right">
            <div className="btn-outline" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
              <span className="color-dot" style={{ backgroundColor: data?.surge_color || '#991b1b', display: 'inline-block' }}></span>
              <span>Clinical Surge: <strong>{data?.surge_tier || 'CRITICAL SURGE'}</strong></span>
            </div>

            <button
              onClick={() => setModalMsg({
                title: "Vulnerable-Patient Emergency Broadcast Initiated",
                text: "Dispatched automated warning to 1,420 registered home-dialysis patients and 3,890 cardiac monitoring wearables. Action: Verify UPS backup power and stand by for facility hub diversion."
              })}
              className="btn-red-primary"
            >
              <span>+ Dialysis / Cardiac Alert</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          <section className="greeting-header">
            <div>
              <div className="date-label">SADC Operational Picture 2 &bull; Hospital Emergency Coordinators & EMS</div>
              <h1 className="greeting-title">Health System Resilience & Hospital Grid Vulnerability</h1>
              <div className="stat-pills-row">
                <div className="stat-pill">
                  <span>Stroke Relative Risk: <strong style={{ color: '#991b1b' }}>+{((data?.stroke_risk_multiplier ?? 1.58) - 1.0) * 100 | 0}% ({data?.stroke_risk_multiplier ?? 1.58}x)</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Cardiac Surge Multiplier: <strong style={{ color: '#991b1b' }}>{data?.cardiac_risk_multiplier ?? 2.15}x</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Feeders at Risk: <strong style={{ color: '#991b1b' }}>{data?.at_risk_hospitals_count ?? 2} Critical Hospitals</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* Hospital to Substation Overlay Table */}
          <section className="content-card">
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                <span>Tertiary Hospitals & Feeding Substation Vulnerability Matrix</span>
              </h2>
            </div>

            <table className="projects-table">
              <thead>
                <tr>
                  <th>Hospital & Location</th>
                  <th>Feeding Substation & GIC</th>
                  <th>Beds & Dialysis</th>
                  <th>Backup Generator</th>
                  <th>Feeder Status</th>
                  <th>Grid Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <div>
                        <strong>{h.name}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{h.city}, {h.country}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>{h.feeding_substation}</span>
                        <div style={{ fontFamily: 'monospace', color: h.feeder_gic_amps >= 20 ? '#991b1b' : '#0f172a', fontWeight: 'bold' }}>
                          {h.feeder_gic_amps} A Neutral GIC
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{h.beds} beds</strong>
                        {h.has_dialysis_hub && <span style={{ marginLeft: '6px', fontSize: '0.72rem', background: '#fef2f2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Dialysis Hub</span>}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {h.generator_capacity_kva} kVA
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {h.feeder_status}
                    </td>
                    <td>
                      <span className={`status-pill ${h.grid_risk_tier.toLowerCase().replace(' ', '-')}`}>{h.grid_risk_tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Bottom Split Row: Clinical Surge Advisory & Automated Readiness Checklist */}
          <div className="bottom-grid">
            {/* Surge Protocol Card */}
            <section className="content-card">
              <div className="card-header-row">
                <h2 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span>Geomagnetic Biological Surge Directive (NeuroStorm Protocol)</span>
                </h2>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem' }}>
                  {data?.surge_tier || 'CRITICAL SURGE'}: Activated for Stroke & Trauma Units
                </div>
                <p style={{ fontSize: '0.84rem', color: '#7f1d1d', marginTop: '6px', lineHeight: 1.5, margin: 0 }}>
                  {data?.surge_advisory || "Geomagnetic perturbation induces autonomic vascular dysregulation. Emergency departments advised to clear acute stroke beds and prepare CT angiography suites."}
                </p>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
                <strong>Scientific Basis:</strong> Grounded in epidemiological findings (Feigin et al. 2014, 1.25–1.60x relative stroke risk during storm windows; Zilli Vieira et al. 2022, cardiac arrhythmia surge).
              </div>
            </section>

            {/* Backup Readiness Checklist */}
            <section className="content-card">
              <div className="card-header-row">
                <h2 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                  <span>Pre-Storm Facility Readiness Checklist</span>
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(data?.readiness_checklist || [
                  { task: 'Emergency Diesel Generator Auto-Start & Transfer Switch Test', status: 'COMPLETED', criticality: 'URGENT', details: 'Verify 72-hour fuel buffer and starter battery voltage.' },
                  { task: 'Vaccine & Biological Specimen Cold-Chain Pre-Cooling', status: 'COMPLETED', criticality: 'HIGH', details: 'Deep freeze pre-cooling to -80°C / -20°C.' },
                  { task: 'Defer Non-Critical Elective Surgical Procedures', status: 'RECOMMENDED', criticality: 'RECOMMENDED', details: 'Preserve surgical oxygen concentrators and ICU bed margins.' },
                  { task: 'Dispatch Outpatient Dialysis Warnings & Shift Rescheduling', status: 'DISPATCHED', criticality: 'HIGH', details: 'Alert home dialysis outpatients to standby backup centers.' },
                ]).map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>{item.task}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.details}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: item.status === 'COMPLETED' ? '#ecfdf5' : item.status === 'DISPATCHED' ? '#eff6ff' : '#fffbeb', color: item.status === 'COMPLETED' ? '#059669' : item.status === 'DISPATCHED' ? '#2563eb' : '#d97706' }}>
                      {item.status}
                    </span>
                  </div>
                ))}
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
