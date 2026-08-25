import type { ReactNode } from 'react';

type BadgeVariant = 'up' | 'down' | 'warn' | 'ai' | 'neutral' | 'danger';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  up: 'bg-up-bg text-up border border-up-border',
  down: 'bg-down-bg text-down border border-danger-border',
  warn: 'bg-warn-bg text-warn border border-warn-border',
  ai: 'bg-ai-bg text-ai border border-ai-border',
  neutral: 'bg-accent-bg-soft text-text-secondary border border-border',
  danger: 'bg-down-strong text-down border border-danger-border',
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-mono rounded px-1.5 py-0.5 ${variantClasses[variant]} ${className}`}
      style={{ fontSize: '10px' }}
    >
      {children}
    </span>
  );
}
