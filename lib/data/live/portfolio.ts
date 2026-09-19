import 'server-only';

import type { AssetClass, Position } from '../../types';
import { bySymbol } from '../../markets/catalogue';
import { getAccountSnapshot } from '../../accounts';
import { createSupabaseServerClient } from '../../supabase/server';
import { formatBRL, formatQty, money } from '../../money';
import { dayKeyLabel, saoPauloDayKey } from '../../market-clock';
import { summariseMonth, type FiscalFill } from '../../fiscal';
import type {
  ExposureRow,
  FiscalRow,
  PortfolioData,
  RiskMetric,
  TradeRecord,
} from '../views/portfolio';
import { assetPriceBRL, currencyToBRL, loadQuotes, priceOf, type QuoteBook } from './valuation';

const CLASS_COLOR: Record<string, string> = {
  cripto: 'var(--color-class-cripto)',
  'ações': 'var(--color-class-acoes)',
  'renda fixa': 'var(--color-class-renda-fixa)',
  'câmbio': 'var(--color-class-cambio)',
  cambio: 'var(--color-class-cambio)',
  energia: 'var(--color-class-energia)',
  commodities: 'var(--color-class-commodities)',
  'índices': 'var(--color-class-indices)',
  fundos: 'var(--color-class-fundos)',
  Caixa: 'var(--color-text-faint)',
};

const PALETTE = [
  'var(--color-class-cripto)',
  'var(--color-class-acoes)',
  'var(--color-class-renda-fixa)',
  'var(--color-class-cambio)',
  'var(--color-class-energia)',
  'var(--color-class-commodities)',
];

export function currentMonthLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    month: 'long',
    year: 'numeric',
  });
}

export const emptyPortfolio: PortfolioData = {
  positions: [],
  exposureByClass: [],
  exposureByVenue: [],
  exposureByCurrency: [],
  risk: [],
  riskConcentrationWarning: '',
  riskConcentrationSevere: false,
  fiscal: [],
  fiscalNote: '',
  fiscalMonth: currentMonthLabel(),
  trades: [],
  equityCurve: [],
  equityLabels: [],
};

interface ValuedPosition {
  symbol: string;
  venue: string;
  assetClass: AssetClass;
  qty: string;
  avgPriceQuote: number | null;
  lastQuote: number | null;
  valueBRL: number;
  costBRL: number;
}

function pctRows(
  totals: Map<string, number>,
  total: number,
  colorFor: (label: string, i: number) => string,
): ExposureRow[] {
  if (total <= 0) return [];
  return [...totals.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value: formatBRL(money(value)),
      pct: Math.round((value / total) * 1000) / 10,
      color: colorFor(label, i),
    }));
}

function valuePositions(
  raw: { symbol: string; qty: string; costBasis: string }[],
  quotes: QuoteBook,
): ValuedPosition[] {
  const valued: ValuedPosition[] = [];

  for (const row of raw) {
    const entry = bySymbol(row.symbol);
    if (!entry) continue;

    const qty = money(row.qty);
    if (qty.isZero()) continue;

    const last = priceOf(row.symbol, quotes);
    const toBRL = currencyToBRL(entry.quote, quotes);
    const cost = money(row.costBasis);

    valued.push({
      symbol: row.symbol,
      venue: entry.venue,
      assetClass: entry.assetClass,
      qty: row.qty,
      avgPriceQuote: qty.isZero() ? null : cost.div(qty).toNumber(),
      lastQuote: last,
      valueBRL: last !== null && toBRL !== null ? qty.toNumber() * last * toBRL : 0,
      costBRL: toBRL !== null ? cost.toNumber() * toBRL : 0,
    });
  }

  return valued;
}

function toPositions(valued: ValuedPosition[], total: number): Position[] {
  return valued
    .slice()
    .sort((a, b) => b.valueBRL - a.valueBRL)
    .map((p) => {
      const pnl = p.valueBRL - p.costBRL;
      const pct = p.costBRL > 0 ? (pnl / p.costBRL) * 100 : 0;
      const priced = p.lastQuote !== null;

      return {
        symbol: p.symbol,
        venue: p.venue,
        assetClass: p.assetClass,
        qty: formatQty(p.qty),
        avgPrice: p.avgPriceQuote === null ? '—' : formatQty(money(p.avgPriceQuote), 2),
        currentPrice: priced ? formatQty(money(p.lastQuote!), 2) : 'sem cotação',
        pnlOpen: priced ? formatBRL(money(pnl)) : '—',
        pnlOpenPct: priced ? Math.round(pct * 100) / 100 : 0,
        pnlRealized: '—',
        weightPct: total > 0 ? Math.round((p.valueBRL / total) * 1000) / 10 : 0,
      };
    });
}

function buildRisk(
  valued: ValuedPosition[],
  cashBRL: number,
  total: number,
): { risk: RiskMetric[]; warning: string; severe: boolean } {
  if (total <= 0) return { risk: [], warning: '', severe: false };

  const sorted = [...valued].sort((a, b) => b.valueBRL - a.valueBRL);
  const largest = sorted[0];
  const largestPct = largest ? (largest.valueBRL / total) * 100 : 0;
  const investedPct = ((total - cashBRL) / total) * 100;
  const cryptoPct =
    (valued.filter((p) => p.assetClass === 'cripto').reduce((s, p) => s + p.valueBRL, 0) / total) *
    100;
  const unrealized = valued.reduce((s, p) => s + (p.valueBRL - p.costBRL), 0);

  // Only metrics the ledger can actually support. Sharpe, VaR and beta need a
  // return history this app does not store yet, and a made-up number on a risk
  // panel is worse than an absent one.
  const risk: RiskMetric[] = [
    {
      label: 'Maior posição',
      value: `${largestPct.toFixed(1)}%`,
      meta: largest ? largest.symbol : '—',
      tone: largestPct > 40 ? 'down' : 'neutral',
    },
    {
      label: 'Capital alocado',
      value: `${investedPct.toFixed(1)}%`,
      meta: `caixa ${formatBRL(money(cashBRL))}`,
      tone: 'neutral',
    },
    {
      label: 'Exposição cripto',
      value: `${cryptoPct.toFixed(1)}%`,
      meta: `${valued.length} posições`,
      tone: cryptoPct > 70 ? 'down' : 'neutral',
    },
    {
      label: 'Resultado aberto',
      value: formatBRL(money(unrealized)),
      meta: 'marcado a mercado',
      tone: unrealized > 0 ? 'up' : unrealized < 0 ? 'down' : 'neutral',
    },
  ];

  const severe = Boolean(largest && largestPct > 40);
  const base = severe
    ? `${largest.symbol} responde por ${largestPct.toFixed(1)}% do patrimônio — uma queda nesse ativo move a carteira quase inteira.`
    : 'Sem concentração acima de 40%. Sharpe, VaR e beta exigem histórico de retorno que o app ainda não guarda, então não são exibidos.';

  // A position the venue could not price is worth zero in every total above, so
  // every percentage on this panel is measured against a smaller carteira than
  // the real one. Saying so is the difference between a stale number and a lie.
  const unpriced = valued.filter((p) => p.lastQuote === null);
  const warning =
    unpriced.length > 0
      ? `${base} ${unpriced.length} ${unpriced.length === 1 ? 'posição está' : 'posições estão'} sem cotação (${unpriced
          .map((p) => p.symbol)
          .join(', ')}) e ${unpriced.length === 1 ? 'ficou' : 'ficaram'} de fora destes percentuais.`
      : base;

  return { risk, warning, severe };
}

interface FillRow {
  created_at: string;
  qty: string;
  price: string;
  fee: string;
  fee_currency: string;
  orders: { symbol: string; side: string; mode: string; created_at: string } | null;
}

function buildTrades(fills: FillRow[], quotes: QuoteBook): TradeRecord[] {
  return fills
    .filter((f) => f.orders)
    // Sorted on the raw instant. The rendered pt-BR stamp is day-first, so
    // ordering the formatted strings puts 31/01 above 01/02.
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((f) => {
      const order = f.orders!;
      const entry = bySymbol(order.symbol);
      const qty = money(f.qty);
      const price = money(f.price);
      const rate = entry ? (currencyToBRL(entry.quote, quotes) ?? 1) : 1;
      const gross = qty.mul(price);

      return {
        datetime: new Date(f.created_at).toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        asset: order.symbol,
        side: order.side === 'buy' ? ('COMPRA' as const) : ('VENDA' as const),
        qty: formatQty(qty),
        price: formatQty(price, 2),
        total: formatBRL(gross.mul(rate)),
        result: `taxa ${formatQty(money(f.fee), 2)} ${f.fee_currency}`,
        origin: order.mode === 'paper' ? 'paper' : 'real',
      };
    });
}

interface LedgerRow {
  created_at: string;
  amount: string;
  currency: string;
}

// Cumulative deposited capital plus realised cash movement, day by day. This is
// a cash curve, not a mark-to-market one: valuing past holdings would need the
// historical price series the app does not keep, and interpolating it would
// invent a track record.
function buildEquityCurve(
  entries: LedgerRow[],
  quotes: QuoteBook,
): { curve: number[]; labels: string[] } {
  if (entries.length === 0) return { curve: [], labels: [] };

  const byDay = new Map<string, number>();
  for (const e of entries) {
    const rate = currencyToBRL(e.currency, quotes);
    if (rate === null) continue;
    const day = saoPauloDayKey(e.created_at);
    byDay.set(day, (byDay.get(day) ?? 0) + money(e.amount).toNumber() * rate);
  }

  const days = [...byDay.keys()].sort();
  if (days.length < 2) return { curve: [], labels: [] };

  let running = 0;
  const curve: number[] = [];
  for (const day of days) {
    running += byDay.get(day)!;
    curve.push(Math.round(running * 100) / 100);
  }

  return { curve, labels: days.map(dayKeyLabel) };
}

// The month is the São Paulo one, because that is the month the exemption is
// measured in. Slicing the UTC timestamp moved every trade made after 21:00 on
// the last day of a month into the next one, against a header that already read
// the local month.
function buildFiscal(
  fills: FillRow[],
  quotes: QuoteBook,
  mode: 'paper' | 'real',
): { rows: FiscalRow[]; note: string } {
  const entries: FiscalFill[] = fills
    .filter((f) => f.orders)
    .map((f) => {
      const entry = bySymbol(f.orders!.symbol);
      const rate = entry ? (currencyToBRL(entry.quote, quotes) ?? 1) : 1;

      return {
        at: f.created_at,
        side: f.orders!.side === 'sell' ? ('sell' as const) : ('buy' as const),
        grossBRL: money(f.qty).mul(money(f.price)).toNumber() * rate,
        feeBRL: money(f.fee).toNumber() * (currencyToBRL(f.fee_currency, quotes) ?? 1),
      };
    });

  const summary = summariseMonth(entries, new Date());

  const rows: FiscalRow[] = [
    { label: 'Operações no mês', value: String(summary.tradeCount), tone: 'neutral' },
    { label: 'Vendas no mês', value: formatBRL(money(summary.salesBRL)), tone: 'neutral' },
    {
      label: 'Margem até a isenção',
      value: formatBRL(money(summary.headroomBRL)),
      tone: summary.overExemption ? 'down' : 'neutral',
    },
    { label: 'Taxas pagas', value: formatBRL(money(summary.feesBRL)), tone: 'down' },
  ];

  // A simulated fill has no tax consequence at all. Presenting it next to the
  // exemption ceiling without saying so reads as an apuração of real disposals.
  if (mode === 'paper') {
    return {
      rows,
      note:
        'Estes números vêm de operações simuladas (papel) e não geram imposto. ' +
        'Servem para você ver como a apuração ficaria: vendas de cripto acima de ' +
        'R$ 35.000 por mês na pessoa física perdem a isenção, e o imposto incide ' +
        'sobre o ganho, não sobre o volume. O TradeView não calcula DARF.',
    };
  }

  if (summary.overExemption) {
    return {
      rows,
      note:
        `As vendas do mês passaram de R$ 35.000, então a isenção da pessoa física ` +
        'não se aplica a este mês e incide imposto sobre o ganho, não sobre o ' +
        'volume. O TradeView não calcula DARF — leve estes números ao seu contador.',
    };
  }

  return {
    rows,
    note:
      summary.salesBRL > 0
        ? 'Vendas de cripto até R$ 35.000 por mês são isentas na pessoa física. Acima disso incide imposto sobre o ganho, não sobre o volume. O TradeView não calcula DARF — leve estes números ao seu contador.'
        : 'Nenhuma venda registrada neste mês. O TradeView não calcula DARF; estes números servem de insumo para o seu contador.',
  };
}

export async function getLivePortfolio(mode: 'paper' | 'real' = 'paper'): Promise<PortfolioData> {
  const snapshot = await getAccountSnapshot(mode);
  if (!snapshot) return emptyPortfolio;

  const quotes = await loadQuotes();
  const supabase = await createSupabaseServerClient();

  const [fillsResult, ledgerResult] = await Promise.all([
    supabase
      .from('fills')
      .select('created_at, qty, price, fee, fee_currency, orders!inner(symbol, side, mode, created_at)')
      .eq('orders.mode', mode)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('ledger_entries')
      .select('created_at, amount, currency, accounts!inner(kind)')
      .eq('accounts.kind', mode)
      .order('created_at', { ascending: true })
      .limit(1000),
  ]);

  const fills = (fillsResult.data ?? []) as unknown as FillRow[];
  const ledger = (ledgerResult.data ?? []) as unknown as LedgerRow[];

  const valued = valuePositions(
    snapshot.positions.map((p) => ({ symbol: p.symbol, qty: p.qty, costBasis: p.costBasis })),
    quotes,
  );

  let cashBRL = 0;
  const currencyTotals = new Map<string, number>();
  for (const [currency, amount] of Object.entries(snapshot.cashByCurrency)) {
    const rate = currencyToBRL(currency, quotes);
    if (rate === null) continue;
    const brl = money(amount).toNumber() * rate;
    if (brl <= 0) continue;
    cashBRL += brl;
    currencyTotals.set(currency, (currencyTotals.get(currency) ?? 0) + brl);
  }

  for (const p of valued) {
    const base = bySymbol(p.symbol)?.base ?? p.symbol;
    const priceBRL = assetPriceBRL(base, quotes);
    if (priceBRL === null) continue;
    currencyTotals.set(base, (currencyTotals.get(base) ?? 0) + p.valueBRL);
  }

  const investedBRL = valued.reduce((s, p) => s + p.valueBRL, 0);
  const total = investedBRL + cashBRL;

  const classTotals = new Map<string, number>();
  for (const p of valued) {
    classTotals.set(p.assetClass, (classTotals.get(p.assetClass) ?? 0) + p.valueBRL);
  }
  if (cashBRL > 0) classTotals.set('Caixa', cashBRL);

  const venueTotals = new Map<string, number>();
  for (const p of valued) {
    venueTotals.set(p.venue, (venueTotals.get(p.venue) ?? 0) + p.valueBRL);
  }
  if (cashBRL > 0) venueTotals.set('Caixa', cashBRL);

  const { risk, warning, severe } = buildRisk(valued, cashBRL, total);
  const { curve, labels } = buildEquityCurve(ledger, quotes);
  const fiscal = buildFiscal(fills, quotes, mode);

  return {
    positions: toPositions(valued, total),
    exposureByClass: pctRows(classTotals, total, (label) => CLASS_COLOR[label] ?? PALETTE[0]),
    exposureByVenue: pctRows(venueTotals, total, (label, i) =>
      label === 'Caixa' ? 'var(--color-text-faint)' : PALETTE[i % PALETTE.length],
    ),
    exposureByCurrency: pctRows(currencyTotals, total, (label, i) =>
      CLASS_COLOR[label] ?? PALETTE[i % PALETTE.length],
    ),
    risk,
    riskConcentrationWarning: warning,
    riskConcentrationSevere: severe,
    fiscal: fiscal.rows,
    fiscalNote: fiscal.note,
    fiscalMonth: currentMonthLabel(),
    trades: buildTrades(fills, quotes),
    equityCurve: curve,
    equityLabels: labels,
  };
}
