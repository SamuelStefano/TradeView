# Runner na VPS

O runner é um processo Node que fica vivo, reivindica estratégias com lease e
avalia cada uma no fechamento da vela. Ele não escuta em porta nenhuma: fala com
o Postgres e com endpoints públicos de exchange, e nada fala com ele.

O host é a VPS pessoal (`samuel-agents`), que roda Docker Compose — não Swarm.

## Antes de qualquer deploy

1. Aplicar a migration `supabase/migrations/20260826000006_strategies.sql` no
   projeto Supabase. Sem ela não existe `claim_strategies` e o runner só loga
   `claim_falhou` a cada tick.
2. Ter a `SUPABASE_SECRET_KEY` (service role) em mãos. Ela ignora RLS — o escopo
   por usuário é aplicado no código, à mão.

## Provar antes de subir

```bash
./runner/e2e.sh
```

Sobe um Postgres com as migrations, um PostgREST e o runner, tudo descartável em
loopback, e prova o ciclo contra candles de verdade: reivindicar sob lease,
decidir na vela fechada, colocar ordem, mexer no razão, liberar a lease. Não toca
o Supabase real. Rodar depois de qualquer mudança no runner ou nas migrations.

## Build

A imagem é construída no próprio host — não há registry, e não precisa haver:

```bash
docker build -t tradeview-runner:latest .
```

## Segredo

A chave vai como arquivo montado, nunca como variável de ambiente: `docker
inspect` mostra o ambiente de qualquer container para quem alcança o daemon, e a
service role ignora RLS.

```bash
install -m 600 /dev/null ~/.tradeview-supabase-secret-key
printf '%s' 'SUA_SUPABASE_SECRET_KEY' > ~/.tradeview-supabase-secret-key
```

Fora do repositório, 0600 do dono. Rotacionar é reescrever o arquivo e recriar o
container — o segredo é lido no boot.

## Subir

```bash
cd ~/TradeView
export TRADEVIEW_SUPABASE_URL=https://SEU_PROJETO.supabase.co
export TRADEVIEW_SECRET_FILE=$HOME/.tradeview-supabase-secret-key
export TRADEVIEW_VERSION=$(git rev-parse --short HEAD)

docker compose -f deploy/docker-compose.yml up -d
```

As duas primeiras variáveis não têm default de propósito: sem elas o compose
recusa em vez de subir um runner que não sabe com qual banco falar.

## Conferir

```bash
docker compose -f deploy/docker-compose.yml logs -f
docker inspect --format '{{.State.Health.Status}}' tradeview-runner
```

O que esperar no primeiro minuto:

- `iniciado` — subiu e a configuração está completa.
- `avaliada` por estratégia reivindicada, com `action` e `order`.
- Nada, se não houver estratégia `active` com `next_run_at` vencido. Silêncio
  aqui é o estado normal: estratégia nova nasce `paused`.

Se aparecer `fatal` com `variável de ambiente ausente`, o segredo ou a URL não
chegaram no container. Se aparecer `claim_falhou`, a migration não foi aplicada
ou a chave não é a service role — e o intervalo entre as tentativas cresce, então
a falha continua visível sem queimar uma requisição a cada quinze segundos.

## Saúde

O healthcheck lê um arquivo que o runner reescreve ao fim de cada tick. Ele
existe porque o processo não escuta em porta: sem isso, um runner travado numa
requisição que nunca volta continuaria `Running` segurando as leases, e toda
estratégia reivindicada ficaria parada até alguém notar.

O `valdez-autoheal` que já roda nesta VPS reinicia quem ficar `unhealthy` — daí a
label `autoheal: 'true'` no compose. A label `autoheal.stop.timeout: '60'` existe
porque o padrão dele é matar em 10s, o que cortaria o desligamento no meio e
deixaria as leases presas até expirar.

Do lado do banco, `tradeview.runner_heartbeats` responde a mesma pergunta pela
aplicação — `last_seen_at` velho significa runner morto ou sem rede.

## Parar

```bash
docker compose -f deploy/docker-compose.yml down
```

O `stop_grace_period` de 60s dá tempo do runner terminar a estratégia na mão e
liberar as leases. Matando antes, elas ficam presas até expirar (120s) — nada se
perde, mas as estratégias ficam paradas nesse intervalo.

## Escala

Uma instância. O lease existe para que duas sejam *seguras*, não para que sejam
úteis: duas dividem as mesmas estratégias e dobram as chamadas à exchange para as
mesmas decisões. Se um dia precisar de mais, o limitador é o rate limit da venue,
não a CPU.
