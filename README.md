# PetNalia

Plataforma de cuidado veterinário domiciliar — conecta tutores de pets a veterinários para atendimento em casa e telemedicina.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Estrutura do monorepo](#estrutura-do-monorepo)
- [Pré-requisitos](#pré-requisitos)
- [Primeiros passos](#primeiros-passos)
- [Scripts disponíveis](#scripts-disponíveis)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados](#banco-de-dados)
- [Arquitetura](#arquitetura)
- [Documentação](#documentação)

---

## Visão geral

PetNalia é o equivalente veterinário de um marketplace de saúde, com foco em **visitas domiciliares** e **telemedicina**. Os domínios principais são:

| Domínio | Descrição |
|---|---|
| Tutores | Donos de pets — cadastro, perfil, histórico |
| Veterinários | Onboarding, verificação CRMV, agenda, área de atuação |
| Pets | Perfis com espécie, raça, peso, vacinas |
| Consultas | Agendamento, confirmação, cancelamento |
| Disponibilidade | Horários semanais + bloqueios pontuais |
| Avaliações | Notas e comentários pós-consulta |
| Assinaturas | Planos free/premium para veterinários |
| Notificações | E-mail e push via filas assíncronas |

---

## Stack

**Frontend**
- Next.js 15 · React 19 · TypeScript
- Tailwind CSS v4 · `@petnalia/ui` (design system próprio)
- TanStack Query v5 · React Hook Form · Zod · Zustand

**Backend**
- NestJS 10 · Prisma 6 · PostgreSQL 16 + PostGIS
- Redis 7 · BullMQ (filas assíncronas)
- Passport JWT · Argon2 · Helmet

**Monorepo**
- Turborepo · pnpm 10 workspaces

**Infra local**
- Docker Compose: PostgreSQL/PostGIS · Redis · MinIO (S3) · Mailhog

---

## Estrutura do monorepo

```
petnalia/
├── apps/
│   ├── api/          # NestJS — REST API, regras de negócio, workers
│   └── web/          # Next.js — App Router, Server Components
│
├── packages/
│   ├── ui/           # Biblioteca React com design system
│   ├── types/        # Contratos Zod compartilhados (request/response)
│   ├── validation/   # CPF, CRMV, CEP, telefone BR
│   ├── utils/        # Dinheiro (centavos), datas, formatação
│   ├── config/       # Env schema, constantes, feature flags
│   ├── tsconfig/     # Presets TypeScript base/next/nest/react-lib
│   └── eslint-config/# Flat configs ESLint por contexto
│
├── docs/
│   ├── architecture/ # ARCHITECTURE.md, ENGINEERING_GUIDE.md, TESTING_GUIDE.md, ADRs
│   └── design-system/# Tokens, componentes, guidelines, templates
│
└── infra/
    ├── postgres/     # init.sql (PostGIS extensions)
    └── gcloud/       # Scripts de ativação de conta GCloud
```

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 22 |
| pnpm | 10 |
| Docker + Docker Compose | qualquer versão recente |

---

## Primeiros passos

### 1. Clone e instale dependências

```bash
git clone git@github.com:Yanps/petnalia.git
cd petnalia
pnpm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env conforme necessário — os valores padrão funcionam para desenvolvimento local
```

### 3. Suba a infraestrutura local

```bash
docker compose up -d
# PostgreSQL :5432 · Redis :6379 · MinIO :9000/:9001 · Mailhog :8025
```

### 4. Execute as migrations e o seed

```bash
pnpm --filter @petnalia/api prisma:migrate:dev
pnpm --filter @petnalia/api prisma:seed
```

### 5. Inicie o ambiente de desenvolvimento

```bash
pnpm dev
# API  → http://localhost:4000
# Web  → http://localhost:3000
# Docs → http://localhost:4000/api (Swagger)
```

---

## Scripts disponíveis

Execute a partir da raiz do monorepo via Turborepo:

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia todos os apps em modo watch |
| `pnpm build` | Build de produção de todos os pacotes e apps |
| `pnpm typecheck` | Verifica tipos TypeScript em todo o monorepo |
| `pnpm lint` | Lint ESLint em todo o monorepo |
| `pnpm test` | Roda todos os testes (Vitest) |
| `pnpm test:coverage` | Testes com relatório de cobertura |
| `pnpm format` | Formata todo o código com Prettier |
| `pnpm clean` | Remove todos os artefatos de build |

Para comandos específicos de um pacote:

```bash
pnpm --filter @petnalia/api   prisma:studio
pnpm --filter @petnalia/api   prisma:migrate:dev
pnpm --filter @petnalia/web   build
```

---

## Variáveis de ambiente

Todas as variáveis estão documentadas em [`.env.example`](.env.example). As principais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | PostgreSQL com PostGIS |
| `REDIS_URL` | Redis para filas BullMQ |
| `JWT_ACCESS_SECRET` | Segredo do token de acesso (mín. 32 chars) |
| `S3_ENDPOINT` | MinIO local ou S3 em produção |
| `SMTP_HOST` | Mailhog local ou SMTP real |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token Mapbox para mapas |
| `STRIPE_SECRET_KEY` | Chave Stripe para pagamentos |
| `FEATURE_*` | Feature flags — todas desabilitadas por padrão |

---

## Banco de dados

O banco usa **PostgreSQL 16 com PostGIS** para consultas geoespaciais (área de atuação dos veterinários).

```bash
# Criar nova migration
pnpm --filter @petnalia/api prisma:migrate:dev -- --name nome-da-migration

# Aplicar migrations (produção)
pnpm --filter @petnalia/api prisma:migrate:deploy

# Abrir Prisma Studio
pnpm --filter @petnalia/api prisma:studio
```

Valores monetários são sempre armazenados em **centavos** (inteiro). Todos os timestamps são **UTC**.

---

## Arquitetura

O projeto segue **Clean Architecture + Vertical Slice + DDD Lite**:

- Controllers são finos — validam, delegam, mapeiam. Sem lógica de negócio.
- Services implementam os casos de uso.
- Repositories isolam o Prisma — único ponto de acesso ao banco.
- Contratos de API (`@petnalia/types`) são compartilhados entre web e API.
- Server Actions são apenas orquestração — toda lógica permanece na API.
- Eventos de domínio são assíncronos via BullMQ.

Para detalhes completos: [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | Estrutura, limites, infra, banco |
| [`docs/architecture/ENGINEERING_GUIDE.md`](docs/architecture/ENGINEERING_GUIDE.md) | Regras de engenharia (TypeScript, API, segurança) |
| [`docs/architecture/TESTING_GUIDE.md`](docs/architecture/TESTING_GUIDE.md) | Estratégia de testes e quality gates |
| [`docs/architecture/adr/`](docs/architecture/adr/) | Architecture Decision Records |
| [`docs/design-system/`](docs/design-system/) | Tokens, componentes, guidelines de UX |
| `http://localhost:4000/api` | Swagger UI (API em execução) |
