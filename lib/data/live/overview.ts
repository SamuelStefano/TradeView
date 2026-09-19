import 'server-only';

import type { AssetClass } from '../../types';
import { TRADABLE, VENUES, VENUE_INFO, byVenue, bySymbol, toSlug } from '../../markets/catalogue';
import { getAccountSnapshot } from '../../accounts';
import { formatBRL, formatQty, money } from '../../money';
import type {
  AllocationSlice,
  HeatmapRow,
  OverviewData,
  PnlCard,
  WatchlistItem,
} from '../views/overview';
import { emptyOverview } from '../views/overview';
import { freshnessOf } from '../../markets/freshness';
import { currencyToBRL, loadQuotes, priceOf, usdtToBRL, type QuoteBook } from './valuation';

const CLASS_COLOR: Record<string, string> = {
  cripto: 'var(--color-class-cripto)',
  'ações': 'var(--color-class-acoes)',
  'renda fixa': 'var(--color-class-renda-fixa)',
  'câmbio': 'var(--color-class-cambio)',
  energia: 'var(--color-class-energia)',
  commodities: 'var(--color-class-commodities)',
  'índices': 'var(--color-class-indices)',
  fundos: 'var(--color-class-fundos)',
};

function money2(value: number, currency: string): string {
  const decimals = value >= 1000 ? 2 : value >= 1 ? 2 : 6;
  return currency === 'BRL'
    ? `R$ ${formatQty(money(value), decimals)}`
    : `${formatQty(money(value), decimals)} ${currency}`;
}

// The heatmap groups by venue rather than by asset class: the venue is what
// actually served the number, so a row can never imply coverage of a market
// nothing is connected to.
function buildHeatmap(quotes: QuoteBook): HeatmapRow[] {
  const rows: HeatmapRow[] = [];

  for (const venue of VENUES) {
    const cells = byVenue(venue)
      .map((t) => ({ symbol: t.symbol, quote: quotes.get(t.symbol) }))
      .filter((c) => c.quote?.changePct != null)
      .map((c) => ({ symbol: c.symbol.split('/')[0], changePct: c.quote!.changePct! }))
      .sort((a, b) => b.changePct - a.changePct);

    if (cells.length > 0) {
      rows.push({ label: VENUE_INFO[venue]?.name ?? venue, cells });
    }
  }

  return rows;
}

function buildWatchlist(quotes: QuoteBook, now: number): WatchlistItem[] {
  const items: WatchlistItem[] = [];

  for (const t of TRADABLE) {
    const quote = quotes.get(t.symbol);
    if (!quote) continue;

    const venueName = VENUE_INFO[t.venue]?.name ?? t.venue;

    items.push({
      symbol: t.symbol,
      slug: toSlug(t.symbol),
      name: venueName,
      price: money2(quote.last, t.quote),
      changePct: quote.changePct ?? 0,
      // The tickers carry no price series and pulling daily candles per symbol
      // would mean one request per row on every render. The price and the 24h
      // change are measured; a drawn trend would not be.
      spark: [],
      freshness: freshnessOf(quote.observedAt, now, venueName),
    });
  }

  return items.sort((a, b) => b.changePct - a.changePct);
}

interface Valued {
  assetClass: AssetClass;
  valueBRL: number;
  costBRL: number;
}

export async function getLiveOverview(): Promise<OverviewData> {
  const quotes = await loadQuotes();

  const heatmap = buildHeatmap(quotes);
  const watchlist = buildWatchlist(quotes, Date.now());

  const usdRate = usdtToBRL(quotes);
  const fx = {
    // USDT/BRL from the venue's own book, not PTAX: this app never calls the
    // central bank, and labelling the venue rate as PTAX would be a false source.
    fxRate: usdRate !== null ? formatQty(money(usdRate), 4) : '—',
    fxSource: usdRate !== null ? 'USDT/BRL · OKX' : 'sem cotação',
  };

  const snapshot = await getAccountSnapshot('paper').catch(() => null);
  if (!snapshot) {
    return { ...emptyOverview, heatmap, watchlist, netWorth: { ...emptyOverview.netWorth, ...fx } };
  }

  const valued: Valued[] = [];
  for (const p of snapshot.positions) {
    const entry = bySymbol(p.symbol);
    if (!entry) continue;

    const qty = money(p.qty);
    if (qty.isZero()) continue;

    const last = priceOf(p.symbol, quotes);
    const toBRL = currencyToBRL(entry.quote, quotes);
    if (last === null || toBRL === null) continue;

    valued.push({
      assetClass: entry.assetClass,
      valueBRL: qty.toNumber() * last * toBRL,
      costBRL: money(p.costBasis).toNumber() * toBRL,
    });
  }

  let cashBRL = 0;
  for (const b of snapshot.balances) {
    const rate = currencyToBRL(b.currency, quotes);
    if (rate !== null) cashBRL += money(b.balance).toNumber() * rate;
  }

  const investedBRL = valued.reduce((s, v) => s + v.valueBRL, 0);
  const costBRL = valued.reduce((s, v) => s + v.costBRL, 0);
  const totalBRL = investedBRL + cashBRL;
  const unrealized = investedBRL - costBRL;

  const byClass = new Map<AssetClass, number>();
  for (const v of valued) byClass.set(v.assetClass, (byClass.get(v.assetClass) ?? 0) + v.valueBRL);

  const allocation: AllocationSlice[] = [...byClass.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([assetClass, value]) => ({
      label: assetClass,
      pct: totalBRL > 0 ? Math.round((value / totalBRL) * 1000) / 10 : 0,
      value: formatBRL(money(value)),
      color: CLASS_COLOR[assetClass] ?? 'var(--color-accent)',
    }));

  if (cashBRL > 0 && totalBRL > 0) {
    allocation.push({
      label: 'caixa',
      pct: Math.round((cashBRL / totalBRL) * 1000) / 10,
      value: formatBRL(money(cashBRL)),
      color: 'var(--color-text-faint)',
    });
  }

  // Only the two figures the ledger can support. P&L by day, week and month
  // needs a mark-to-market history the app does not record, and interpolating
  // one would invent a track record.
  const pnlCards: PnlCard[] = [
    {
      label: 'Resultado aberto',
      value: formatBRL(money(unrealized)),
      pct: costBRL > 0 ? Math.round((unrealized / costBRL) * 10000) / 100 : 0,
    },
    {
      label: 'Capital aplicado',
      value: formatBRL(money(investedBRL)),
      pct: totalBRL > 0 ? Math.round((investedBRL / totalBRL) * 10000) / 100 : 0,
    },
  ];

  const accountNote =
    totalBRL > 0
      ? ''
      : 'Conta paper sem saldo. Deposite na mesa para o patrimônio sair de zero.';

  return {
    netWorth: {
      brl: formatBRL(money(totalBRL)),
      usd: usdRate !== null && usdRate > 0 ? `US$ ${formatQty(money(totalBRL / usdRate), 2)}` : '—',
      ...fx,
    },
    pnlCards,
    allocation,
    heatmap,
    watchlist,
    accountNote,
  };
}
