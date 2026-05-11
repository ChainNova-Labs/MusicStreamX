import type { GeoEntry } from '../types/analytics';

interface Props {
  data: GeoEntry[];
}

export function GeoTable({ data }: Props) {
  if (!data.length) return <p style={{ color: '#a0aec0' }}>No geographic data</p>;

  return (
    <table
      data-testid="geo-table"
      style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
    >
      <thead>
        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
          <th style={{ textAlign: 'left', padding: '4px 8px', color: '#718096' }}>Country</th>
          <th style={{ textAlign: 'right', padding: '4px 8px', color: '#718096' }}>Listeners</th>
          <th style={{ textAlign: 'right', padding: '4px 8px', color: '#718096' }}>Share</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry) => (
          <tr key={entry.country} style={{ borderBottom: '1px solid #f7fafc' }}>
            <td style={{ padding: '4px 8px' }}>{entry.country}</td>
            <td style={{ padding: '4px 8px', textAlign: 'right' }}>
              {entry.listeners.toLocaleString()}
            </td>
            <td style={{ padding: '4px 8px', textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                <div
                  style={{
                    width: 60,
                    height: 6,
                    background: '#e2e8f0',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${entry.percentage}%`,
                      height: '100%',
                      background: '#667eea',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span>{entry.percentage.toFixed(1)}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
