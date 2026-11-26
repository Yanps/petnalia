---
name: workflow-petnalia
description: >
  Playbook de desenvolvimento do PetNalia — orquestra as skills e docs na ordem certa para cada cenário.
  Use quando iniciar qualquer tarefa de desenvolvimento: nova feature, componente UI, use case de backend,
  bugfix, PR sensível ou fim de sessão. Responde à pergunta: "quais skills devo ativar e em que ordem?"
  Não substitui as skills individuais — define a sequência e combinação certas para cada contexto.
---

# Workflow PetNalia — Playbook de Desenvolvimento

Mapa de cenário → skills + docs na ordem certa. Consulte antes de começar qualquer tarefa.

---

## 1. Nova feature (qualquer domínio)

```
1. /create-spec          → registra a spec em docs/specs/ antes de qualquer código
2. /tdd                  → red-green-refactor; use cases testados primeiro
3. /atomic-design        → se a feature tem UI (obrigatório antes de qualquer componente)
4. /loading-skeletons    → se há fetch/async na UI (companheiro skeleton imediato)
5. SECURITY-CHECKLIST    → se toca auth, RBAC, pagamento, LGPD ou upload (docs/SECURITY-CHECKLIST.md)
```

> Spec é input, não output — nunca comece a implementar sem spec aceita.

---

## 2. Componente UI (packages/ui ou feature do app)

```
1. /atomic-design        → classificação (atom/molecule/organism/template), reuse-first
2. /loading-skeletons    → skeleton companheiro imediato se o componente carrega dados
3. vercel-react-best-practices   → evitar waterfalls, re-renders, bundle desnecessário
4. vercel-composition-patterns   → composição correta (RSC, variants, sem boolean props)
5. /next-best-practices  → se é página/rota (metadata, async params, Suspense)
```

> Antes de criar: grep em `packages/ui/src/` — o componente já existe?

---

## 3. Use case / serviço de backend (NestJS)

```
1. /tdd                  → unit test do use case com fake/mock do repositório → implementação mínima
                           (TESTING_GUIDE: não mocke tudo — repositório se testa contra banco real, passo 3)
2. ENGINEERING_GUIDE     → controller thin, service implementa use case, repository isola Prisma
3. /tdd (integration)    → Testcontainers para o repositório contra banco real
```

Checklist de arquitetura antes de escrever:
- Controller: valida + delega. Zero lógica de negócio.
- Service: implementa o use case. Depende de interfaces (ports).
- Repository: única camada que toca Prisma.
- Evento de domínio emitido via BullMQ (não bloqueia o request).

---

## 4. Bugfix

```
1. /tdd                  → escreva o teste que reproduz o bug (RED) antes de corrigir
2. Corrija o código mínimo para o teste passar (GREEN)
3. /loading-skeletons    → se o bug envolve layout: verifique se o skeleton divergiu
```

> Nunca corrija um bug sem ter um teste que o reproduz.

---

## 5. PR sensível (auth · RBAC · pagamento · dados pessoais · upload)

```
1. docs/SECURITY-CHECKLIST.md   → passe cada item da seção relevante
2. /tdd                          → toda lógica de autorização testada (allowed + denied)
3. ADR-0001                      → env nova? Declare em env.ts + atualize .env.example
```

Seções do checklist por tipo de PR:
| Tipo | Seções obrigatórias |
|---|---|
| Auth / sessão | Autenticação & Sessão + RBAC |
| Pagamento Stripe | Pagamentos + Secrets & Config |
| Dados de usuário/pet | LGPD + Saída & Erros |
| Geolocalização | Geolocalização & PostGIS + LGPD |
| Upload de arquivo | Validação de Input + LGPD |

---

## 6. Design system / token

```
1. docs/design-system/     → leia antes de qualquer mudança de token ou componente
2. /atomic-design          → classificação e reuse-first
3. ADR-0002                → novo par de token? Confira o contraste AA à mão — o gate contrast.test.ts
                             ainda não existe (ADR-0002 aceito, não implementado)
4. /loading-skeletons      → componente alterado? Sincronize o skeleton companheiro
```

> Nunca hardcode cor/espaçamento — apenas tokens semânticos (`--brand`, `--surface`, `--text`...).

---

## 7. Migrations de banco de dados

```
1. ARCHITECTURE.md §DB    → revise regras (transações, FK explícitas, soft delete, UTC)
2. prisma migrate dev      → gere a migration (nunca edite manualmente — protect-files.js bloqueia)
3. /tdd (integration)     → Testcontainers valida a migration contra banco real
```

> Migrations são determinísticas e reversíveis — nunca edite o arquivo gerado.

---

## 8. Fim de sessão longa / handoff

```
1. /handoff               → compacta o estado atual para o próximo agente/sessão
```

Use quando: contexto está próximo do limite, troca de turno, ou tarefa será continuada em outra sessão.

---

## 9. Criando ou melhorando uma skill

```
1. /skill-creator          → eval loop completo (draft → test → refine)
2. /find-skills            → verifique se já existe algo parecido antes de criar
```

---

## Regras transversais (sempre)

| Regra | Onde está |
|---|---|
| Stack obrigatória (Next.js 16, NestJS, Prisma, Vitest, Playwright...) | CLAUDE.md |
| Arquitetura (DDD Lite, Clean, Vertical Slice, Hexagonal) | ARCHITECTURE.md |
| TypeScript strict, sem `any`, discriminated unions | ENGINEERING_GUIDE.md |
| Copy em pt-BR, teal = primário, sem emoji em UI | atomic-design skill |
| Dinheiro em centavos, timestamps em UTC | CLAUDE.md |
| Logs estruturados, sem console.log em produção | ENGINEERING_GUIDE.md |

---

## Mapa rápido: skill → quando NÃO usar

| Skill | NÃO usar para |
|---|---|
| `atomic-design` | Hooks de dados, stores Zustand, testes, specs, backend |
| `loading-skeletons` | Mudança só de texto/cor/lógica sem alterar layout; backend/testes |
| `tdd` | Tarefas puramente de leitura/exploração sem código novo |
| `create-spec` | Bugfix trivial ou CRUD simples sem decisões não-óbvias |
| `handoff` | Sessões curtas onde o contexto cabe no próximo turno |
