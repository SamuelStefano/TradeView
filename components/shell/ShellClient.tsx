'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Topbar } from './Topbar';
import { Nav } from './Nav';
import { CommandPalette } from './CommandPalette';
import { KillSwitchModal } from './KillSwitchModal';

interface ShellClientProps {
  children: ReactNode;
}

export function ShellClient({ children }: ShellClientProps) {
  const [clock, setClock] = useState('--:--:--');
  const [lastSync, setLastSync] = useState('há 1s');
  const [wsReconnecting, setWsReconnecting] = useState(false);
  const [wsAttempt, setWsAttempt] = useState(2);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [killOpen, setKillOpen] = useState(false);
  const [killed, setKilled] = useState(false);
  const [density, setDensity] = useState<'compacto' | 'confortavel'>('confortavel');

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openKill = useCallback(() => setKillOpen(true), []);
  const closeKill = useCallback(() => setKillOpen(false), []);

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
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setKillOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function toggleDensity() {
    setDensity((d) => (d === 'compacto' ? 'confortavel' : 'compacto'));
  }

  function confirmKill() {
    setKillOpen(false);
    setKilled(true);
  }

  return (
    <div
      className="flex flex-col overflow-hidden bg-base text-text font-sans"
      style={{ height: '100vh', minWidth: 1360, fontSize: 13 }}
    >
      <Topbar
        clock={clock}
        lastSync={lastSync}
        wsReconnecting={wsReconnecting}
        wsAttempt={wsAttempt}
        onOpenPalette={openPalette}
        onOpenKill={openKill}
      />

      <div className="flex flex-1 min-h-0">
        <Nav density={density} onToggleDensity={toggleDensity} />
        <main className="flex-1 min-w-0 overflow-y-auto bg-base">
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
