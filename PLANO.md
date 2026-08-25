# TradeView — Plano de Implementação

Documento de trabalho para os agentes executores. Leia inteiro antes de escrever qualquer linha.

Repo: `SamuelStefano/TradeView` · branch `main` · Next.js na Vercel.

---

## 0. O que estamos construindo

Terminal de trading multi-mercado com camada de análise por IA. **Não é uma corretora.** É um copiloto analítico: agrega dados de muitos mercados, normaliza num modelo único, e uma camada de IA produz teses, sinais e alertas. Execução de ordem existe na UI, mas é sempre confirmada por humano.

O design já está pronto e é a fonte da verdade. Não invente tela, não invente componente, não "melhore" o layout.

### Escopo desta fase

**Fase 1 = fidelidade visual + arquitetura de dados correta, com dados mockados.**

Nenhuma integração real de exchange entra agora. Os mocks ficam atrás da mesma interface que os adapters reais vão implementar depois, então a troca é plugar um adapter — não reescrever tela.

Motivos: credencial de exchange não pode ir pro bundle; as decisões de ledger/scorecard ainda estão abertas; e o deploy tem que sair hoje.

**Não faça** chamada de rede pra exchange, não instale `ccxt`, não crie rota de ordem real, não peça API key em lugar nenhum.

---

## 1. Onde está o design

`/home/samuel/trading-bot/design/*.dc.html` — 10 telas. **Leia o arquivo da sua tela antes de implementar.**

O formato é `x-dc` (Claude Design). Traduza assim:

| No design | Em React |
|---|---|
| `<sc-for list="{{ xs }}" as="x">` | `{xs.map(x => ...)}` |
| `<sc-if value="{{ cond }}">` | `{cond && ...}` |
| `{{ expr }}` | `{expr}` |
| `class Component extends DCLogic` / `state` | `useState` no componente |
| `renderVals()` | corpo do componente |
| `onClick="{{ fn }}"` | `onClick={fn}` |
| `style-hover="..."` | classe Tailwind `hover:` |
| `<dc-import name="X">` | `<X />` |

`support.js` é runtime gerado do framework de design — **ignore, não porte, não leia.**

O `renderVals()` de cada tela contém os dados mockados completos (textos em pt-BR, números, cores). **Copie esses dados literalmente** para os arquivos de mock. Eles foram escritos com cuidado e são o conteúdo do produto.

### Mapa tela → rota → arquivo

| Design | Rota | Arquivo |
|---|---|---|
| `Terminal.dc.html` | *(shell)* | `app/(terminal)/layout.tsx` |
| `Overview.dc.html` | `/` | `app/(terminal)/page.tsx` |
| `Markets.dc.html` | `/markets` | `app/(terminal)/markets/page.tsx` |
| `AssetDetail.dc.html` | `/asset/[symbol]` | `app/(terminal)/asset/[symbol]/page.tsx` |
| `AIChat.dc.html` | `/chat` | `app/(terminal)/chat/page.tsx` |
| `Strategies.dc.html` | `/strategies` | `app/(terminal)/strategies/page.tsx` |
| `Portfolio.dc.html` | `/portfolio` | `app/(terminal)/portfolio/page.tsx` |
| `Alerts.dc.html` | `/alerts` | `app/(terminal)/alerts/page.tsx` |
| `Analytics.dc.html` | `/analytics` | `app/(terminal)/analytics/page.tsx` |
| `Settings.dc.html` | `/settings` | `app/(terminal)/settings/page.tsx` |
| `Onboarding.dc.html` | `/onboarding` | `app/onboarding/page.tsx` *(fora do shell)* |

---

## 2. Stack — travada, não discuta

- **Next.js 16.3.3** (App Router, Turbopack) + **React 19.2.8** + **TypeScript strict**
- **Tailwind CSS v4** — tokens via `@theme` no CSS, sem `tailwind.config.js`
- **Geist** + **Geist Mono** via `next/font/google`
- **lucide-react** para ícones
- Gráficos: **SVG inline**, exatamente como o design faz. Sem lib de chart nesta fase.
- Sem estado global. `useState` local + props. Sem Redux/Zustand/Jotai.
- Sem shadcn nesta fase — os componentes do design são específicos demais, wrapper genérico atrapalha.

Nada além disso. Se achar que precisa de uma dependência nova, **pergunte antes**.

### 2.1 Next.js 16 — armadilhas que quebram o build

Este **não** é o Next.js que você conhece do treino. O que você aprendeu do Next 13/14/15 está desatualizado em pontos críticos. Se bater dúvida, leia o guia em `node_modules/next/dist/docs/` antes de escrever código.

**`params` e `searchParams` são Promises.** Acesso síncrono foi *removido* (não é deprecation, é erro). Vale para `page.js`, `layout.js`, `route.js`, `default.js`. Também vale para `cookies()`, `headers()`, `draftMode()`.

```tsx
// ERRADO — não compila no Next 16
export default function Page({ params }: { params: { symbol: string } }) {
  const { symbol } = params
}

// CERTO
export default async function Page({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
}
```

Isso afeta **diretamente** `app/(terminal)/asset/[symbol]/page.tsx` (WP-3). Se a página precisa ser Client Component (tem `useState`), o padrão é: `page.tsx` fica **async server component**, dá `await params`, e passa `symbol` como prop para um `AssetDetailClient` marcado `'use client'`.

**Outras regras:**
- Todo diretório de Parallel Route precisa de `default.js`. Não usamos parallel routes nesta fase — **não crie nenhuma**.
- `middleware.ts` virou `proxy.ts`. Não precisamos de nenhum dos dois nesta fase.
- ESLint usa Flat Config (`eslint.config.mjs`). Não crie `.eslintrc`.
- `next lint` foi removido. Use `npx eslint .`.
- `next/legacy/image` e `images.domains` estão deprecados. Use `next/image` normal; nesta fase não há imagem remota.
- Turbopack é o default do `dev` e do `build`. Não adicione config de webpack.

---

## 3. Design tokens

Extraídos do design. Vão em `app/globals.css` sob `@theme`. Use **sempre** o token, nunca o hex solto.

```css
@theme {
  --color-base: #0A0C10;
  --color-chrome: #0D1017;
  --color-surface: #10141C;
  --color-inset: #0D1017;
  --color-hover: #151A24;
  --color-active: #161D2E;

  --color-border: #1A202E;
  --color-border-strong: #222939;
  --color-border-hover: #39435C;
  --color-divider: #141926;

  --color-text: #E8ECF4;
  --color-text-secondary: #B7BFD2;
  --color-text-muted: #8A93A8;
  --color-text-faint: #5A6478;

  --color-up: #21C77D;
  --color-up-border: #1E4536;
  --color-up-bg: #0D1712;
  --color-down: #F0525F;
  --color-down-bg: #1C0F12;
  --color-down-strong: #2A1418;

  --color-accent: #4E7CF6;
  --color-accent-hover: #7DA0FF;
  --color-accent-bg: #16233F;
  --color-accent-bg-soft: #1C2333;
  --color-accent-border: #2E4370;

  --color-ai: #A78BFA;
  --color-ai-bg: #12101C;
  --color-ai-border: #2A2440;

  --color-warn: #E8A33D;
  --color-warn-bg: #2A2113;
  --color-warn-border: #6B5320;

  --color-danger-border: #7A2E36;
  --color-danger-solid: #C2323F;

  --color-cyan: #38BDF8;

  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', monospace;
}
```

Global obrigatório (está no `Terminal.dc.html`, porte igual):

```css
::-webkit-scrollbar { width:10px; height:10px; }
::-webkit-scrollbar-thumb { background:#222939; border-radius:5px; border:2px solid #0A0C10; }
:focus-visible { outline:2px solid #4E7CF6; outline-offset:1px; }
@media (prefers-reduced-motion: reduce) { *{ animation:none !important; transition:none !important; } }
```

---

## 4. Regras de UX financeira — bloqueantes

Violar qualquer uma reprova o PR.

1. **Todo número monetário, percentual ou de quantidade** usa `font-mono` + `tabular-nums` + alinhado à direita. Componente `<Num>` faz isso; use ele.
2. **Alta/baixa nunca só por cor.** Sempre cor **+** seta (`▲`/`▼`) **+** sinal (`+`/`−`). Use o sinal menos tipográfico `−` (U+2212), não hífen.
3. **Formatação pt-BR**: `1.234,56`. Use `Intl.NumberFormat('pt-BR')`. Nunca `toFixed()` cru na UI.
4. **Frescor do dado sempre visível.** Todo painel com dado mostra estado: `tempo real · há 1s` (verde), `atrasado 15min` (âmbar), `fechado` (cinza), `D+0 · há 4min` (âmbar).
5. **Ação irreversível exige confirmação por digitação.** O kill switch pede o texto `desativar tudo`; ativar estratégia real pede confirmação equivalente. Botão fica `disabled` até bater exato.
6. **Kill switch acessível de qualquer tela** — está no topbar do shell.
7. **Disclaimer permanente** no rodapé do shell. Não remova.
8. **Nunca renderizar chave de API completa.** Sempre mascarada.
9. **Timezone**: America/Sao_Paulo, exibido como `GMT-3`.

---

## 5. Modelo de domínio

Vai em `lib/types.ts`. **Escreva isto primeiro, antes de qualquer tela.** É o contrato que mantém as telas consistentes.

```ts
export type AssetClass =
  | 'cripto' | 'ações' | 'renda fixa' | 'câmbio'
  | 'energia' | 'commodities' | 'índices' | 'fundos';

export type Direction = 'LONG' | 'SHORT' | 'COMPRA' | 'VENDA' | 'ALTA' | 'BAIXA';

export type Freshness =
  | { kind: 'realtime'; agoSeconds: number }
  | { kind: 'delayed'; delayMinutes: number; source: string }
  | { kind: 'eod'; agoMinutes: number }
  | { kind: 'closed' };

export interface Asset {
  symbol: string;
  name: string;
  venue: string;
  assetClass: AssetClass;
  price: string;          // já formatado pt-BR, com unidade
  change: string;
  changePct: number;      // negativo = queda; decide cor/seta
  freshness: Freshness;
  stats: { key: string; value: string }[];
}

// Painel adaptativo: cada classe declara os seus.
export type Panel =
  | { kind: 'kv'; title: string; meta: string; rows: KVRow[] }
  | { kind: 'book'; title: string; meta: string; mid: string; spread: string; asks: BookLevel[]; bids: BookLevel[] }
  | { kind: 'curve'; title: string; meta: string; alt: string; legend?: string; labels: string[]; series: number[]; series2?: number[] };

export interface KVRow { key: string; value: string; tone?: 'up' | 'down' | 'neutral' }
export interface BookLevel { price: string; qty: string; depthPct: number }

export interface Scenario { label: string; prob: number; target: string; text: string }

export interface AIThesis {
  thesis: string;
  scenarios: Scenario[];      // BULL / BASE / BEAR — soma 100
  risks: string[];
  invalidations: string[];
  sources: { label: string; url: string }[];
  model: string;
  generatedAgo: string;
}

export interface Signal {
  id: string;
  asset: string;
  direction: Direction;
  conviction: number;         // 0–100
  horizon: string;
  thesis: string;             // 1 frase
  why: string;                // parágrafo do "por quê"
  sources: { label: string; url: string }[];
  ago: string;
}

export type IntegrationStatus = 'conectado' | 'degradado' | 'offline' | 'nao_configurado';

export interface Integration {
  id: string;
  name: string;
  assetClasses: AssetClass[];
  status: IntegrationStatus;
  credentialKind: string;
  canTrade: boolean;          // true = destaque visual de perigo
  rateLimitPct: number;
  lastResponseMs: number | null;
}

export interface Position {
  symbol: string; venue: string; assetClass: AssetClass;
  qty: string; avgPrice: string; currentPrice: string;
  pnlOpen: string; pnlOpenPct: number;
  pnlRealized: string; weightPct: number;
}

export type StrategyState = 'rodando' | 'pausada' | 'backtest' | 'erro';
export type StrategyMode = 'PAPER' | 'REAL';

export interface Strategy {
  id: string; name: string; state: StrategyState; mode: StrategyMode;
  pnl: string; pnlPct: number; drawdownPct: number;
  sharpe: number; winRatePct: number; trades: number; markets: string[];
}
```

Regra: **componente de tela não formata número nem escolhe cor por conta.** Recebe dado tipado e usa os helpers de `lib/format.ts`.

---

## 6. Camada de dados

```
lib/
  types.ts          # acima
  format.ts         # brl(), usd(), pct(), num(), signed(), arrow(), toneColor()
  data/
    index.ts        # interface DataSource + getDataSource()
    mock.ts         # implementação com os dados do design
```

`lib/data/index.ts`:

```ts
export interface DataSource {
  getOverview(): Promise<OverviewData>;
  getAsset(symbol: string): Promise<AssetDetailData>;
  getIntegrations(): Promise<Integration[]>;
  getPortfolio(): Promise<PortfolioData>;
  getStrategies(): Promise<Strategy[]>;
  getAlerts(): Promise<AlertsData>;
  getAnalytics(): Promise<AnalyticsData>;
}

export function getDataSource(): DataSource {
  return mockDataSource;   // fase 2 troca aqui, e só aqui
}
```

Toda tela consome via `getDataSource()`. **Nenhuma tela importa `mock.ts` diretamente.** É o que permite plugar dados reais sem tocar em UI.

---

## 7. Estrutura de pastas

```
app/
  globals.css
  layout.tsx                    # fonts + html lang="pt-BR"
  (terminal)/
    layout.tsx                  # shell: topbar, nav, footer, palette, kill switch
    page.tsx                    # Overview
    markets/page.tsx
    asset/[symbol]/page.tsx
    chat/page.tsx
    strategies/page.tsx
    portfolio/page.tsx
    alerts/page.tsx
    analytics/page.tsx
    settings/page.tsx
  onboarding/page.tsx
components/
  ui/          Card, Num, Badge, Bar, Sparkline, Tabs, Modal, ConfirmByTyping, FreshnessTag, EmptyState, Skeleton
  shell/       Topbar, Nav, CommandPalette, KillSwitchModal, HealthBar
  panels/      KVPanel, OrderBookPanel, CurvePanel, PanelRenderer
  charts/      Candlestick, EquityCurve, Donut, Heatmap, Histogram, Underwater
lib/
  types.ts  format.ts  data/
```

---

## 8. Componentes compartilhados — construir PRIMEIRO

Antes de qualquer tela. Todas dependem deles.

- **`<Card>`** — `bg-surface border border-border rounded-lg p-3.5`, com `title` (uppercase 11px, `text-muted`, letter-spacing .6px) e `meta` opcional à direita (10px `text-faint` mono).
- **`<Num>`** — `font-mono tabular-nums text-right`. Props: `value`, `tone`, `showSign`, `showArrow`.
- **`<Badge>`** — variantes `up | down | warn | ai | neutral | danger`.
- **`<Bar>`** — barra de progresso fina (convicção, probabilidade, rate limit, relevância). Precisa de `role="img"` + `aria-label`.
- **`<Sparkline>`** — SVG polyline 56×20.
- **`<Tabs>`** — `role="tablist"`, `aria-selected`, borda inferior 2px azul no ativo.
- **`<Modal>`** — overlay `rgba(5,7,10,.6)`, foco preso, `Esc` fecha, `role="dialog"`.
- **`<ConfirmByTyping>`** — modal que só habilita o botão quando o texto bate exato. Usado pelo kill switch e por ativar estratégia real.
- **`<FreshnessTag>`** — recebe `Freshness`, renderiza a tag certa com a cor certa.
- **`<Skeleton>`** — barra com `animate-pulse`. Loading é skeleton, **nunca spinner**.

---

## 9. Pacotes de trabalho

Ordem importa. WP-0 e WP-1 bloqueiam todo o resto.

### WP-0 — Fundação *(fazer sozinho, ninguém em paralelo)*
Scaffold Next.js, `globals.css` com tokens, fonts, `lib/types.ts`, `lib/format.ts`, `lib/data/`.
**Aceite:** `npm run build` passa, `/` responde, tokens aplicados.

### WP-1 — Componentes base + shell
Tudo da seção 8 + `app/(terminal)/layout.tsx` a partir de `Terminal.dc.html`.
Inclui: topbar com barra de saúde (`48/52 mercados`, latência, degradados, offline, sync), relógio GMT-3, banner de reconexão de WebSocket, nav de 10 itens com badges (`markets:52`, `strategies:4`, `alerts:3`), toggle de densidade, footer com disclaimer, command palette (Ctrl+K, foco automático, filtro por texto), kill switch com confirmação por digitação.
**Aceite:** navegar entre as 10 rotas pelo nav; Ctrl+K abre e filtra; kill switch só habilita com `desativar tudo` exato; `Esc` fecha os dois.

### WP-2 — Overview `/`
3 colunas `300px 1fr 340px`. Patrimônio + 4 cards de P&L; donut de alocação (6 fatias, SVG `stroke-dasharray`); calendário econômico (5 eventos com selo de impacto); feed de sinais da IA (4 cards, barra de convicção, "por quê" expansível — só um aberto por vez); card de "IA analisando" com skeleton; heatmap 8×8 com opacidade proporcional à variação; watchlist de 10 ativos com sparkline e tags de atrasado/fechado.
**Aceite:** confere visualmente com `Overview.dc.html`; expandir um sinal fecha o outro.

### WP-3 — Asset Detail `/asset/[symbol]` *(o mais pesado)*
Seletor de 8 classes; header do ativo com stats e frescor; gráfico candlestick SVG (66 candles, wicks, MA(21), Bollinger, volume, 3 marcadores: sinal IA / trade comprado / trade vendido); seletor de timeframe (8) e de indicadores (6, toggláveis); **alternativa em tabela OHLC** (acessibilidade — obrigatório); painéis adaptativos por classe via `PanelRenderer`; 3 abas (Análise da IA com cenários/riscos/invalidação, Notícias com sentimento e relevância, Correlações positivas/negativas).
Os dados das 8 classes estão completos no design — **copie todos**.
**Aceite:** trocar de classe troca header, painéis e tese; toggle de tabela funciona; os 3 tipos de painel (kv/book/curve) renderizam.

### WP-4 — Markets `/markets`
Lista de integrações com status, credencial, permissão, rate limit, última resposta. **Integração com permissão de ordem precisa de destaque visual de perigo.** Fluxo de conectar em 4 passos (provedor → chave → testar → escopo), com "só leitura" como padrão.
**Aceite:** os 4 status têm tratamento visual distinto; wizard navega ida e volta.

### WP-5 — Strategies `/strategies`
Lista com estado/P&L/drawdown/sharpe/win rate; **PAPER vs REAL visualmente inconfundível**; ativar REAL exige `<ConfirmByTyping>`; builder (entrada, saída, sizing, stop, take profit, mercados, peso da IA); backtest com curva de equity vs benchmark, histograma de retornos, drawdown underwater e tabela de trades.
**Aceite:** não é possível ativar REAL sem confirmar por digitação.

### WP-6 — Portfolio `/portfolio`
Posições consolidadas; exposição em 4 dimensões (classe/moeda/setor/país) com abas; métricas de risco (VaR, beta, vol, correlação, concentração); histórico de trades; bloco fiscal (apuração, DARF estimado, custo médio).

### WP-7 — AI Chat `/chat`
Conversa com artefatos ricos inline (gráfico, tabela); streaming em fases visíveis (coletando → analisando → sintetizando); **toda afirmação numérica com fonte clicável**; seletor de modelo; histórico por tema; estado de falha da IA com retry.
Sem chamada real de LLM — simule o streaming com timers.

### WP-8 — Alerts + Analytics + Settings + Onboarding *(4 telas menores, agrupadas)*
- **Alerts**: criar por preço/indicador/notícia/linguagem natural; ativos; histórico com acerto da IA; canais de entrega.
- **Analytics**: acurácia por classe/horizonte/modelo; custo de IA e dados; "o que eu deixei de ganhar".
- **Settings**: chaves mascaradas com rotação e escopo; limites de risco; moeda base, timezone, formato; tema e densidade.
- **Onboarding**: 4 passos, fora do shell.

---

## 10. Regras de código

- **Zero comentário** por padrão. Só escreva se o *porquê* for não-óbvio. Nunca comentário que descreve o *que* o código faz.
- **Sem `any`.** TS strict. Sem `@ts-ignore`.
- **Sem `dangerouslySetInnerHTML`.**
- Componente de tela é Server Component quando não tem estado; `'use client'` só onde há interação.
- Nomes de componente e variável em **inglês**. Todo texto visível ao usuário em **português do Brasil**.
- Sem `console.log` no commit final.
- Sem TODO/FIXME. Sem função stub que não faz nada. Se não deu tempo, diga — não deixe placeholder mudo.
- Sem `<img>` de host externo. Sem chamada de rede em runtime nesta fase.

## 11. Segurança — bloqueante

1. **Nenhum segredo no cliente.** Sem `NEXT_PUBLIC_*` com token/chave. Nesta fase não existe segredo nenhum — se você acha que precisa de um, você entendeu errado o escopo, **pergunte**.
2. Chave de API na UI é **sempre** mascarada (`sk-live-••••••4a2f`). O mock não pode conter chave realista completa.
3. Nada de armazenar credencial em `localStorage`.
4. Sem dependência nova sem aprovação.

## 12. Acessibilidade — bloqueante

- WCAG AA. Foco visível em tudo interativo (já no `:focus-visible` global).
- Navegação completa por teclado. Modal prende foco e fecha com `Esc`.
- Todo gráfico SVG: `role="img"` + `aria-label` descritivo. O candlestick **precisa** da alternativa em tabela.
- `aria-selected` em tab, `aria-current="page"` em nav, `aria-pressed` em toggle, `role="status"` em avisos ao vivo.
- `prefers-reduced-motion` respeitado — número que atualiza a cada tick não anima.

## 13. Definição de pronto

- [ ] `npm run build` sem erro e sem warning de TS
- [ ] Confere visualmente com o `.dc.html` correspondente
- [ ] Todos os estados do design implementados (loading, vazio, erro, atrasado, fechado, reconectando)
- [ ] Teclado percorre a tela inteira; foco sempre visível
- [ ] Números em mono + tabular + pt-BR; alta/baixa com cor + seta + sinal
- [ ] Zero `any`, zero comentário supérfluo, zero `console.log`
- [ ] Nenhum segredo, nenhuma chamada de rede

## 14. Como pedir ajuda

Se algo do design for ambíguo, se faltar dado, ou se você achar que precisa fugir deste plano: **pare e pergunte ao orquestrador (Opus).** Não improvise arquitetura, não instale dependência por conta, não invente tela.

Diga: o arquivo, o trecho, as opções que você vê, e qual você recomenda.
