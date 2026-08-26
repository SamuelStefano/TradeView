# Runner na VPS

O runner é um processo Node que fica vivo, reivindica estratégias com lease e
avalia cada uma no fechamento da vela. Ele não escuta em porta nenhuma: fala com
o Postgres e com endpoints públicos de exchange, e nada fala com ele.

## Antes de qualquer deploy

1. Aplicar a migration `supabase/migrations/20260826000006_strategies.sql` no
   projeto Supabase. Sem ela não existe `claim_strategies` e o runner só loga
   `claim_falhou` a cada tick.
2. Ter a `SUPABASE_SECRET_KEY` (service role) em mãos. Ela ignora RLS — o escopo
   por usuário é aplicado no código, à mão.

## Build

Na sua máquina:

```bash
docker build -t tradeview-runner:$(git rev-parse --short HEAD) .
docker save tradeview-runner:$(git rev-parse --short HEAD) | gzip > /tmp/tradeview-runner.tar.gz
scp /tmp/tradeview-runner.tar.gz root@SEU_HOST:/tmp/
```

Na VPS:

```bash
gunzip -c /tmp/tradeview-runner.tar.gz | docker load
```

Não existe registry para esta imagem. Se um dia existir, ele precisa ser privado:
a imagem carrega a lógica de execução, não segredo, mas também não é pública.

## Segredo

A chave vai como Docker secret, nunca no stack file — o que está no stack file
aparece em `docker service inspect` e no repositório.

```bash
printf '%s' 'SUA_SUPABASE_SECRET_KEY' \
  | docker secret create tradeview_supabase_secret_key -
```

Rotacionar é criar `..._v2`, apontar o stack para ele e remover o antigo depois
que o serviço subiu.

## Subir

```bash
export TRADEVIEW_IMAGE=tradeview-runner:abc1234
export TRADEVIEW_SUPABASE_URL=https://SEU_PROJETO.supabase.co

docker stack deploy \
  -c deploy/tradeview-runner.stack.yml \
  --resolve-image never \
  tradeview
```

`--resolve-image never` porque a imagem foi carregada localmente e não existe em
registry nenhum; sem isso o Swarm tenta resolver e falha.

## Conferir

```bash
docker service ls | grep tradeview
docker service logs -f tradeview_runner
```

O que esperar no primeiro minuto:

- `iniciado` — subiu e a configuração está completa.
- `avaliada` por estratégia reivindicada, com `action` e `order`.
- Nada, se não houver estratégia `active` com `next_run_at` vencido. Silêncio
  aqui é o estado normal: estratégia nova nasce `paused`.

Se aparecer `fatal` com `variável de ambiente ausente`, o segredo ou a URL não
chegaram no container. Se aparecer `claim_falhou`, a migration não foi aplicada
ou a chave não é a service role.

## Saúde

O healthcheck lê um arquivo que o runner reescreve ao fim de cada tick. Ele
existe porque o processo não escuta em porta: sem isso, um runner travado numa
requisição que nunca volta continuaria `Running` segurando as leases, e toda
estratégia reivindicada ficaria parada até alguém notar.

Do lado do banco, `tradeview.runner_heartbeats` responde a mesma pergunta pela
aplicação — `last_seen_at` velho significa runner morto ou sem rede.

## Parar

```bash
docker stack rm tradeview
```

O `stop_grace_period` de 60s dá tempo do runner terminar a estratégia na mão e
liberar as leases. Matando antes, elas ficam presas até expirar (120s) — nada se
perde, mas as estratégias ficam paradas nesse intervalo.

## Escala

Uma réplica. O lease existe para que duas réplicas sejam *seguras*, não para que
sejam úteis: duas dividem as mesmas estratégias e dobram as chamadas à exchange
para as mesmas decisões. Se um dia precisar de mais, o limitador é o rate limit
da venue, não a CPU.
