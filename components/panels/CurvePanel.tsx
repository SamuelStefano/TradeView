interface CurvePanelProps {
  title: string;
  meta: string;
  alt: string;
  legend?: string;
  labels: string[];
  series: number[];
  series2?: number[];
}

function buildPoints(series: number[], width: number, height: number): string {
  if (series.length < 2) return '';
  const minVal = Math.min(...series);
  const maxVal = Math.max(...series);
  const range = maxVal - minVal || 1;
  const step = width / (series.length - 1);
  return series
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - minVal) / range) * (height - 12) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function CurvePanel({ title, meta, alt, legend, labels, series, series2 }: CurvePanelProps) {
  const W = 280;
  const H = 110;
  const baselineY = 92;

  const pts1 = buildPoints(series, W, baselineY);
  const pts2 = series2 ? buildPoints(series2, W, baselineY) : null;

  const labelStep = labels.length > 1 ? W / (labels.length - 1) : 0;

  return (
    <section className="bg-surface border border-border rounded-lg p-3">
      <div className="flex items-center mb-2">
        <span
          className="text-text-muted font-medium"
          style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}
        >
          {title}
        </span>
        <span className="ml-auto font-mono text-text-faint" style={{ fontSize: '9.5px' }}>
          {meta}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', display: 'block' }}
        role="img"
        aria-label={alt}
      >
        <title>{alt}</title>
        <line x1="0" x2={W} y1={baselineY} y2={baselineY} stroke="var(--color-border)" />
        <polyline
          points={pts1}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.6"
        />
        {pts2 && (
          <polyline
            points={pts2}
            fill="none"
            stroke="var(--color-text-faint)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        )}
        {labels.map((label, i) => (
          <text
            key={label}
            x={labels.length > 1 ? i * labelStep : W / 2}
            y={H - 4}
            fill="var(--color-text-faint)"
            fontSize="8.5"
            fontFamily="Geist Mono"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>
      {legend && (
        <div className="font-mono text-text-faint mt-1" style={{ fontSize: '9.5px' }}>
          {legend}
        </div>
      )}
    </section>
  );
}
