import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { DOTNET_BASE_URL } from '../lib/config';
import HistoricalStormWaveformDiagram from '../components/diagrams/HistoricalStormWaveformDiagram';

interface StormSummary {
  id: string;
  name: string;
  peak_dst: number;
  peak_kp: number;
  duration_hours: number;
}

export default function ReplayPage(): JSX.Element {
  const [storms, setStorms] = useState<StormSummary[]>([]);
  const [selectedStorm, setSelectedStorm] = useState<string>('may_2024_g5');
  const [minuteIndex, setMinuteIndex] = useState<number>(780);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const loadStorms = async (): Promise<void> => {
      try {
        const res = await fetch(`${DOTNET_BASE_URL}/api/storms`);
        if (res.ok) {
          const d = await res.json();
          setStorms(d.catalog || []);
        }
      } catch (e) {
        console.warn(e);
      }
    };
    loadStorms();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setMinuteIndex(prev => (prev + 10) % 1440);
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main-wrapper">
        <header className="top-nav">
          <h2 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Historical Storm Replay Theatre
          </h2>
          <div className="top-nav-right">
            <button className="btn-red-primary" onClick={() => setIsPlaying(!isPlaying)}>
              <span>{isPlaying ? '⏸ Pause' : '▶ Play Replay'}</span>
            </button>
          </div>
        </header>

        <main className="page-container">
          <section className="content-card">
            <h3 style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: '10px' }}>
              Select Historical Benchmark Storm
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div
                onClick={() => setSelectedStorm('may_2024_g5')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: selectedStorm === 'may_2024_g5' ? '2px solid #991b1b' : '1px solid #eaecf0',
                  cursor: 'pointer',
                  background: selectedStorm === 'may_2024_g5' ? '#fff1f2' : '#ffffff'
                }}
              >
                <div style={{ fontWeight: 800, color: '#0f172a' }}>May 2024 "Gannon" Storm</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>G5 Superstorm &bull; Peak Dst -412 nT</div>
              </div>
              <div
                onClick={() => setSelectedStorm('march_1989_quebec')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: selectedStorm === 'march_1989_quebec' ? '2px solid #991b1b' : '1px solid #eaecf0',
                  cursor: 'pointer',
                  background: selectedStorm === 'march_1989_quebec' ? '#fff1f2' : '#ffffff'
                }}
              >
                <div style={{ fontWeight: 800, color: '#0f172a' }}>March 1989 Hydro-Québec</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>92-second blackout &bull; Peak Dst -589 nT</div>
              </div>
              <div
                onClick={() => setSelectedStorm('oct_2003_halloween')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: selectedStorm === 'oct_2003_halloween' ? '2px solid #991b1b' : '1px solid #eaecf0',
                  cursor: 'pointer',
                  background: selectedStorm === 'oct_2003_halloween' ? '#fff1f2' : '#ffffff'
                }}
              >
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Oct 2003 Halloween Storms</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Malmö blackout &bull; Peak Dst -383 nT</div>
              </div>
            </div>

            {/* Scrubber bar */}
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #eaecf0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.84rem' }}>
                <span>Replay Scrubber: <strong>Minute {minuteIndex} of 1440</strong></span>
                <span style={{ fontFamily: 'monospace', color: '#991b1b', fontWeight: 'bold' }}>
                  {minuteIndex >= 700 && minuteIndex <= 850 ? 'G5 SUPERSTORM PEAK SHOCK' : 'BASELINE INGRESS'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1439"
                value={minuteIndex}
                onChange={(e) => setMinuteIndex(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#991b1b' }}
              />
            </div>

            {/* Interactive 24-Hour Storm Shock Waveform & Ring Current Disturbance Diagram */}
            <HistoricalStormWaveformDiagram
              minuteIndex={minuteIndex}
              stormId={selectedStorm}
              onScrub={setMinuteIndex}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
