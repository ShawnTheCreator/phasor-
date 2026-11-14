import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

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
        const res = await fetch('http://localhost:8000/api/public/safety');
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
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#991b1b', backgroundColor: 'rgba(153, 27, 27, 0.15)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(153, 27, 27, 0.35)' }}>
                SADC Civil Protection
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Role: Disaster Management Incident Commander & Municipal Coordinator
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Public Safety & Critical Infrastructure Dependency Matrix
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Plain-language early warnings and cascading failure prevention across water utilities, telecom hubs, and civil rescue.
            </p>
          </div>

          <button
            onClick={handleSimulateBroadcast}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#991b1b',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(153, 27, 27, 0.4)',
              transition: 'background-color 0.2s',
            }}
          >
            <span>📢</span>
            <span>{broadcastSent ? 'Advisory Broadcast Live' : 'Broadcast Plain-Language Advisory'}</span>
          </button>
        </div>

        {/* Plain-Language Citizen Advisory Banner */}
        <div
          style={{
            backgroundColor: data?.severity === 'SEVERE' ? 'rgba(153, 27, 27, 0.12)' : 'rgba(30, 41, 59, 0.7)',
            border: `1px solid ${data?.color || '#991b1b'}`,
            borderRadius: '8px',
            padding: '20px 24px',
            marginBottom: '28px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>{data?.severity === 'SEVERE' ? '🚨' : '🛡️'}</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: data?.color || '#ffffff' }}>
                {data?.headline || 'CIVIL PROTECTION BULLETIN: NOMINAL SPACE WEATHER'}
              </h2>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Lead Time to Impact: <strong style={{ color: '#ffffff' }}>{data?.lead_time_minutes ?? 28} mins</strong>
            </div>
          </div>

          <p style={{ margin: '0 0 14px 0', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            {data?.plain_description || 'Solar wind parameters are quiet. All electrical grids, satellites, GPS, and communication systems are operating normally across Southern Africa.'}
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <div><strong>Target Citizens:</strong> General Public, Drone Operators, Farmers, Municipalities</div>
            <div><strong>Dissemination Channels:</strong> Cell Broadcast (SMS-CB), SABC Radio 1-4, Provincial DMS</div>
            <div><strong>Status:</strong> {broadcastSent ? 'ACTIVE ON AIR' : 'ARMED / READY FOR DISPATCH'}</div>
          </div>
        </div>

        {/* Section 1: Critical Infrastructure Dependency Map */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Critical Infrastructure Cascading Dependency Chain
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Transmission Substation → Secondary Water / Telecom Service
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {(data?.critical_infrastructure_dependencies || []).map((node) => (
              <div
                key={node.id}
                style={{
                  backgroundColor: 'var(--card-bg, #1e293b)',
                  border: '1px solid var(--border-color, #334155)',
                  borderRadius: '8px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                      {node.sector}
                    </span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#334155', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px' }}>
                      {node.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                    {node.name}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <div><strong>Serves:</strong> {node.serves_population}</div>
                    <div><strong>Feeding Feeder:</strong> {node.feeding_substation}</div>
                    <div><strong>Fuel / UPS Capacity:</strong> {node.backup_power_hours} Hours</div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.78rem', borderLeft: '3px solid #991b1b' }}>
                  <strong style={{ color: '#ef4444' }}>Cascading Risk:</strong> {node.vulnerability}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Municipal Disaster Management Checklist */}
        <div style={{ backgroundColor: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-primary)' }}>
            Civil Protection Pre-Storm Resource Readiness Checklist
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(data?.emergency_checklist || []).map((chk, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {chk.item}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Assigned Agency: <strong>{chk.agency}</strong> &bull; Priority: <span style={{ color: '#ef4444' }}>{chk.priority}</span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: chk.status === 'VERIFIED' || chk.status === 'READY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: chk.status === 'VERIFIED' || chk.status === 'READY' ? '#10b981' : '#f59e0b',
                    border: chk.status === 'VERIFIED' || chk.status === 'READY' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                  }}
                >
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        {modalMsg && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #991b1b',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '460px',
                width: '90%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#ef4444', fontSize: '1.2rem', fontWeight: 700 }}>
                {modalMsg.title}
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', lineHeight: '1.5', color: '#cbd5e1' }}>
                {modalMsg.text}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setModalMsg(null)}
                  style={{
                    backgroundColor: '#991b1b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
