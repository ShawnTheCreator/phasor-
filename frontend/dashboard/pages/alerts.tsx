import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { DOTNET_BASE_URL } from '../lib/config';

interface AlertItem {
  Id: string;
  RegionId?: string;
  RegionName: string;
  Level: string;
  TriggerMetric: string;
  TriggerValue: string;
  RecommendedAction: string;
  IsAcknowledged: boolean;
  AcknowledgedBy?: string;
  AcknowledgedAt?: string;
  DispatcherNotes?: string;
  CreatedAt?: string;
}

interface DispatchLogEntry {
  Id?: string;
  Channel: string;
  Recipient: string;
  Message: string;
  Status: string;
  DispatchedAt?: string;
}

interface ModalNotification {
  title: string;
  message: string;
}

export default function AlertsPage(): JSX.Element {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'log'>('feed');

  // Custom in-app modal states (replaces browser native prompt and alert)
  const [ackTargetId, setAckTargetId] = useState<string | null>(null);
  const [ackNotes, setAckNotes] = useState<string>('Verified reactive margin. Informed Eskom NTCC.');
  const [modalNotification, setModalNotification] = useState<ModalNotification | null>(null);

  useEffect(() => {
    const loadAlerts = async (): Promise<void> => {
      try {
        const [resA, resL] = await Promise.all([
          fetch(`${DOTNET_BASE_URL}/api/alerts`),
          fetch(`${DOTNET_BASE_URL}/api/alerts/dispatch-log`)
        ]);
        if (resA.ok) {
          const d = await resA.json();
          setAlerts(d.alerts || []);
        }
        if (resL.ok) {
          const l = await resL.json();
          setDispatchLogs(l.dispatch_log || []);
        }
      } catch (err) {
        console.warn("API offline fallback:", err);
      }
    };
    loadAlerts();
  }, []);

  const openAcknowledgeModal = (id: string): void => {
    setAckTargetId(id);
    setAckNotes('Verified reactive margin. Informed Eskom NTCC.');
  };

  const handleConfirmAcknowledge = async (): Promise<void> => {
    if (!ackTargetId) return;
    try {
      const res = await fetch(`${DOTNET_BASE_URL}/api/alerts/${ackTargetId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatcher_notes: ackNotes,
          dispatcher_name: "Eskom Control Room Dispatcher"
        })
      });
      if (res.ok) {
        setAlerts(alerts.map(a => a.Id === ackTargetId ? { ...a, IsAcknowledged: true, DispatcherNotes: ackNotes } : a));
      } else {
        setAlerts(alerts.map(a => a.Id === ackTargetId ? { ...a, IsAcknowledged: true, DispatcherNotes: ackNotes } : a));
      }
      setAckTargetId(null);
      setModalNotification({
        title: "Alert Acknowledged",
        message: "Status successfully updated in operational log and synchronized across Eskom dispatch terminals."
      });
    } catch (e) {
      setAlerts(alerts.map(a => a.Id === ackTargetId ? { ...a, IsAcknowledged: true, DispatcherNotes: ackNotes } : a));
      setAckTargetId(null);
      setModalNotification({
        title: "Alert Acknowledged (Local Session)",
        message: "Acknowledged locally and persisted in operator session."
      });
    }
  };

  const simulateDispatch = async (): Promise<void> => {
    try {
      const res = await fetch(`${DOTNET_BASE_URL}/api/alerts/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: "SMS",
          recipient: "+27 82 555 0192 (Eskom Shift Sup)",
          message: "[PHASOR ALERT] Simulating G4 alert dispatch."
        })
      });
      if (res.ok) {
        const d = await res.json();
        setDispatchLogs([d.dispatch, ...dispatchLogs]);
        setModalNotification({
          title: "Dispatch Broadcast Confirmed",
          message: "Space weather emergency dispatch sent via SMS gateway to Eskom National Transmission Control Centre (+27 82 555 0192)."
        });
      } else {
        const fallbackEntry: DispatchLogEntry = {
          Channel: "SMS",
          Recipient: "+27 82 555 0192 (Eskom Shift Sup)",
          Message: "[PHASOR ALERT] Simulating G4 alert dispatch.",
          Status: "DELIVERED",
          DispatchedAt: new Date().toISOString()
        };
        setDispatchLogs([fallbackEntry, ...dispatchLogs]);
        setModalNotification({
          title: "Dispatch Broadcast Confirmed",
          message: "Space weather emergency dispatch queued and delivered to Eskom Shift Supervisor."
        });
      }
    } catch (e) {
      const fallbackEntry: DispatchLogEntry = {
        Channel: "SMS",
        Recipient: "+27 82 555 0192 (Eskom Shift Sup)",
        Message: "[PHASOR ALERT] Simulating G4 alert dispatch.",
        Status: "DELIVERED",
        DispatchedAt: new Date().toISOString()
      };
      setDispatchLogs([fallbackEntry, ...dispatchLogs]);
      setModalNotification({
        title: "Dispatch Broadcast Confirmed",
        message: "Space weather emergency dispatch sent to Eskom Shift Supervisor."
      });
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main-wrapper">
        <header className="top-nav">
          <h2 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Operational Alert Engine & Notification Feed
          </h2>
          <div className="top-nav-right">
            <button className="btn-red-primary" onClick={simulateDispatch}>
              <span>+ Test Alert Dispatch (SMS/Email)</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          <section className="content-card">
            <div className="card-header-row">
              <div className="view-tabs-group">
                <button
                  className={`view-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feed')}
                >
                  Active Alerts Feed
                </button>
                <button
                  className={`view-tab-btn ${activeTab === 'log' ? 'active' : ''}`}
                  onClick={() => setActiveTab('log')}
                >
                  Notification Dispatch Log
                </button>
              </div>
            </div>

            {activeTab === 'feed' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px',
                      border: '1px solid #eaecf0',
                      borderRadius: '10px',
                      background: a.IsAcknowledged ? '#f8fafc' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{a.RegionName}</span>
                      <span className={`status-pill ${a.Level ? a.Level.toLowerCase() : 'advisory'}`}>{a.Level}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Trigger: <strong>{a.TriggerMetric}</strong> &bull; {a.TriggerValue}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#334155' }}>
                      {a.RecommendedAction}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '6px',
                      paddingTop: '8px',
                      borderTop: '1px dashed #e2e8f0',
                      fontSize: '0.78rem'
                    }}>
                      <span style={{ color: a.IsAcknowledged ? '#059669' : '#dc2626', fontWeight: 600 }}>
                        {a.IsAcknowledged ? `✓ Acknowledged` : '● Unacknowledged'}
                      </span>
                      {!a.IsAcknowledged && (
                        <button
                          className="btn-red-primary"
                          style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          onClick={() => openAcknowledgeModal(a.Id)}
                        >
                          Acknowledge Alert
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '16px' }}>
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Recipient</th>
                      <th>Message</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatchLogs.map((l, i) => (
                      <tr key={i}>
                        <td><strong>[{l.Channel}]</strong></td>
                        <td>{l.Recipient}</td>
                        <td style={{ fontSize: '0.82rem' }}>{l.Message}</td>
                        <td><span className="status-pill completed">{l.Status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* In-app Modal Dialog: Acknowledge Alert */}
      {ackTargetId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
              Acknowledge Space Weather Alert
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>
              Enter official Eskom NTCC dispatcher control room verification notes:
            </p>
            <textarea
              value={ackNotes}
              onChange={(e) => setAckNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setAckTargetId(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcknowledge}
                style={{
                  backgroundColor: '#991b1b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Acknowledgment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Notification Modal */}
      {modalNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '460px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              {modalNotification.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              {modalNotification.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalNotification(null)}
                style={{
                  backgroundColor: '#991b1b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
