interface EquityCurveProps {
  values: number[];
  labels: string[];
  width?: number;
  height?: number;
  className?: string;
}

function buildPolyline(values: number[], w: number, h: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 8;
  return values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function buildArea(values: number[], w: number, h: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 8;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(',')[0];
  const first = pts[0].split(',')[0];
  return `${pts.join(' ')} ${last},${h - pad} ${first},${h - pad}`;
}

function lastMonthLabels(labels: string[]): { label: string; x: number }[] {
  const seen = new Map<string, number>();
  labels.forEach((l, i) => {
    if (!seen.has(l)) seen.set(l, i);
  });
  const total = labels.length;
  const pad = 8;
  return Array.from(seen.entries()).map(([label, idx]) => ({
    label,
    x: pad + (idx / (total - 1)) * (400 - pad * 2),
  }));
}

export function EquityCurve({ values, labels, width = 400, height = 80, className = '' }: EquityCurveProps) {
  const polyline = buildPolyline(values, width, height);
  const area = buildArea(values, width, height);
  const monthMarks = lastMonthLabels(labels);
  const isPositive = values[values.length - 1] >= values[0];
  const lineColor = isPositive ? 'var(--color-up)' : 'var(--color-down)';
  const gradId = 'eq-grad';

  return (
    <svg
      role="img"
      aria-label="Curva de patrimônio"
      width={width}
      height={height + 16}
      viewBox={`0 0 ${width} ${height + 16}`}
      className={className}
    >
      <title>Curva de patrimônio</title>
      <desc>Evolução do patrimônio total ao longo do tempo</desc>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.18} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {area && (
        <polygon points={area} fill={`url(#${gradId})`} />
      )}
      {polyline && (
        <polyline
          points={polyline}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {monthMarks.map(({ label, x }) => (
        <g key={label}>
          <line
            x1={x}
            y1={height - 4}
            x2={x}
            y2={height + 2}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          <text
            x={x}
            y={height + 13}
            textAnchor="middle"
            fill="var(--color-text-faint)"
            style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}
