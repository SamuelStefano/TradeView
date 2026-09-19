# Sale readiness — o que falta para o primeiro cliente pagante

Estado em 19/09/2026. Só documentação: nada aqui foi implementado.

O produto hoje é um terminal pessoal. O código é sólido (ledger de dupla entrada,
RLS default-deny, execução paper contra o book real, kill switch, 70+ testes),
mas **não existe nenhum caminho por onde um estranho vire cliente**: o cadastro é
por allowlist, não há cobrança, não há página legal e não há limite por plano.

Esta lista é ordenada por (valor para fechar a primeira venda) ÷ (esforço).

---

## Bloqueantes — sem isto não se vende legalmente

### 1. Disclaimer "não é recomendação de investimento" visível em todo lugar
**Esforço: 2h · Valor: bloqueante**

O texto existe só no system prompt do chat (`app/api/chat/route.ts`) e numa nota
do painel fiscal. Precisa aparecer no rodapé de todas as telas, no ticket de
ordem, na tela de estratégias e no aceite do cadastro.

A CVM (Res. 20/2021) regula recomendação de valor mobiliário, não de cripto — por
isso o escopo cripto-only é o que mantém o produto fora do registro de analista.
O disclaimer é o que impede que o painel de estratégias seja lido como consultoria.
**Enquanto o catálogo for só cripto (`lib/markets/catalogue.ts`), isto é suficiente;
no dia que entrar ação de B3, vira assunto de registro na CVM.**

### 2. Termos de uso + política de privacidade (LGPD)
**Esforço: 1 dia com modelo pronto · Valor: bloqueante**

Não existe `/termos` nem `/privacidade`. Mínimo:
- quais dados são coletados (e-mail, ordens, saldos do ledger) e por quê;
- que a execução é **simulada** e nenhuma ordem chega a corretora;
- retenção e exclusão real da conta (hoje não há caminho de exclusão);
- base legal, encarregado e canal de contato;
- limitação de responsabilidade por perda financeira.

### 3. Fechar o projeto Supabase compartilhado
**Esforço: 1 dia · Valor: bloqueante**

O projeto é o mesmo de outro app (`README.md`, seção "Banco e conta"): `auth.users`
é do projeto inteiro, então toda conta do app vizinho autentica aqui. O commit
desta branch fecha o login por allowlist, mas a solução correta antes de vender é
**projeto Supabase próprio**. Sem isso, "seus dados são isolados" não é uma frase
que dê para assinar.

### 4. Desligar o signup direto no GoTrue
**Esforço: 5 min · Valor: bloqueante**

A chave publishable está no bundle por design, então qualquer visitante pode
chamar `POST /auth/v1/signup` direto na API do Supabase sem passar pela server
action. A allowlist do app não alcança esse caminho. Dashboard → Auth → Providers
→ Email → "Allow new users to sign up" **off**, e convite manual. (Quando houver
billing, isto inverte: o gate passa a ser a assinatura, não a allowlist.)

---

## Alto valor, esforço médio

### 5. Cobrança (Stripe ou Woovi/Pix)
**Esforço: 3–4 dias · Valor: alto**

Nada existe. Ordem sugerida: preço único mensal → checkout hospedado → webhook
que grava `subscription_status` em `tradeview.profiles` → middleware que bloqueia
as telas pagas quando o status não é `active`. Pix via Woovi é o que converte no
Brasil; cartão via Stripe é o que permite cobrança recorrente sem atrito.

**Não escrever código de billing antes dos itens 1–4.** Cobrar de alguém sem
termos aceitos é o pior cenário possível.

### 6. Onboarding que funcione sem a allowlist
**Esforço: 2 dias · Valor: alto**

Hoje o primeiro acesso cai numa tela de portfólio vazia. Um cliente novo precisa
de: confirmação de e-mail, um depósito paper pré-provisionado (ou um botão
"começar com R$ 10.000 simulados"), uma primeira ordem guiada e um ponteiro para
o que o terminal faz de diferente (execução contra o book real, não pelo preço
médio).

### 7. Limites por plano
**Esforço: 2 dias · Valor: alto**

Não há noção de plano. Os eixos que custam dinheiro de verdade e por isso têm de
ser limitados:

| Eixo | Onde limitar hoje | Custo real |
|---|---|---|
| Mensagens de IA por mês | `app/api/chat/route.ts` (só há rate limit por minuto, em memória) | API Anthropic |
| Estratégias ativas simultâneas | `lib/trading/strategies.ts` | CPU e rate limit das venues no runner |
| Timeframe mínimo de estratégia | `lib/core/strategy/schedule.ts` | requisições às venues |
| Histórico de runs retido | já cortado em 200 por estratégia na migration | armazenamento |

O rate limiter (`lib/rate-limit.ts`) é um `Map` em memória, portanto por instância:
na Vercel ele não limita nada de forma confiável. Um plano só é aplicável depois
que o contador viver no Postgres.

---

## Necessário antes de escalar, não antes da primeira venda

### 8. Trilha de auditoria
**Esforço: 3h · Valor: médio**

A tabela `tradeview.audit_log` existe desde a primeira migration e **nada escreve
nela**. Quem ligou o kill switch, quem levantou o `max_order_notional`, quem
mandou a ordem — não há registro fora do ledger. Para um produto que mexe com
dinheiro do cliente, é a diferença entre provar e alegar.

### 9. Exclusão de conta e exportação de dados
**Esforço: 1 dia · Valor: médio (obrigatório pela LGPD, cobrado depois)**

Existe exportação em CSV por tela (`ExportCsvButton`), mas não há "baixar tudo"
nem "apagar minha conta". O ledger é append-only por desenho, então a exclusão
precisa ser decidida explicitamente: anonimizar o `user_id` ou apagar em cascata.

### 10. Suporte e canal de contato
**Esforço: 2h · Valor: médio**

Nenhum e-mail, nenhum formulário, nenhuma página "sobre". Um comprador que não
sabe para quem reclamar não paga.

### 11. Status page / transparência de fonte de dados
**Esforço: 4h · Valor: médio**

O app já mede a saúde das venues (`lib/data/live/venues.ts`) e agora rotula a
idade de cada cotação. Falta expor isso como promessa pública: quais venues,
qual latência, o que acontece quando uma cai. Isso é argumento de venda num
terminal, não enfeite.

### 12. Precificação e página de vendas
**Esforço: 1 dia · Valor: médio**

Não existe landing page. O produto só se explica depois do login, o que significa
que ninguém que não seja o dono jamais entendeu o que ele faz.

---

## Explicitamente fora de escopo até haver cliente

- **Execução real.** `lib/core/place-order.ts` recusa modo real de propósito, por
  não haver roteamento para a corretora. Vender "trading automatizado" com fill
  simulado seria fraude. O produto a vender hoje é **terminal + paper com custo
  real**, e isso precisa estar escrito na página de vendas.
- **Ações da B3.** Puxa registro na CVM.
- **Multi-tenant de verdade** (organizações, convites, papéis).
- **App mobile.**

---

## Resumo em uma linha

Antes da primeira cobrança: disclaimer, termos/privacidade, projeto Supabase
próprio e signup fechado no GoTrue (itens 1–4, ~2,5 dias). Depois disso, billing e
onboarding (itens 5–6, ~1 semana). Tudo o mais espera o cliente existir.
