'use client';

import { useState } from 'react';
import type { AssetClass } from '@/lib/types';
import type { AssetDetailData } from '@/lib/data/mock/assets';
import { ASSET_CLASSES } from '@/lib/types';
import { TIMEFRAMES, INDICATORS } from '@/lib/data/mock/assets';
import { toneOf } from '@/lib/format';
import { FreshnessTag } from '@/components/ui/FreshnessTag';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { useRadioGroup } from '@/components/ui/useRadioGroup';
import { Candlestick } from '@/components/charts/Candlestick';
import { PanelRenderer } from '@/components/panels/PanelRenderer';
import { OHLCTable } from './OHLCTable';
import { NewsTab } from './NewsTab';
import { CorrTab } from './CorrTab';
import { AITab } from './AITab';
import { AssetHeader } from './AssetHeader';

interface Props {
  initialClass: AssetClass;
  allData: Record<AssetClass, AssetDetailData>;
}

type TabId = 'ai' | 'news' | 'corr';
type IndicatorKey = (typeof INDICATORS)[number];

export function AssetDetailClient({ initialClass, allData }: Props) {
  const [activeClass, setActiveClass] = useState<AssetClass>(initialClass);
  const [tf, setTf] = useState<string>('1h');
  const classGroup = useRadioGroup(ASSET_CLASSES, activeClass, setActiveClass);
  const tfGroup = useRadioGroup(TIMEFRAMES, tf, setTf);
  const [activeTab, setActiveTab] = useState<TabId>('ai');
  const [indicators, setIndicators] = useState<Record<IndicatorKey, boolean>>({
    MA: true,
    EMA: false,
    RSI: false,
    MACD: false,
    BB: false,
    VOL: true,
  });
  const [showTable, setShowTable] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  const data = allData[activeClass];
  const { asset, panels, candles, markers, ai, news, correlations } = data;
  const tone = toneOf(asset.changePct);

  const tabs = [
    { id: 'ai', label: '✦ Análise da IA', content: <AITab ai={ai} /> },
    { id: 'news', label: 'Notícias & sentimento', content: <NewsTab news={news} /> },
    { id: 'corr', label: 'Correlações', content: <CorrTab correlations={correlations} /> },
  ];

  function toggleIndicator(key: IndicatorKey) {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const chartFooter = `${tf} · ${asset.venue} · `;

  return (
    <div className="flex flex-col gap-2.5 p-3.5 text-xs">
      <div className="flex gap-1 flex-wrap items-center">
        <div role="radiogroup" aria-label="Classe de ativo" className="flex gap-1 flex-wrap" {...classGroup.groupProps}>
        {ASSET_CLASSES.map((cls) => {
          const isActive = activeClass === cls;
          return (
            <button
              key={cls}
              {...classGroup.itemProps(cls)}
              className="cursor-pointer transition-colors"
              style={{
                height: '26px',
                padding: '0 11px',
                borderRadius: '6px',
                border: `1px solid ${isActive ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                background: isActive ? 'var(--color-active)' : 'var(--color-chrome)',
                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontSize: '11.5px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {cls.charAt(0).toUpperCase() + cls.slice(1)}
            </button>
          );
        })}
        </div>
        <span className="ml-auto text-text-faint" style={{ fontSize: '10.5px' }}>
          mesma tela, painéis declarados pela classe
        </span>
      </div>

      <AssetHeader asset={asset} tone={tone} onOrderClick={() => setOrderOpen(true)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 316px', gap: '10px', alignItems: 'start' }}>
        <section
          aria-label="Gráfico"
          className="bg-surface border border-border rounded-lg p-3 min-w-0"
        >
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <div
              role="radiogroup"
              aria-label="Timeframe"
              className="flex gap-0.5 bg-inset border border-border rounded-md p-0.5"
              {...tfGroup.groupProps}
            >
              {TIMEFRAMES.map((t) => {
                const isActive = tf === t;
                return (
                  <button
                    key={t}
                    {...tfGroup.itemProps(t)}
                    className="cursor-pointer transition-colors font-mono"
                    style={{
                      height: '22px',
                      padding: '0 8px',
                      border: 'none',
                      borderRadius: '4px',
                      background: isActive ? 'var(--color-accent-bg-soft)' : 'transparent',
                      color: isActive ? 'var(--color-text)' : 'var(--color-text-faint)',
                      fontSize: '10.5px',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {INDICATORS.map((ind) => {
                const isOn = indicators[ind];
                return (
                  <button
                    key={ind}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => toggleIndicator(ind)}
                    className="cursor-pointer transition-colors font-mono"
                    style={{
                      height: '22px',
                      padding: '0 8px',
                      border: `1px solid ${isOn ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                      borderRadius: '4px',
                      background: isOn ? 'var(--color-accent-bg)' : 'var(--color-chrome)',
                      color: isOn ? 'var(--color-accent-hover)' : 'var(--color-text-faint)',
                      fontSize: '10px',
                    }}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto flex gap-1.5 items-center">
              <button
                type="button"
                onClick={() => setShowTrend((v) => !v)}
                aria-pressed={showTrend}
                title="linha de tendência por regressão linear sobre os fechamentos"
                className="cursor-pointer"
                style={{
                  height: '22px',
                  padding: '0 8px',
                  border: `1px solid ${showTrend ? 'var(--color-accent-border)' : 'var(--color-border-strong)'}`,
                  borderRadius: '4px',
                  background: showTrend ? 'var(--color-accent-bg)' : 'var(--color-chrome)',
                  color: showTrend ? 'var(--color-accent-hover)' : 'var(--color-text-muted)',
                  fontSize: '10.5px',
                  fontFamily: 'inherit',
                }}
              >
                ✎ tendência
              </button>
              <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                className="cursor-pointer"
                style={{
                  height: '22px',
                  padding: '0 8px',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '4px',
                  background: 'var(--color-chrome)',
                  color: 'var(--color-text-muted)',
                  fontSize: '10.5px',
                  fontFamily: 'inherit',
                }}
              >
                {showTable ? '▦ gráfico' : '≣ tabela'}
              </button>
            </div>
          </div>

          {!showTable && (
            <>
              <Candlestick
                candles={candles}
                markers={markers}
                showMA={indicators.MA}
                showBB={indicators.BB}
                showVOL={indicators.VOL}
                showTrend={showTrend}
                label={`Gráfico candlestick de ${asset.symbol}; alternativa em tabela disponível pelo botão tabela`}
              />
              <div className="flex gap-3.5 mt-1.5 font-mono text-text-faint" style={{ fontSize: '9.5px' }}>
                <span>
                  <span style={{ color: 'var(--color-warn)' }}>—</span> MA(21)
                </span>
                <span>
                  <span style={{ color: 'var(--color-ai)' }}>✦</span> sinal IA
                </span>
                <span>
                  <span style={{ color: 'var(--color-up)' }}>▲</span>/
                  <span style={{ color: 'var(--color-down)' }}>▼</span> trade executado
                </span>
                <span className="ml-auto">
                  {chartFooter}
                  <FreshnessTag freshness={asset.freshness} />
                </span>
              </div>
            </>
          )}
          {showTable && <OHLCTable candles={candles} />}

          <Tabs
            items={tabs}
            label="Análises"
            value={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
            className="mt-3"
          />
        </section>

        <PanelRenderer panels={panels} />
      </div>

      <Modal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        label={`Ordem em ${asset.symbol}`}
        className="p-5 max-w-[420px]"
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm font-bold text-text">Ordem em {asset.symbol}</div>
          <p className="text-[11.5px] text-text-secondary leading-[1.5] m-0">
            O roteamento de ordens entra na fase 2, atrás do gate de paper trading. Toda
            ordem passa primeiro por execução simulada com custo real — spread, taxa e
            slippage do book — e alimenta o ledger.
          </p>
          <p className="text-[11.5px] text-text-muted leading-[1.5] m-0">
            Capital real só é liberado após 60–90 dias de track record calibrado.
          </p>
          <button
            onClick={() => setOrderOpen(false)}
            className="h-8 bg-hover border border-border-strong rounded-md text-text-secondary text-xs cursor-pointer hover:text-text"
          >
            Entendi
          </button>
        </div>
      </Modal>
    </div>
  );
}
