import React, { useState } from 'react';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardUrl: string;
}

export default function BookDemoModal({ isOpen, onClose, dashboardUrl }: BookDemoModalProps): JSX.Element | null {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [focusArea, setFocusArea] = useState('Power Grid & Transformer GIC');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(7, 1, 2, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #fecaca',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div style={{
          backgroundColor: '#991b1b',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#fecaca' }}>
              Phasor Space Weather Platform
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0 0', color: '#ffffff' }}>
              Book an Operational Demo
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                fontSize: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid #fecaca'
              }}>
                ✓
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                VIP Briefing Request Received!
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
                Thank you, <strong>{name || 'Operator'}</strong>. A space weather mission specialist from our team will reach out to <strong>{email}</strong> within 4 business hours to coordinate your technical demonstration.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#991b1b',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  Explore Live Demo Now ↗
                </a>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Lerato Ndlovu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. lndlovu@eskom.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Organization / Utility *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eskom / SAPP / NamPower / Airline"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Primary Focus Area
                </label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Power Grid & Transformer GIC">Power Grid & Transformer GIC Protection</option>
                  <option value="Aviation Cosmic Radiation & HF Triad">Aviation Cosmic Radiation & Polar HF Triad</option>
                  <option value="LEO Satellite Atmospheric Drag">LEO Satellite Atmospheric Drag Forecasting</option>
                  <option value="GNSS RTK Scintillation & Mining">GNSS RTK Scintillation & Autonomous Survey</option>
                </select>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#991b1b',
                    color: '#ffffff',
                    padding: '11px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Demo Request &rarr;
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '11px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
