interface BarItem {
  label: string;
  value: number;
}

interface Props {
  data: BarItem[];
  color?: string;
  height?: number;
}

export function BarChart({ data, color = '#48bb78', height = 140 }: Props) {
  if (!data.length) return <p style={{ color: '#a0aec0', textAlign: 'center' }}>No data</p>;

  const width = 400;
  const padX = 8;
  const padTop = 8;
  const padBottom = 28;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;
  const barW = Math.max(4, chartW / data.length - 6);
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <svg
      data-testid="bar-chart"
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height }}
      aria-label="Bar chart"
    >
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = padX + (i / data.length) * chartW + (chartW / data.length - barW) / 2;
        const y = padTop + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx={2} />
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize={8}
              fill="#718096"
            >
              {d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
