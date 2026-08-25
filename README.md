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

Fase 1: todas as 10 telas construídas e navegáveis, alimentadas por dados mockados.
Fase 2 (pendente): adaptadores reais de mercado e camada de IA.

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

## Estrutura

```
app/(terminal)/        rotas do terminal (server components)
components/
  shell/               nav, topbar, command palette, kill switch
  ui/                  primitivos do design system
  charts/              candlestick, donut, heatmap
  panels/              painéis adaptativos por classe de ativo
lib/data/              DataSource + mocks
design/                export original do Claude Design (referência)
PLANO.md               plano de construção por tela
```
