type BarVariant = 'accent' | 'up' | 'down' | 'warn' | 'ai';

interface BarProps {
  value: number;
  max?: number;
  variant?: BarVariant;
  label: string;
  height?: number;
  className?: string;
}

const variantFill: Record<BarVariant, string> = {
  accent: 'bg-accent',
  up: 'bg-up',
  down: 'bg-down',
  warn: 'bg-warn',
  ai: 'bg-ai',
};

export function Bar({ value, max = 100, variant = 'accent', label, height = 4, className = '' }: BarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="img"
      aria-label={label}
      className={`w-full bg-border rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className={`h-full rounded-full ${variantFill[variant]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
