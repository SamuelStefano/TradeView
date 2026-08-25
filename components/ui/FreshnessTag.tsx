import type { Freshness } from '@/lib/types';
import { freshnessLabel, freshnessTone } from '@/lib/format';

interface FreshnessTagProps {
  freshness: Freshness;
  className?: string;
}

export function FreshnessTag({ freshness, className = '' }: FreshnessTagProps) {
  const tone = freshnessTone(freshness);
  const label = freshnessLabel(freshness);

  const colorClass =
    tone === 'ok'
      ? 'text-up'
      : tone === 'warn'
        ? 'text-warn'
        : 'text-text-faint';

  const dotColor =
    tone === 'ok'
      ? 'var(--color-up)'
      : tone === 'warn'
        ? 'var(--color-warn)'
        : 'var(--color-text-faint)';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono ${colorClass} ${className}`}
      style={{ fontSize: '10px' }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
