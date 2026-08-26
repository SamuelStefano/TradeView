# TradeView

Terminal de trading multimercado com análise por IA. Cripto, ações, renda fixa, câmbio, energia, commodities, índices e fundos numa tela só.

**Produção:** https://tradeview-six.vercel.app

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict
- Tailwind CSS v4 — sem `tailwind.config.js`, paleta no bloco `@theme` de `app/globals.css`
- Zero dependência de gráfico: candlestick, donut, heatmap e sparkline são SVG próprio

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Estado atual

As 10 telas de análise rodam sobre dados mockados. A mesa de operações (`/trade`) é real:
conta, saldo, depósito, saque e envio de ordem gravam num ledger de dupla entrada no
Postgres, com a execução simulada contra o book ao vivo da venue via CCXT.

Sem as variáveis do Supabase o app sobe em modo demonstração — as telas de análise
funcionam e `/trade` e `/login` avisam que o banco não está configurado.

## Banco e conta

```bash
cp .env.example .env.local        # preencher com o projeto Supabase
bash supabase/tests/run.sh        # sobe um Postgres descartável e roda o suite SQL
```

As migrations em `supabase/migrations/` são a fonte do schema. Aplicar em ordem.

**Projeto compartilhado:** o Supabase é o mesmo de outro app, que é dono de `public`. Tudo
daqui vive em `tradeview` e `tradeview_private` — nenhum objeto é criado em `public` e
nenhum grant é revogado lá. `supabase/tests/run.sh` cria uma tabela vizinha em `public`
antes das migrations e o suite falha se ela perder privilégio. Os clientes fixam
`db: { schema: 'tradeview' }`, então nem o browser nem o servidor alcançam o outro app.

`auth.users` é do projeto inteiro e não dá para separar. Por isso não existe trigger de
signup: entrar no TradeView é o que provisiona a conta (`ensureUserSetup`), e quem só usa
o outro app não ganha carteira aqui.

**Modelo de dinheiro:** nenhum saldo é coluna mutável. Todo saldo é a soma de lançamentos
imutáveis em `ledger_entries`, e um constraint trigger recusa qualquer transação que não
feche em zero por moeda. Um saldo errado não tem como ser gravado; só uma transação
desbalanceada teria, e essa o banco rejeita. Correção se faz por estorno — o ledger é
append-only.

**Execução paper:** `lib/trading/paper-engine.ts` percorre o book de verdade, nível a nível,
cobrando taxa taker e slippage. Não existe atalho de "executa no preço médio" — é a maior
fonte de auto-engano em backtest.

**Venues:** Foxbit (BRL) e OKX (USDT). Binance responde 451 e Mercado Bitcoin 403 para IP
de datacenter, o que inclui as funções da Vercel — a escolha é por alcance real, não por
preferência. Trocar de venue é editar `20260826000003_instruments.sql`.

## Testes

```bash
npm test           # motor de execução (12 casos)
npm run test:db    # invariantes de dinheiro e isolamento por RLS
```

## Camada de dados

Nenhuma tela importa mock diretamente. Todas passam por `getDataSource()` em `lib/data/index.ts`,
que devolve um objeto conforme a interface `DataSource`. Trocar mock por adaptadores reais é
uma mudança num ponto só.

```ts
export interface DataSource {
  getOverview(): Promise<OverviewData>;
  getAsset(symbol: string): Promise<AssetDetailData | null>;
  getDefaultSymbols(): Promise<Record<AssetClass, string>>;
  getMarkets(): Promise<MarketsData>;
  getPortfolio(): Promise<PortfolioData>;
  getStrategies(): Promise<Strategy[]>;
  getAlerts(): Promise<AlertsData>;
  getAnalytics(): Promise<AnalyticsData>;
}
```

## Cores

`app/globals.css` é a única fonte da paleta. Nenhum hex ou `rgba()` literal em `components/` ou `lib/` —
tudo referencia `var(--color-*)`. Variantes com opacidade usam `color-mix(in srgb, var(--token) N%, transparent)`.

Duas armadilhas do Tailwind v4 que já custaram bug aqui:

- Utilitários ficam numa cascade layer. Um seletor de elemento sem layer (`a { color: … }`) vence
  qualquer classe utilitária de cor, independente de especificidade. Regras base vão dentro de `@layer base`.
- Tokens do `@theme` viram custom properties reais em `:root` e não são tree-shaken mesmo quando
  usados só via `var()` cru — verificado contra o bundle de produção.

## Acessibilidade

WCAG 2.1 AA. Auditado com axe-core nas 10 rotas: zero violações, zero erro de console.

- Controles segmentados sem painel associado usam `radiogroup`/`radio`, não `tablist`/`tab`
- `Tabs` (`components/ui/Tabs.tsx`) implementa o padrão APG completo: setas, Home/End e roving tabindex
- Tabelas em div seguem a hierarquia ARIA correta (`table` > `rowgroup`/`row` > `cell`/`columnheader`/`rowheader`)

`--color-text-faint` foi ajustado de `#5a6478` (design original) para `#7a859b` para fechar 4.5:1.

## Segurança

Nada de credencial no cliente. Chave de API nunca é renderizada por completo, nunca vai pra
`localStorage`/`sessionStorage`. As duas ações destrutivas — kill switch global e modo real —
exigem confirmação por frase digitada.

- **RLS default-deny** em todas as tabelas, com `force row level security` para valer também
  para o dono. Os grants de escrita foram revogados de `anon` e `authenticated`: sem isso, um
  UPDATE sem policy vira um no-op silencioso de zero linhas em vez de erro.
- **A chave secreta ignora RLS.** Toda leitura do servidor que a usa filtra por `user_id` na
  mão; nada depende do banco para fazer o recorte.
- **Server actions reverificam a sessão.** São POSTs na própria rota, e uma mudança no matcher
  do proxy pode deixá-las descobertas — confiar só nessa camada não serve para dinheiro.
- **Dois gates independentes para capital real:** a env `TRADEVIEW_ALLOW_REAL_TRADING` do
  deploy e o flag `real_trading_enabled` por usuário. Qualquer um desligado bloqueia.
- **Credencial de exchange é ciphertext.** AES-256-GCM com chave que nunca chega ao Postgres,
  em schema fora do alcance da API. Um dump do banco sozinho não devolve credencial usável.
- **Erro de banco não vaza para o browser.** Só mensagem escrita por nós chega ao formulário.

## Estrutura

```
app/(terminal)/        rotas do terminal (server components)
components/
  shell/               nav, topbar, command palette, kill switch
  ui/                  primitivos do design system
  charts/              candlestick, donut, heatmap
  panels/              painéis adaptativos por classe de ativo
lib/data/              DataSource + mocks
lib/trading/           motor paper, ordens, transferências
lib/supabase/          clientes server/browser
supabase/migrations/   schema, RLS e write API
supabase/tests/        suite SQL de dinheiro e isolamento
design/                export original do Claude Design (referência)
PLANO.md               plano de construção por tela
```
