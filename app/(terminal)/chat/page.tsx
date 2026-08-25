'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { UserMessage } from '@/components/chat/UserMessage';
import { AIMessage } from '@/components/chat/AIMessage';
import { StreamingMessage } from '@/components/chat/StreamingMessage';
import { FailureBanner } from '@/components/chat/FailureBanner';
import { ChatInput } from '@/components/chat/ChatInput';

type Model = 'claude-sonnet-4-6' | 'claude-opus-4-2' | 'kimi-k2' | 'grok-4';

interface HistoryGroup {
  theme: string;
  items: { t: string; active: boolean }[];
}

interface StreamStep {
  t: string;
  meta: string;
  icon: string;
  fgClass: string;
}

const STEP_DEFS: [string, string][] = [
  ['Coletando dados', 'ONS, CCEE, BBCE, ECMWF · 8 fontes'],
  ['Analisando', 'ENA vs MLT, forwards, sazonalidade 10 anos'],
  ['Sintetizando tese', 'cenários + sizing sugerido'],
];

const FULL_STREAM_TEXT =
  'O quadro hidrológico do Q4 parte de ENA em 62% da MLT no SE/CO com reservatórios em 41%. A curva forward da BBCE ainda precifica set/26 a R$ 119/MWh, R$ 22 abaixo do spot — historicamente esse desconto só se sustentou em anos com ENA acima de 85% da média…';

function buildSteps(phase: number): StreamStep[] {
  return STEP_DEFS.map(([t, meta], i) => ({
    t,
    meta,
    icon: phase > i ? '✓' : phase === i ? '◌' : '·',
    fgClass:
      phase > i
        ? 'text-up'
        : phase === i
        ? 'text-text'
        : 'text-text-faint',
  }));
}

function buildHistory(activeTheme: string, activeIndex: number): HistoryGroup[] {
  const raw: { theme: string; items: string[] }[] = [
    {
      theme: 'Portfólio',
      items: ['Por que caiu hoje + risco escondido', 'Rebalanceamento sugerido — ago'],
    },
    {
      theme: 'Energia',
      items: ['Tese Q4 — PLD e forwards', 'Carbono UE vs I-REC'],
    },
    {
      theme: 'Renda fixa',
      items: ['NTN-B 2035 vs 2045', 'DARF de agosto — conferência'],
    },
    {
      theme: 'Cripto',
      items: ['Funding squeeze BTC', 'Rotação ETH/SOL'],
    },
  ];

  return raw.map((group) => ({
    theme: group.theme,
    items: group.items.map((t, i) => ({
      t,
      active: group.theme === activeTheme && i === activeIndex,
    })),
  }));
}

const ATTRIBUTION_ROWS = [
  { sym: 'PETR4', v: '−R$ 4.210', w: '86%', tone: 'down' as const, src: 'fonte: B3, posição 8.940 ações' },
  { sym: 'WIN out', v: '−R$ 2.890', w: '59%', tone: 'down' as const, src: 'fonte: B3 derivativos' },
  { sym: 'SOJA nov', v: '−R$ 1.480', w: '30%', tone: 'down' as const, src: 'fonte: B3 agro' },
  { sym: 'BTC perp', v: '+R$ 1.960', w: '40%', tone: 'up' as const, src: 'fonte: Binance' },
];

type CellLevel = 0 | 1 | 2 | 3;

const LEVEL_BG = ['bg-active', 'bg-up-bg', 'bg-warn-bg', 'bg-down-strong'] as const;
const LEVEL_FG = ['text-text-faint', 'text-up', 'text-warn', 'text-down'] as const;

function makeCell(t: string, lvl: CellLevel) {
  return { t, bgClass: t ? LEVEL_BG[lvl] : 'bg-inset', fgClass: LEVEL_FG[lvl] };
}

const RISK_MATRIX_ROWS = [
  { factor: 'Juro real BR', cells: [makeCell('', 0), makeCell('', 1), makeCell('', 2), makeCell('41%', 3)] },
  { factor: 'Beta cripto', cells: [makeCell('', 0), makeCell('', 1), makeCell('22%', 2), makeCell('', 3)] },
  { factor: 'Petróleo', cells: [makeCell('', 0), makeCell('11%', 1), makeCell('', 2), makeCell('', 3)] },
  { factor: 'USD/BRL', cells: [makeCell('8%', 0), makeCell('', 1), makeCell('', 2), makeCell('', 3)] },
];

const SUGGESTED_ACTIONS = [
  { label: 'Sugerir hedge para o fator juro real' },
  { label: 'Ver as 3 posições que mais caíram' },
];

export default function ChatPage() {
  const [model, setModel] = useState<Model>('claude-sonnet-4-6');
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState(0);
  const [chars, setChars] = useState(0);
  const [activeTheme, setActiveTheme] = useState('Portfólio');
  const [activeIndex, setActiveIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => Math.min(p + 1, 3));
      setChars((c) => (phase >= 2 ? c + 3 : 0));
    }, 900);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase, failed]);

  const streamText = FULL_STREAM_TEXT.slice(0, Math.min(chars * 4, FULL_STREAM_TEXT.length));
  const steps = buildSteps(phase);
  const history = buildHistory(activeTheme, activeIndex);

  function handleRetry() {
    setFailed(false);
    setPhase(0);
    setChars(0);
  }

  function handleNewConversation() {
    setFailed(false);
    setPhase(0);
    setChars(0);
    setActiveTheme('');
    setActiveIndex(-1);
  }

  function handleSelectItem(theme: string, index: number) {
    setActiveTheme(theme);
    setActiveIndex(index);
  }

  function handleSend() {
    setFailed(false);
    setPhase(0);
    setChars(0);
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: '232px 1fr',
        height: 'calc(100vh - 66px)',
        fontSize: '13px',
      }}
    >
      <ChatSidebar
        history={history}
        onNewConversation={handleNewConversation}
        onSelectItem={handleSelectItem}
      />

      <div className="flex flex-col min-w-0">
        <ChatHeader model={model} onModelChange={setModel} />

        <div
          className="flex-1 overflow-y-auto flex flex-col gap-4"
          style={{ padding: '18px 22px' }}
          aria-live="polite"
          aria-label="Conversa com a IA Analyst"
        >
          <UserMessage text="Por que meu portfólio caiu hoje? E qual meu maior risco escondido?" />

          <AIMessage
            model="claude-sonnet-4-6"
            time="14:28"
            sourcesCount={12}
            attribution={ATTRIBUTION_ROWS}
            riskMatrix={RISK_MATRIX_ROWS}
            suggestedActions={SUGGESTED_ACTIONS}
          />

          <UserMessage text="Monte uma tese de energia pro Q4." />

          <StreamingMessage
            model={model}
            steps={steps}
            streamText={streamText}
            phase={phase}
            onSimulateFailure={() => setFailed(true)}
          />

          {failed && <FailureBanner onRetry={handleRetry} />}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={handleSend} sessionCost="US$ 0,142" />
      </div>
    </div>
  );
}
