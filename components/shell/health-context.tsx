'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface ShellHealth {
  connected: number;
  total: number;
  degraded: number;
  offline: number;
  latencyMs: number;
  realStrategies: number;
  fetchedAt: number;
}

const ShellHealthContext = createContext<ShellHealth | null>(null);

export function ShellHealthProvider({
  value,
  children,
}: {
  value: ShellHealth;
  children: ReactNode;
}) {
  return <ShellHealthContext.Provider value={value}>{children}</ShellHealthContext.Provider>;
}

export function useShellHealth(): ShellHealth {
  const health = useContext(ShellHealthContext);
  if (!health) throw new Error('useShellHealth precisa estar dentro de ShellHealthProvider');
  return health;
}
