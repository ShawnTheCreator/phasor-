import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../lib/config';

interface CriticalInfraNode {
  id: string;
  name: string;
  sector: string;
  serves_population: string;
  feeding_substation: string;
  backup_power_hours: number;
  vulnerability: string;
}

interface EmergencyChecklistItem {
  item: string;
  agency: string;
  priority: string;
  status: string;
}

interface PublicSafetyResponse {
  timestamp: string;
  headline: string;
  plain_description: string;
  severity: string;
  color: string;
  lead_time_minutes: number;
  critical_infrastructure_dependencies: CriticalInfraNode[];
  emergency_checklist: EmergencyChecklistItem[];
}

export default function PublicSafetyPage(): JSX.Element {
  const [data, setData] = useState<PublicSafetyResponse | null>(null);
  const [modalMsg, setModalMsg] = useState<{ title: string; text: string } | null>(null);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  useEffect(() => {
    const loadSafety = async (): Promise<void> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/safety`);
        if (res.ok) {
          const d: PublicSafetyResponse = await res.json();
          setData(d);
        }
      } catch (err) {
        console.warn('Public safety API fallback:', err);
      }
    };
    loadSafety();
    const interval = setInterval(loadSafety, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateBroadcast = (): void => {
    setBroadcastSent(true);
    setModalMsg({
      title: 'Civil Protection Broadcast Transmitted',
      text: 'Plain-language emergency advisory successfully queued for Cell Broadcast (SMS-CB) across Gauteng and Western Cape, and dispatched to SABC National Radio emergency interrupt channel.',
    });
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main-wrapper">
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Public Safety & Civil Protection Matrix
            </h2>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#991b1b', backgroundColor: 'var(--red-soft)', padding: '2px 8px', borderRadius: '9999px', border: '1px solid var(--red-border)' }}>
              Southern African Countries Disaster Management
            </span>
          </div>

          <div className="top-nav-right">
            <button
              className="btn-red-primary"
              onClick={handleSimulateBroadcast}
              style={{ gap: '6px' }}
            >
              <span>📢</span>
              <span>{broadcastSent ? 'Broadcast Live (Active)' : 'Broadcast Advisory'}</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          {/* Greeting Header */}
          <section className="greeting-header">
            <div>
              <div className="date-label">Southern African Countries Operational Picture 6 &bull; Civil Protection & Infrastructure Protection</div>
              <h1 className="greeting-title">Public Safety & Cascading Dependency Matrix</h1>
              <div className="stat-pills-row">
                <div className="stat-pill">
                  <span>Lead Time: <strong style={{ color: '#991b1b' }}>{data?.lead_time_minutes ?? 28} min</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Severity: <strong style={{ color: data?.severity === 'SEVERE' ? '#991b1b' : '#059669' }}>{data?.severity || 'NORMAL'}</strong></span>
                </div>
                <div className="stat-pill">
                  <span>Broadcast: <strong style={{ color: broadcastSent ? '#059669' : '#d97706' }}>{broadcastSent ? 'CELL BROADCAST ON AIR' : 'ARMED'}</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* Plain-Language Citizen Advisory Banner */}
          <section
            className="content-card"
            style={{
              borderLeft: `4px solid ${data?.color || '#991b1b'}`,
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>{data?.severity === 'SEVERE' ? '🚨' : '🛡️'}</span>
                <h2 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: data?.color || '#991b1b' }}>
                  {data?.headline || 'CIVIL PROTECTION BULLETIN: NOMINAL SPACE WEATHER'}
                </h2>
              </div>
              <span className="kbd-shortcut" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                T-minus {data?.lead_time_minutes ?? 28}m
              </span>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              {data?.plain_description || 'Solar wind parameters are quiet. All electrical grids, satellites, GPS, and communication systems are operating normally across Southern Africa.'}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <div><strong>Target Citizens:</strong> General Public, Drone Operators, Municipal Emergency Services</div>
              <div><strong>Channels:</strong> Cell Broadcast (SMS-CB), SABC Radio 1-4, Provincial Disaster Centers</div>
              <div><strong>Status:</strong> {broadcastSent ? 'ACTIVE ON AIR' : 'ARMED / READY FOR DISPATCH'}</div>
            </div>
          </section>

          {/* Section 1: Critical Infrastructure Dependency Map */}
          <section className="content-card">
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Critical Infrastructure Cascading Dependency Chain</span>
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Transmission Substation &rarr; Secondary Utility</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {(data?.critical_infrastructure_dependencies || []).map((node) => (
                <div
                  key={node.id}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {node.sector}
                      </span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {node.id}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.84rem', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                      {node.name}
                    </h3>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <div><strong>Serves:</strong> {node.serves_population}</div>
                      <div><strong>Feeder:</strong> {node.feeding_substation}</div>
                      <div><strong>UPS / Gen:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{node.backup_power_hours} hrs</span></div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '4px', fontSize: '0.72rem', borderLeft: '3px solid #991b1b', border: '1px solid var(--border-light)', borderLeftWidth: '3px', borderLeftColor: '#991b1b' }}>
                    <strong style={{ color: '#991b1b' }}>Cascading Risk:</strong> {node.vulnerability}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Municipal Disaster Management Checklist */}
          <section className="content-card">
            <div className="card-header-row">
              <h2 className="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                <span>Civil Protection Pre-Storm Resource Readiness Checklist</span>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(data?.emergency_checklist || []).map((chk, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {chk.item}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Assigned Agency: <strong>{chk.agency}</strong> &bull; Priority: <span style={{ color: '#991b1b', fontWeight: 600 }}>{chk.priority}</span>
                    </div>
                  </div>

                  <span
                    className="status-pill"
                    style={{
                      backgroundColor: chk.status === 'VERIFIED' || chk.status === 'READY' ? '#ecfdf5' : '#fffbeb',
                      color: chk.status === 'VERIFIED' || chk.status === 'READY' ? '#059669' : '#d97706',
                      border: chk.status === 'VERIFIED' || chk.status === 'READY' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                    }}
                  >
                    {chk.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Custom Confirmation Modal */}
          {modalMsg && (
            <div className="modal-backdrop show">
              <div className="modal-dialog">
                <div className="modal-header">
                  <span className="modal-title-text" style={{ color: '#991b1b' }}>
                    📢 {modalMsg.title}
                  </span>
                  <button className="modal-close-btn" onClick={() => setModalMsg(null)}>&times;</button>
                </div>
                <div className="modal-body">
                  <p>{modalMsg.text}</p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn-red-primary"
                    onClick={() => setModalMsg(null)}
                  >
                    Acknowledge Dispatch
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
