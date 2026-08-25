import type { Tone } from '@/lib/types';
import { toneClass, arrow } from '@/lib/format';

interface NumProps {
  value: string;
  tone?: Tone;
  showSign?: boolean;
  showArrow?: boolean;
  className?: string;
}

export function Num({ value, tone, showSign, showArrow, className = '' }: NumProps) {
  const colorClass = tone ? toneClass(tone) : '';
  const arrowChar = tone && showArrow ? arrow(tone === 'up' ? 1 : tone === 'down' ? -1 : 0) : '';
  const sign = showSign && tone === 'up' ? '+' : '';

  return (
    <span
      className={`font-mono tabular-nums text-right ${colorClass} ${className}`}
    >
      {arrowChar && <span className="mr-0.5">{arrowChar}</span>}
      {sign}{value}
    </span>
  );
}
