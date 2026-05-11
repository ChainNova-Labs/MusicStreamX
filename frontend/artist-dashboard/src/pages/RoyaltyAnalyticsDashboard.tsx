import { useState, useEffect, useCallback } from 'react';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import { GeoTable } from '../components/GeoTable';
import { fetchAnalytics } from '../api/analyticsApi';
import type { AnalyticsData } from '../types/analytics';

// Demo artist ID — in production comes from auth context
const DEMO_ARTIST_ID = '3f08afa9-a277-4400-97f0-625307980c0c';

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 20,
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 600,
  color: '#2d3748',
};

export function RoyaltyAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalytics(DEMO_ARTIST_ID);
      setData(result);
    } catch {
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div data-testid="analytics-dashboard" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>📊 Royalty Analytics</h1>
      <p style={{ color: '#718096', marginBottom: 24 }}>Stream counts, earnings, top tracks, and listener geography.</p>

      {loading && <p data-testid="loading">Loading analytics…</p>}
      {error && <p data-testid="error" style={{ color: '#e53e3e' }}>{error}</p>}

      {data && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div data-testid="total-streams" style={{ ...card, textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#718096', fontSize: 13 }}>Total Streams</p>
              <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700, color: '#667eea' }}>
                {data.totalStreams.toLocaleString()}
              </p>
            </div>
            <div data-testid="total-earnings" style={{ ...card, textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#718096', fontSize: 13 }}>Total Earnings</p>
              <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700, color: '#48bb78' }}>
                {data.totalEarnings.toFixed(2)} XLM
              </p>
            </div>
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={card}>
              <h2 style={sectionTitle}>Streams Over Time</h2>
              <LineChart
                data={data.streamHistory.map((p) => ({ label: p.date.slice(5), value: p.streams }))}
                color="#667eea"
                yLabel="Streams"
              />
            </div>
            <div style={card}>
              <h2 style={sectionTitle}>Earnings Over Time (XLM)</h2>
              <LineChart
                data={data.earningsHistory.map((p) => ({ label: p.date.slice(5), value: p.earnings }))}
                color="#48bb78"
                yLabel="Earnings"
              />
            </div>
          </div>

          {/* Top tracks + geo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <div style={card}>
              <h2 style={sectionTitle}>Top Tracks by Streams</h2>
              <BarChart
                data={data.topTracks.map((t) => ({ label: t.title, value: t.streams }))}
                color="#667eea"
              />
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 8 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '4px 0', color: '#718096' }}>Track</th>
                    <th style={{ textAlign: 'right', padding: '4px 0', color: '#718096' }}>Streams</th>
                    <th style={{ textAlign: 'right', padding: '4px 0', color: '#718096' }}>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topTracks.map((t) => (
                    <tr key={t.id} data-testid="top-track-row">
                      <td style={{ padding: '4px 0' }}>{t.title}</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>{t.streams.toLocaleString()}</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>{t.earnings.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={card}>
              <h2 style={sectionTitle}>Geographic Distribution</h2>
              <GeoTable data={data.geoDistribution} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
