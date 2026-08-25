interface DonutSlice {
  pct: number;
  color: string;
  label: string;
}

interface DonutProps {
  slices: DonutSlice[];
  size?: number;
}

export function Donut({ slices, size = 96 }: DonutProps) {
  const r = 15.9155;
  const circumference = 2 * Math.PI * r;

  const arcs = slices.reduce<{ pct: number; color: string; label: string; dash: number; gap: number; offset: number; acc: number }[]>(
    (prev, slice) => {
      const prevAcc = prev.length > 0 ? prev[prev.length - 1].acc : 0;
      const dash = (slice.pct / 100) * circumference;
      const gap = circumference - dash;
      const offset = circumference * 0.25 - (prevAcc / 100) * circumference;
      return [...prev, { ...slice, dash, gap, offset, acc: prevAcc + slice.pct }];
    },
    [],
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      role="img"
      aria-label="Donut de alocação por classe de ativo"
    >
      {arcs.map((arc) => (
        <circle
          key={arc.label}
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth="6"
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={arc.offset}
        />
      ))}
    </svg>
  );
}
