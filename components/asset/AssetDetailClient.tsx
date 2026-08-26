'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AssetClass } from '@/lib/types';
import type { AssetDetailData } from '@/lib/data/views/assets';
import { ASSET_CLASSES } from '@/lib/types';
import { INDICATORS } from '@/lib/data/views/assets';
import { TIMEFRAMES, type Timeframe } from '@/lib/markets/timeframes';
import { toneOf } from '@/lib/format';
import { FreshnessTag } from '@/components/ui/FreshnessTag';
import { Tabs } from '@/components/ui/Tabs';
import { useRadioGroup } from '@/components/ui/useRadioGroup';
import { Candlestick } from '@/components/charts/Candlestick';
import { PanelRenderer } from '@/components/panels/PanelRenderer';
import { OHLCTable } from './OHLCTable';
import { NewsTab } from './NewsTab';
import { CorrTab } from './CorrTab';
import { AITab } from './AITab';
import { AssetHeader } from './AssetHeader';

export interface CatalogueOption {
  symbol: string;
  slug: string;
  assetClass: AssetClass;
}

interface Props {
  data: AssetDetailData;
  timeframe: Timeframe;
  catalogue: CatalogueOption[];
}

type TabId = 'ai' | 'news' | 'corr';
type IndicatorKey = (typeof INDICATORS)[number];

export function AssetDetailClient({ data, timeframe, catalogue }: Props) {
  const router = useRouter();
  const { asset, panels, candles, markers, news, correlations } = data;

  const tfGroup = useRadioGroup(TIMEFRAMES, timeframe, (t) => go(asset.symbol, t));
  const [activeTab, setActiveTab] = useState<TabId>('ai');
  const [indicators, setIndicators] = useState<Record<IndicatorKey, boolean>>({
    MA: true,
    BB: false,
    VOL: true,
  });
  const [showTable, setShowTable] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const tone = toneOf(asset.changePct);
  const covered = new Set(catalogue.map((c) => c.assetClass));

  function go(symbol: string, tf: Timeframe) {
    const slug = catalogue.find((c) => c.symbol === symbol)?.slug;
    if (slug) router.push(`/asset/${slug}?tf=${tf}`);
  }

  const tabs = [
    { id: 'ai', label: '✦ Análise da IA', content: <AITab symbol={asset.symbol} /> },
    { id: 'news', label: 'Notícias & sentimento', content: <NewsTab news={news} /> },
    { id: 'corr', label: 'Correlações', content: <CorrTab correlations={correlations} venue={asset.venue} /> },
  ];

  function toggleIndicator(key: IndicatorKey) {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-2.5 p-3.5 text-xs">
      <div className="flex gap-2 flex-wrap items-center">
        <label className="flex items-center gap-1.5 text-text-faint" style={{ fontSize: '11px' }}>
          Ativo
          <select
            value={asset.symbol}
            onChange={(e) => go(e.target.value, timeframe)}
            className="bg-chrome border border-border rounded-md text-text font-mono outline-none focus-visible:border-accent-border"
            style={{ height: 26, padding: '0 8px', fontSize: '11.5px' }}
          >
            {catalogue.map((c) => (
              <option key={c.slug} value={c.symbol}>
                {c.symbol}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-1 flex-wrap" aria-label="Classes de ativo">
          {ASSET_CLASSES.map((cls) => {
            const has = covered.has(cls);
            const active = has && cls === asset.assetClass;
            return (
              <span
                key={cls}
                title={has ? undefined : 'sem fonte de dados conectada'}
                className="flex items-center"
                style={{
                  height: '26px',
                  padding: '0 11px',
                  borderRadius: '6px',
                  border: `1px solid ${active ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-active)' : 'var(--color-chrome)',
                  color: has ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
                  fontSize: '11.5px',
                  fontWeight: active ? 600 : 400,
                  opacity: has ? 1 : 0.45,
                }}
              >
                {cls.charAt(0).toUpperCase() + cls.slice(1)}
                {!has && ' ·'}
              </span>
            );
          })}
        </div>

        <span className="ml-auto text-text-faint" style={{ fontSize: '10.5px' }}>
          classes esmaecidas não têm fonte ligada
        </span>
      </div>

      <AssetHeader asset={asset} tone={tone} />

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
                const isActive = timeframe === t;
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

          {candles.length === 0 ? (
            <div className="py-10 text-center text-text-faint" style={{ fontSize: '12px' }}>
              A venue não retornou candles para {asset.symbol} em {timeframe}.
            </div>
          ) : !showTable ? (
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
                <span className="ml-auto">
                  {timeframe} · {asset.venue} · {candles.length} candles ·{' '}
                  <FreshnessTag freshness={asset.freshness} />
                </span>
              </div>
            </>
          ) : (
            <OHLCTable candles={candles} />
          )}

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
    </div>
  );
}
