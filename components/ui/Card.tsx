import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, meta, children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface border border-border rounded-lg p-3.5 ${className}`}>
      {(title || meta) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <span
              className="text-text-muted font-sans font-medium"
              style={{ fontSize: '11px', letterSpacing: '0.6px', textTransform: 'uppercase' }}
            >
              {title}
            </span>
          )}
          {meta && (
            <span className="font-mono text-text-faint" style={{ fontSize: '10px' }}>
              {meta}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
