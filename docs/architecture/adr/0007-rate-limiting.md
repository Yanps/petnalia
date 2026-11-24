# ADR-0007 — Rate limiting na API

- **Status:** accepted
- **Data:** 2026-10-14
- **Decisores:** PetNalia core team

## Contexto

O CLAUDE.md exige rate limiting em autenticação, busca e escrita, mas a API não tinha nenhum — inclusive no login, aberto a força bruta e credential stuffing.

Dois detalhes do sistema pesam no desenho:

1. O login acontece numa **Server Action**: quem chama `POST /v1/auth/login` é o servidor Next, não o navegador.
2. Depois do ADR-0006, chamadas do navegador também chegam via servidor Next.

Limitar só por IP de conexão colocaria **todos os usuários num único balde** (o IP do servidor Next).

## Decisão

- **`@nestjs/throttler` 6.x** (padrão do ecossistema Nest, suporta Nest 10), com guard global `RateLimitGuard` registrado **depois** do `JwtAuthGuard`.
- **Rastreamento:** requisição autenticada → `user:<id>`; anônima → `ip:<ip>`.
- **IP real do cliente:** o web encaminha `X-Forwarded-For` (proxy e Server Actions de auth). Só a **última** entrada recebida é repassada — é a que nosso balanceador adicionou; entradas anteriores podem ter sido forjadas pelo cliente. A API só acredita nesse header vindo de proxies listados em `TRUST_PROXY` (sintaxe do Express "trust proxy"; padrão `loopback`, web e API no mesmo host).
- **Limites** (por cliente, janela de 1 min):
  - global: 300;
  - auth (`/v1/auth/*`): 10, configurável por `RATE_LIMIT_AUTH_PER_MINUTE`;
  - criação de agendamento (vet e pet sitter): 20.
- **Resposta:** `429` no envelope padrão, código estável `RATE_LIMITED`, mensagem em pt-BR.

## Consequências e limitações conhecidas

- **Storage em memória:** os contadores vivem no processo. Com mais de uma réplica da API, cada uma conta separado (limite efetivo × réplicas). Ao escalar horizontalmente, trocar por storage em Redis (ex.: `@nest-lab/throttler-storage-redis`) — Redis já é dependência.
- **Ambiente local:** sem balanceador na frente, todo o tráfego chega como `::1`/`127.0.0.1`, ou seja, um único cliente. Para rodar a suíte Playwright, subir a API com `RATE_LIMIT_AUTH_PER_MINUTE=1000`.
- **Tráfego anônimo renderizado no servidor** (ex.: busca pública via Server Components) ainda chega com o IP do servidor Next e divide o limite global de 300/min. Se virar gargalo, encaminhar `X-Forwarded-For` também nas leituras server-side.
- **Produção:** o web precisa estar atrás de um balanceador que defina `X-Forwarded-For`, e `TRUST_PROXY` da API precisa listar o(s) hop(s) entre o web e a API.

## Verificação

- Unit: `rate-limit.spec.ts` (rastreamento, erro, configuração do limite de auth); `forwarded-for.test.ts` e `route.test.ts` no web.
- Integração: `test/rate-limit.api.spec.ts` — o 11º login no mesmo minuto recebe `429 RATE_LIMITED`.
