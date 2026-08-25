interface StepDotsProps {
  total: number;
  current: number;
}

export function StepDots({ total, current }: StepDotsProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i + 1 <= current ? 'var(--color-accent)' : 'var(--color-border)',
          }}
        />
      ))}
    </div>
  );
}
