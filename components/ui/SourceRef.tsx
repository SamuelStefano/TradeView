import type { ReactNode } from 'react';

interface SourceRefProps {
  source: string;
  className?: string;
  children: ReactNode;
}

export function SourceRef({ source, className = '', children }: SourceRefProps) {
  return (
    <span
      title={`fonte: ${source}`}
      className={`underline decoration-dotted cursor-help ${className}`}
      style={{ textUnderlineOffset: 2 }}
    >
      {children}
    </span>
  );
}
