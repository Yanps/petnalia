# ADR-0006 — Proxy same-origin (BFF) para chamadas do navegador à API

- **Status:** accepted
- **Data:** 2026-10-14
- **Decisores:** PetNalia core team

## Contexto

O login grava o access token no cookie `petnalia_session` com `httpOnly`, justamente para que JavaScript no navegador não consiga lê-lo. Mesmo assim, ~20 páginas liam o cookie no servidor e repassavam o JWT como prop (`token={token}`) para Client Components, que chamavam a API direto com `Authorization: Bearer`. A prop é serializada no payload RSC, então o token chegava ao navegador e ficava exposto a XSS — anulando o `httpOnly`.

O ARCHITECTURE.md §5 já previa "uma ponte via Route Handler do Next.js" para o cookie httpOnly; ela nunca tinha sido implementada.

## Decisão

Toda chamada **do navegador** à API passa por um proxy same-origin no web app:

- `apps/web/src/app/api/v1/[...path]/route.ts` recebe `/api/v1/<rota>`, lê o cookie `petnalia_session` **no servidor** e repassa a requisição para `API_URL/v1/<rota>` com `Authorization: Bearer <token>`.
- Repassa apenas `accept`, `content-type` e `idempotency-key` na ida, e `content-type`/`content-disposition` na volta; status e corpo da API (incluindo o envelope de erro) passam sem alteração.
- **CSRF:** autenticação por cookie torna mutações sujeitas a CSRF. `SameSite=Lax` já bloqueia POST cross-site; além disso, o proxy exige que o header `Origin` (sempre enviado por navegadores em fetch não-GET) bata com o host — senão responde `403 FORBIDDEN_ORIGIN`.
- Segmentos `.`/`..` no path são recusados (`404`).
- API fora do ar → `502 UPSTREAM_UNAVAILABLE` no envelope padrão.
- `lib/api-client.ts` escolhe a base pelo ambiente: no servidor fala direto com a API; no navegador usa `/api`.
- Nenhum Client Component recebe mais o token. Server Components e Server Actions continuam chamando a API direto, no servidor.

O proxy **só encaminha**: regra de negócio continua na API (CLAUDE.md — a API é o sistema de registro).

## Consequências

- O JWT não aparece em nenhuma resposta enviada ao navegador. Verificado em build de produção (`next start`) para as páginas autenticadas de tutor e vet. Em `next dev`, o React inclui no payload de depuração os valores resolvidos de `cookies()` — isso existe só no modo dev.
- Um hop extra por chamada do navegador (Next → API). Aceitável: as chamadas client-side são mutações e cargas pontuais; leituras de página continuam em Server Components.
- A API passa a ver o servidor Next como origem dessas chamadas — por isso o rate limiting é por usuário quando autenticado e o proxy encaminha o IP do navegador (ver ADR-0007).
- `apps/mobile` (futuro) não usa o proxy: guarda o token em secure storage e chama a API direto, como previsto no ARCHITECTURE.md §5.

## Verificação

- `route.test.ts`: encaminhamento com token do cookie, sem sessão, corpo/headers em mutações, recusa de outra origem e sem `Origin`, path traversal, repasse de erro da API, 502.
- Suíte Playwright completa (56 testes) verde após a migração dos 18 Client Components.
