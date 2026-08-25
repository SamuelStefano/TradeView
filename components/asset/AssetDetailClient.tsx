'use client';

import { useState } from 'react';
import type { AssetClass, Candle } from '@/lib/types';
import type { AssetDetailData, NewsItem } from '@/lib/data/mock/assets';
import { ASSET_CLASSES } from '@/lib/types';
import { TIMEFRAMES, INDICATORS } from '@/lib/data/mock/assets';
import { toneOf, toneClass } from '@/lib/format';
import { FreshnessTag } from '@/components/ui/FreshnessTag';
import { Tabs } from '@/components/ui/Tabs';
import { Bar } from '@/components/ui/Bar';
import { useRadioGroup } from '@/components/ui/useRadioGroup';
import { Candlestick } from '@/components/charts/Candlestick';
import { PanelRenderer } from '@/components/panels/PanelRenderer';

interface Props {
  initialClass: AssetClass;
  allData: Record<AssetClass, AssetDetailData>;
}

type TabId = 'ai' | 'news' | 'corr';
type IndicatorKey = (typeof INDICATORS)[number];

function OHLCTable({ candles }: { candles: Candle[] }) {
  const rows = candles.slice(-14).reverse().map((c, i) => {
    const isUp = c.close >= c.open;
    return {
      t: `${String(13 - i).padStart(2, '0')}:00`,
      o: c.open.toFixed(2),
      h: c.high.toFixed(2),
      l: c.low.toFixed(2),
      c: c.close.toFixed(2),
      col: isUp ? 'var(--color-up)' : 'var(--color-down)',
      v: (c.volume * 1000).toFixed(0),
    };
  });

  return (
    <div role="table" aria-label="OHLC em tabela" style={{ maxHeight: '300px', overflowY: 'auto' }}>
      <div
        role="rowgroup"
        className="font-mono tabular-nums"
        style={{
          display: 'grid',
          gridTemplateColumns: '70px repeat(5, 1fr)',
          fontSize: '11px',
        }}
      >
        <div role="columnheader" className="text-text-faint px-1.5 py-1">hora</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">abert.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">máx.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">mín.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">fech.</div>
        <div role="columnheader" className="text-text-faint px-1.5 py-1 text-right">volume</div>
        {rows.map((row, i) => (
          <div key={i} role="row" style={{ display: 'contents' }}>
            <div role="cell" className="px-1.5 py-1 text-text-muted border-t border-divider">{row.t}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider">{row.o}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider">{row.h}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider">{row.l}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider" style={{ color: row.col }}>{row.c}</div>
            <div role="cell" className="px-1.5 py-1 text-right border-t border-divider text-text-muted">{row.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsTab({ news }: { news: NewsItem[] }) {
  return (
    <div className="py-3 flex flex-col gap-0.5">
      {news.map((n, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 py-1.5 px-1 border-b border-divider"
        >
          <span className="font-mono text-text-faint w-9 shrink-0" style={{ fontSize: '10px' }}>
            {n.ago}
          </span>
          <a
            href={n.url}
            className="text-text flex-1 min-w-0 hover:text-accent-hover transition-colors"
            style={{ fontSize: '12px' }}
          >
            {n.title}
          </a>
          <span className="text-text-faint shrink-0" style={{ fontSize: '10px' }}>
            {n.source}
          </span>
          <span
            className={`font-mono w-10 text-right shrink-0 ${
              n.sentimentTone === 'up'
                ? 'text-up'
                : n.sentimentTone === 'down'
                ? 'text-down'
                : 'text-text-muted'
            }`}
            style={{ fontSize: '10.5px' }}
          >
            {n.sentimentScore}
          </span>
          <Bar
            value={n.relevancePct}
            variant="accent"
            label={`relevância ${n.relevancePct}%`}
            className="w-11 shrink-0"
          />
        </div>
      ))}
    </div>
  );
}

function CorrTab({ correlations }: { correlations: { symbol: string; value: number }[] }) {
  const pos = correlations.filter((c) => c.value >= 0);
  const neg = correlations.filter((c) => c.value < 0);

  return (
    <div
      className="py-3"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
    >
      <div>
        <div
          className="text-text-faint mb-2"
          style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Anda junto
        </div>
        {pos.map((c) => (
          <div key={c.symbol} className="flex items-center gap-2 py-1">
            <span className="font-mono text-text shrink-0" style={{ fontSize: '11.5px', width: '90px' }}>
              {c.symbol}
            </span>
            <Bar
              value={c.value * 100}
              variant="up"
              label={`correlação positiva ${c.value.toFixed(2).replace('.', ',')}`}
              className="flex-1"
            />
            <span className="font-mono text-up w-10 text-right shrink-0" style={{ fontSize: '11px' }}>
              {c.value.toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}
      </div>
      <div>
        <div
          className="text-text-faint mb-2"
          style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Anda contra
        </div>
        {neg.map((c) => (
          <div key={c.symbol} className="flex items-center gap-2 py-1">
            <span className="font-mono text-text shrink-0" style={{ fontSize: '11.5px', width: '90px' }}>
              {c.symbol}
            </span>
            <Bar
              value={Math.abs(c.value) * 100}
              variant="down"
              label={`correlação negativa ${c.value.toFixed(2).replace('.', ',')}`}
              className="flex-1"
            />
            <span className="font-mono text-down w-10 text-right shrink-0" style={{ fontSize: '11px' }}>
              {c.value.toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <span className="text-text-faint" style={{ fontSize: '10px' }}>
          janela 90 dias · retornos diários ·{' '}
          <a href="#" className="text-accent hover:text-accent-hover">
            metodologia
          </a>
        </span>
      </div>
    </div>
  );
}

function AITab({ ai }: { ai: AssetDetailData['ai'] }) {
  return (
    <div className="py-3.5 flex flex-col gap-3">
      <p className="text-text-secondary leading-relaxed" style={{ fontSize: '12.5px' }}>
        {ai.thesis}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {ai.scenarios.map((sc) => {
          const isUp = sc.label === 'BULL' || sc.label === 'ALTA';
          const isDown = sc.label === 'BEAR' || sc.label === 'BAIXA';
          const color = isUp ? 'var(--color-up)' : isDown ? 'var(--color-down)' : 'var(--color-accent)';
          const borderColor = isUp ? 'var(--color-up-border)' : isDown ? 'var(--color-danger-border)' : 'var(--color-accent-border)';
          return (
            <div
              key={sc.label}
              className="bg-inset rounded-lg p-2.5"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ fontSize: '11px', color }}>
                  {sc.label}
                </span>
                <span className="ml-auto font-mono" style={{ fontSize: '12px', color }}>
                  {sc.prob}%
                </span>
              </div>
              <Bar
                value={sc.prob}
                variant={isUp ? 'up' : isDown ? 'down' : 'accent'}
                label={`probabilidade ${sc.prob}%`}
                className="my-1.5"
              />
              <div className="font-mono mb-1" style={{ fontSize: '11.5px' }}>
                {sc.target}
              </div>
              <div className="text-text-muted leading-snug" style={{ fontSize: '10.5px' }}>
                {sc.text}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div
            className="text-text-faint mb-1.5"
            style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Riscos
          </div>
          {ai.risks.map((r, i) => (
            <div key={i} className="text-text-secondary py-0.5 leading-snug" style={{ fontSize: '11.5px' }}>
              · {r}
            </div>
          ))}
        </div>
        <div>
          <div
            className="text-text-faint mb-1.5"
            style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            O que invalidaria a tese
          </div>
          {ai.invalidations.map((iv, i) => (
            <div key={i} className="text-warn py-0.5 leading-snug" style={{ fontSize: '11.5px' }}>
              ✕ {iv}
            </div>
          ))}
        </div>
      </div>
      <div className="text-text-faint" style={{ fontSize: '10.5px' }}>
        fontes:{' '}
        {ai.sources.map((s, i) => (
          <span key={i}>
            <a href={s.url} className="text-accent hover:text-accent-hover">
              {s.label}
            </a>
            {i < ai.sources.length - 1 && ' · '}
          </span>
        ))}
        <span className="ml-2.5 font-mono">
          gerado há {ai.generatedAgo} · {ai.model}
        </span>
      </div>
    </div>
  );
}

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

      <div className="flex items-center gap-4 bg-surface border border-border rounded-lg px-3.5 py-2.5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold" style={{ fontSize: '16px' }}>
              {asset.symbol}
            </span>
            <span className="text-text-faint" style={{ fontSize: '11px' }}>
              {asset.venue}
            </span>
          </div>
          <div className="text-text-muted" style={{ fontSize: '11px' }}>
            {asset.name}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono tabular-nums font-semibold" style={{ fontSize: '20px' }}>
            {asset.price}
          </div>
          <div
            className={`font-mono tabular-nums ${toneClass(tone)}`}
            style={{ fontSize: '12px' }}
          >
            {asset.change}
          </div>
        </div>
        <div
          className="flex gap-3.5 ml-2 pl-4"
          style={{ borderLeft: '1px solid var(--color-border)' }}
        >
          {asset.stats.map((st) => (
            <div key={st.key}>
              <div
                className="text-text-faint"
                style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}
              >
                {st.key}
              </div>
              <div className="font-mono tabular-nums text-right" style={{ fontSize: '12px' }}>
                {st.value}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <FreshnessTag
          freshness={asset.freshness}
          className="border border-border-strong rounded px-1.5 py-0.5"
        />
        <button
          className="cursor-pointer hover:border-border-hover transition-colors"
          style={{
            height: '30px',
            padding: '0 14px',
            background: 'var(--color-hover)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: '12px',
            fontFamily: 'inherit',
          }}
        >
          + Alerta
        </button>
        <button
          className="cursor-pointer"
          style={{
            height: '30px',
            padding: '0 14px',
            background: 'var(--color-accent-bg)',
            border: '1px solid var(--color-accent-border)',
            borderRadius: '6px',
            color: 'var(--color-accent-hover)',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          Ordem…
        </button>
      </div>

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
                title="desenhar linha de tendência"
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
    </div>
  );
}
