'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useShellHealth } from './health-context';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', icon: '◧', label: 'Overview', href: '/' },
  { id: 'markets', icon: '⇄', label: 'Mercados', href: '/markets' },
  { id: 'asset', icon: '▤', label: 'Ativos', href: '/asset/BTC-USD' },
  { id: 'chat', icon: '✦', label: 'IA Analyst', href: '/chat' },
  { id: 'strategies', icon: '⚙', label: 'Estratégias', href: '/strategies' },
  { id: 'portfolio', icon: '◔', label: 'Portfólio', href: '/portfolio' },
  { id: 'trade', icon: '⊞', label: 'Mesa', href: '/trade' },
  { id: 'alerts', icon: '◉', label: 'Alertas', href: '/alerts' },
  { id: 'analytics', icon: '∿', label: 'Analytics', href: '/analytics' },
  { id: 'settings', icon: '⚒', label: 'Configurações', href: '/settings' },
  { id: 'onboarding', icon: '➔', label: 'Onboarding', href: '/onboarding' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const health = useShellHealth();
  const badges: Record<string, string> = { markets: String(health.total) };

  function isCurrent(item: NavItem): boolean {
    if (item.href === '/') return pathname === '/';
    if (item.id === 'asset') return pathname.startsWith('/asset');
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="flex flex-col flex-shrink-0 border-r border-border bg-chrome overflow-y-auto"
      style={{ width: 196, padding: 8, gap: 2 }}
    >
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(item);
        const badge = badges[item.id];
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            aria-current={current ? 'page' : undefined}
            className="flex items-center gap-2.5 rounded-md border-none cursor-pointer text-left font-sans w-full hover:bg-hover hover:text-text transition-colors"
            style={{
              height: 32,
              padding: '0 10px',
              background: current ? 'var(--color-active)' : 'transparent',
              color: current ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontSize: 12.5,
              fontWeight: current ? 600 : 400,
            }}
          >
            <span style={{ width: 16, textAlign: 'center', fontSize: 13, opacity: 0.9 }}>
              {item.icon}
            </span>
            {item.label}
            {badge && (
              <span
                className="ml-auto font-mono bg-accent-bg-soft text-accent-hover rounded-full"
                style={{ fontSize: 10, padding: '1px 6px' }}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <div className="border-t border-border pt-2 flex flex-col gap-2" style={{ padding: '8px 10px' }}>
        <div className="text-text-faint leading-snug" style={{ fontSize: 10 }}>
          Atalhos:{' '}
          <span className="font-mono">g o</span> overview ·{' '}
          <span className="font-mono">g a</span> ativos ·{' '}
          <span className="font-mono">?</span> lista completa
        </div>
      </div>
    </nav>
  );
}
