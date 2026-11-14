import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar(): JSX.Element {
  const router = useRouter();
  const currentPath: string = router.pathname;

  return (
    <aside className="sidebar">
      {/* 1. Header (Anchored at top) */}
      <div className="logo-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="logo-phi-symbol" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444', lineHeight: 1, textShadow: '0 0 12px rgba(239, 68, 68, 0.4)' }}>Φ</span>
        <div>
          <div className="logo-text">Phasor</div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.04em', fontWeight: 600 }}>SADC MULTI-HAZARD</div>
        </div>
      </div>

      {/* 2. Scrollable Middle Body */}
      <div className="sidebar-scroll-body">
        {/* SECTION 1: SADC OPERATIONAL PICTURES */}
        <div className="sidebar-divider-title">
          <span>SADC Operational Pictures</span>
        </div>

        <nav className="nav-section">
          {/* SAPP Grid */}
          <Link href="/grid" className={`nav-item ${currentPath === '/grid' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            <span>SAPP Power Grid</span>
          </Link>

          {/* GNSS Scintillation */}
          <Link href="/gnss" className={`nav-item ${currentPath === '/gnss' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>GNSS Scintillation</span>
          </Link>

          {/* Health Resilience */}
          <Link href="/health" className={`nav-item ${currentPath === '/health' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span>Health Resilience</span>
          </Link>

          {/* Aviation Triad */}
          <Link href="/aviation" className={`nav-item ${currentPath === '/aviation' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"></path>
            </svg>
            <span>Aviation Triad</span>
          </Link>

          {/* Satellite Drag */}
          <Link href="/satellites" className={`nav-item ${currentPath === '/satellites' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L13 14h-2l.25-4.07A4.002 4.002 0 0 1 12 2z"></path>
              <path d="M5 18a7 7 0 0 1 14 0"></path>
              <path d="M2 22a10 10 0 0 1 20 0"></path>
            </svg>
            <span>Satellite Drag</span>
          </Link>

          {/* Public Safety */}
          <Link href="/public" className={`nav-item ${currentPath === '/public' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Public Safety</span>
          </Link>
        </nav>

        {/* SECTION 2: COMMAND & FORENSICS */}
        <div className="sidebar-divider-title">
          <span>Command & Forensics</span>
        </div>

        <nav className="nav-section">
          {/* Command View */}
          <Link href="/" className={`nav-item ${currentPath === '/' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1.5"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1.5"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1.5"></rect>
            </svg>
            <span>Mission Control</span>
          </Link>

          {/* Alert Feed */}
          <Link href="/alerts" className={`nav-item ${currentPath === '/alerts' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Alert Feed</span>
          </Link>

          {/* Storm Replay */}
          <Link href="/replay" className={`nav-item ${currentPath === '/replay' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path><path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M2 12h2"></path><path d="M20 12h2"></path>
            </svg>
            <span>Storm Replay</span>
          </Link>

          {/* Model Transparency */}
          <Link href="/model" className={`nav-item ${currentPath === '/model' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Model & Lineage</span>
          </Link>

          {/* Hardware Node */}
          <Link href="/hardware" className={`nav-item ${currentPath === '/hardware' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Hardware Probe</span>
          </Link>
        </nav>

        {/* SECTION 3: BACKEND SERVICES */}
        <div className="sidebar-divider-title">
          <span>Backend & Microservices</span>
        </div>

        <div className="project-item">
          <span className="color-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span>FastAPI Multi-Hazard (8000)</span>
        </div>
        <div className="project-item">
          <span className="color-dot" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>C# ASP.NET Core GIC (5000)</span>
        </div>
        <div className="project-item">
          <span className="color-dot" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>C++ Pico Magnetometer</span>
        </div>
      </div>

      {/* 3. Bottom Footer */}
      <div className="sidebar-bottom">
        <div className="nav-item" style={{ color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span>SADC Node Hermanus (HER)</span>
        </div>
      </div>
    </aside>
  );
}
