interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  color?: string;
  height?: number;
  yLabel?: string;
}

export function LineChart({ data, color = '#667eea', height = 120, yLabel }: Props) {
  if (!data.length) return <p style={{ color: '#a0aec0', textAlign: 'center' }}>No data</p>;

  const width = 400;
  const padX = 40;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padY + chartH - (d.value / maxVal) * chartH,
    label: d.label,
    value: d.value,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <svg
      data-testid="line-chart"
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height }}
      aria-label={yLabel ?? 'Line chart'}
    >
      {/* Area fill */}
      <path d={areaD} fill={color} fillOpacity={0.12} />
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {/* X-axis labels (first, middle, last) */}
      {[0, Math.floor(data.length / 2), data.length - 1]
        .filter((i, idx, arr) => arr.indexOf(i) === idx && i < data.length)
        .map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={height - 2}
            textAnchor="middle"
            fontSize={9}
            fill="#718096"
          >
            {points[i].label}
          </text>
        ))}
    </svg>
  );
}
