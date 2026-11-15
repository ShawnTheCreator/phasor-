import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import * as signalR from '@microsoft/signalr';
import { DOTNET_BASE_URL } from '../lib/config';
import InteractiveGridMapDiagram from '../components/diagrams/InteractiveGridMapDiagram';
import RealtimeTelemetryOscilloscope from '../components/diagrams/RealtimeTelemetryOscilloscope';
import TransformerCoreSaturationDiagram from '../components/diagrams/TransformerCoreSaturationDiagram';
import MultiHazardRadarDiagram from '../components/diagrams/MultiHazardRadarDiagram';

interface SubstationItem {
  SubstationId: string;
  SubstationName: string;
  Province?: string;
  VoltageKv: number;
  NeutralGicAmps: number;
  QLossMvar: number;
  RiskTier: string;
}

interface SolarWindInfo {
  LeadTimeMinutes?: number;
  ImfBz?: number;
  SpeedKmS?: number;
  DensityNCm3?: number;
}

interface GridRiskSummary {
  OverallTier?: string;
  TotalQLossMvar?: number;
  MaxGicAmps?: number;
  MostVulnerableSubstation?: string;
  Substations?: SubstationItem[];
  ExVkm?: number;
  EyVkm?: number;
  SolarWind?: SolarWindInfo;
}

export default function CommandView(): JSX.Element {
  const [gridRisk, setGridRisk] = useState<GridRiskSummary | null>(null);
  const [solarWind, setSolarWind] = useState<SolarWindInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'map'>('table');
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    // 1. Initial REST fetch from C# API
    const loadCurrentRisk = async (): Promise<void> => {
      try {
        const res = await fetch(`${DOTNET_BASE_URL}/api/risk/current`);
        if (res.ok) {
          const data: GridRiskSummary = await res.json();
          setGridRisk(data);
          if (data.SolarWind) {
            setSolarWind(data.SolarWind);
          }
        }
      } catch (e) {
        console.warn("C# REST API polling:", e);
      }
    };
    loadCurrentRisk();

    // 2. Connect to C# SignalR Hub for push updates
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${DOTNET_BASE_URL}/hubs/grid`)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveRiskUpdate', (summary: GridRiskSummary) => {
      setGridRisk(summary);
      if (summary.SolarWind) {
        setSolarWind(summary.SolarWind);
      }
    });

    connection.start().catch((err: unknown) => console.log('SignalR Hub connecting in background...', err));

    return () => {
      connection.stop();
    };
  }, []);

  const substations: SubstationItem[] = gridRisk?.Substations || [
    { SubstationId: 'HYDRA', SubstationName: 'Hydra Main Pivot', VoltageKv: 765, NeutralGicAmps: 26.8, QLossMvar: 9.8, RiskTier: 'WATCH' },
    { SubstationId: 'PERSEUS', SubstationName: 'Perseus Central Pivot', VoltageKv: 765, NeutralGicAmps: 22.4, QLossMvar: 8.2, RiskTier: 'WATCH' },
    { SubstationId: 'KOEBERG', SubstationName: 'Koeberg Nuclear Hub', VoltageKv: 400, NeutralGicAmps: 18.5, QLossMvar: 5.2, RiskTier: 'ADVISORY' },
    { SubstationId: 'MAJUBA', SubstationName: 'Majuba Generation Hub', VoltageKv: 765, NeutralGicAmps: 12.1, QLossMvar: 4.4, RiskTier: 'ADVISORY' },
    { SubstationId: 'BETA', SubstationName: 'Beta Trans-Karoo', VoltageKv: 765, NeutralGicAmps: 8.3, QLossMvar: 3.0, RiskTier: 'NORMAL' }
  ];

  const filtered = substations.filter(s =>
    s.SubstationName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.SubstationId.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.RiskTier.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-nav">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search substation, corridor, or risk tier..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
            <span className="kbd-shortcut">&#8984; F</span>
          </div>

          <div className="top-nav-right">
            <Link href="/replay" className="btn-red-primary" style={{ textDecoration: 'none' }}>
              <span>+ Replay G5 Storm</span>
              <span style={{ fontSize: '0.7rem' }}>&#9660;</span>
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="page-container">
          {/* Greeting & Stat Pills */}
          <section className="greeting-header">
            <div>
              <div className="date-label">Saturday, 14th November 2026</div>
              <h1 className="greeting-title">Good Afternoon! Dispatcher,</h1>
              <div className="stat-pills-row">
                <div className="stat-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span><strong>{solarWind?.LeadTimeMinutes ?? 28.1} min</strong> L1 Lead Time</span>
                </div>
                <div className="stat-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span><strong>13</strong> Substations Monitored</span>
                </div>
                <div className="stat-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <span><strong>{gridRisk?.OverallTier ?? 'WATCH'}</strong> Grid State</span>
                </div>
              </div>
            </div>

            <div className="greeting-actions">
              <Link href="/alerts" className="btn-red-primary" style={{ textDecoration: 'none' }}>
                <span>+ View Alert Feed</span>
              </Link>
            </div>
          </section>

          {/* Card 1: My Projects / Active Corridors Table */}
          <section className="content-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <h2 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <span>Active Grid Corridors & Substations</span>
                </h2>
              </div>
              <div className="view-tabs-group">
                <button className={`view-tab-btn ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>Table View</button>
                <button className={`view-tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Grid Map</button>
              </div>
            </div>

            {activeTab === 'table' ? (
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Substation & Voltage</th>
                    <th>Neutral GIC</th>
                    <th>Reactive Loss (Q_loss)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="task-name-cell">
                          <span className="task-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                          </span>
                          <span><strong>{s.SubstationName}</strong> ({s.VoltageKv} kV)</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: Math.abs(s.NeutralGicAmps) > 20 ? '#991b1b' : '#0f172a' }}>
                        {s.NeutralGicAmps} A
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {s.QLossMvar} MVAR
                      </td>
                      <td>
                        <span className={`status-pill ${s.RiskTier.toLowerCase()}`}>{s.RiskTier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <InteractiveGridMapDiagram
                  exVkm={gridRisk?.ExVkm ?? 0.12}
                  eyVkm={gridRisk?.EyVkm ?? -0.08}
                />
              </div>
            )}
          </section>

          {/* Real-Time Live Telemetry Waveforms Oscilloscope */}
          <section style={{ marginBottom: '20px' }}>
            <RealtimeTelemetryOscilloscope
              currentBz={solarWind?.ImfBz ?? -18.4}
              currentSpeed={solarWind?.SpeedKmS ?? 745}
              currentEField={gridRisk?.ExVkm ?? 0.14}
              currentGic={gridRisk?.MaxGicAmps ?? 26.8}
            />
          </section>

          {/* Real-Time Physical Saturation & Multi-Hazard Threat Diagrams */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <TransformerCoreSaturationDiagram
              gicAmps={gridRisk?.MaxGicAmps ?? 26.8}
              qLossMvar={gridRisk?.TotalQLossMvar ?? 9.8}
            />
            <MultiHazardRadarDiagram />
          </section>

          {/* Bottom Split Row */}
          <div className="bottom-grid">
            {/* Schedule Card */}
            <section className="content-card">
              <div className="card-header-row">
                <h2 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Operational Schedule</span>
                </h2>
              </div>
              <div className="days-bar">
                <div className="day-pill"><span className="day-name">Mo</span><span className="day-num">15</span></div>
                <div className="day-pill"><span className="day-name">Tu</span><span className="day-num">16</span></div>
                <div className="day-pill active"><span className="day-name">We</span><span className="day-num">17</span></div>
                <div className="day-pill"><span className="day-name">Th</span><span className="day-num">18</span></div>
                <div className="day-pill"><span className="day-name">Fr</span><span className="day-num">19</span></div>
              </div>
              <div className="schedule-list">
                <div className="schedule-item item-green">
                  <div className="schedule-info">
                    <span className="schedule-title">Kickoff Baseline Solar Wind Monitoring</span>
                    <span className="schedule-time">01:00 PM &bull; DSCOVR L1 Stable</span>
                  </div>
                </div>
                <div className="schedule-item item-red">
                  <div className="schedule-info">
                    <span className="schedule-title">Peak G5 Superstorm Shock Front</span>
                    <span className="schedule-time">05:00 PM &bull; Koeberg & Hydra Alert</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Notes & Directives */}
            <section className="content-card">
              <div className="card-header-row">
                <h2 className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  <span>Notes & Directives</span>
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>&bull; Database Synced</span>
              </div>
              <div className="notes-list">
                <div className="note-item">
                  <div className="note-radio checked">&#10003;</div>
                  <div className="note-content">
                    <span className="note-title">Deploy Static VAR Compensators at Perseus</span>
                    <span className="note-desc">Mitigate Q_loss reactive power deficit along 765 kV backbone.</span>
                  </div>
                </div>
                <div className="note-item">
                  <div className="note-radio checked">&#10003;</div>
                  <div className="note-content">
                    <span className="note-title">Monitor Transformer DGA Analysis</span>
                    <span className="note-desc">Inspect Hydra and Koeberg banks for hot-spot gas formation.</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
