'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from './Topbar';
import { Nav } from './Nav';
import { CommandPalette } from './CommandPalette';
import { KillSwitchModal } from './KillSwitchModal';
import { ShortcutsModal } from './ShortcutsModal';

export interface ShellHealth {
  connected: number;
  total: number;
  degraded: number;
  offline: number;
  latencyMs: number;
}

interface ShellClientProps {
  children: ReactNode;
  health: ShellHealth;
}

const GOTO: Record<string, string> = {
  o: '/',
  a: '/asset/BTC-USD',
  p: '/portfolio',
  s: '/strategies',
};

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable
  );
}

const DENSITY_KEY = 'tradeview:density';
type Density = 'compacto' | 'confortavel';

const densityListeners = new Set<() => void>();

function subscribeDensity(onChange: () => void) {
  densityListeners.add(onChange);
  return () => {
    densityListeners.delete(onChange);
  };
}

function readDensity(): Density {
  return localStorage.getItem(DENSITY_KEY) === 'compacto' ? 'compacto' : 'confortavel';
}

function serverDensity(): Density {
  return 'confortavel';
}

function writeDensity(next: Density) {
  localStorage.setItem(DENSITY_KEY, next);
  densityListeners.forEach((onChange) => onChange());
}

export function ShellClient({ children, health }: ShellClientProps) {
  const [clock, setClock] = useState('--:--:--');
  const [lastSync, setLastSync] = useState('há 1s');
  const [wsReconnecting, setWsReconnecting] = useState(false);
  const [wsAttempt, setWsAttempt] = useState(2);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [killOpen, setKillOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [killed, setKilled] = useState(false);
  const density = useSyncExternalStore(subscribeDensity, readDensity, serverDensity);
  const chordRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openKill = useCallback(() => setKillOpen(true), []);
  const closeKill = useCallback(() => setKillOpen(false), []);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);

  useEffect(() => {
    function pad(n: number) {
      return String(n).padStart(2, '0');
    }

    function tick() {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
      setLastSync(`há ${1 + (d.getSeconds() % 5)}s`);
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const wsTimer = setInterval(() => {
      setWsReconnecting((prev) => !prev);
      setWsAttempt(1 + Math.floor(Math.random() * 4));
    }, 14000);
    return () => clearInterval(wsTimer);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setKillOpen(false);
        setShortcutsOpen(false);
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (paletteOpen || killOpen || shortcutsOpen || isTyping(e.target)) return;

      const key = e.key.toLowerCase();

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (chordRef.current) {
        clearTimeout(chordRef.current);
        chordRef.current = null;
        const href = GOTO[key];
        if (href) {
          e.preventDefault();
          router.push(href);
        }
        return;
      }

      if (key === 'g') {
        e.preventDefault();
        chordRef.current = setTimeout(() => {
          chordRef.current = null;
        }, 1500);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paletteOpen, killOpen, shortcutsOpen, router]);

  useEffect(() => {
    const chord = chordRef;
    return () => {
      if (chord.current) clearTimeout(chord.current);
    };
  }, []);

  function toggleDensity() {
    writeDensity(density === 'compacto' ? 'confortavel' : 'compacto');
  }

  function confirmKill() {
    setKillOpen(false);
    setKilled(true);
  }

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-base text-text font-sans"
      style={{ height: '100vh', minWidth: 1180, fontSize: 13 }}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[80] focus:h-8 focus:px-3 focus:flex focus:items-center focus:bg-accent-bg focus:border focus:border-accent-border focus:rounded-md focus:text-accent-hover focus:text-xs focus:font-semibold focus:no-underline"
      >
        Pular para o conteúdo
      </a>

      <Topbar
        clock={clock}
        lastSync={lastSync}
        health={health}
        wsReconnecting={wsReconnecting}
        wsAttempt={wsAttempt}
        onOpenPalette={openPalette}
        onOpenKill={openKill}
      />

      <div className="flex flex-1 min-h-0">
        <Nav density={density} onToggleDensity={toggleDensity} />
        <main id="conteudo" tabIndex={-1} className="flex-1 min-w-0 overflow-y-auto bg-base outline-none">
          {children}
        </main>
      </div>

      <footer
        className="flex-shrink-0 flex items-center justify-center gap-4 border-t border-border bg-chrome text-text-faint"
        style={{ height: 22, fontSize: 10 }}
      >
        Análise gerada por IA — não constitui recomendação de investimento.
        <span className="font-mono">dados: tempo real e diferido conforme fonte</span>
      </footer>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
      <KillSwitchModal open={killOpen} onClose={closeKill} onConfirm={confirmKill} />
      <ShortcutsModal open={shortcutsOpen} onClose={closeShortcuts} />

      {killed && (
        <div
          role="status"
          className="flex items-center gap-3 border border-down rounded-lg font-semibold text-down"
          style={{
            position: 'fixed',
            bottom: 34,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 80,
            background: 'var(--color-down-bg)',
            padding: '10px 18px',
            fontSize: 12.5,
          }}
        >
          Kill switch ATIVO — ordens bloqueadas em todas as integrações
          <button
            onClick={() => setKilled(false)}
            className="bg-down text-white border-none rounded font-semibold cursor-pointer font-sans"
            style={{ padding: '4px 10px', fontSize: 11 }}
          >
            Reativar
          </button>
        </div>
      )}
    </div>
  );
}
