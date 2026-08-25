interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  label: string;
}

export function Sparkline({ data, width = 56, height = 20, positive, label }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const isUp = positive !== undefined ? positive : data[data.length - 1] >= data[0];
  const stroke = isUp ? 'var(--color-up)' : 'var(--color-down)';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
