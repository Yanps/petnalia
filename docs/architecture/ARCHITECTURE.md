# PetNalia — Platform Architecture & Scaffolding Plan

> **Veterinário a domicílio, cuidado que chega até você.**
> A veterinary marketplace (Doctoralia for home vet care) connecting pet owners (*tutores*) with veterinarians for home visits and telemedicine.

**Status:** Architecture proposal — scaffolding plan only, no implementation.
**Author role:** Principal Software Architect / Staff Engineer.
**Last updated:** 2026-06-16.

> **Confirmed decisions (2026-06-16):**
> 1. **API contract** — `@petnalia/types` Zod schemas consumed by a hand-rolled **typed fetch client** (no ts-rest / OpenAPI codegen).
> 2. **Mutations** — primarily **Server Actions calling the NestJS API server-side** (progressive enhancement + revalidation; business logic stays in the API).
> 3. **Initial scaffold depth** — **compiling skeleton**: every folder/config/module created and type-checking, with stubbed implementations + TODOs.

---

## 0 · Architecture principles (the "why" behind every decision)

| Driver | How the architecture delivers it |
|---|---|
| **Scalability** | Stateless API (horizontal scale), Redis-backed sessions/queues, PostGIS spatial indexes, read-optimized query layer, BullMQ workers scaled independently from the HTTP tier. |
| **Developer Experience** | One `pnpm install` + `pnpm dev` boots everything; Turborepo caching; a single shared **contract package** so the API and web never drift; typed env; codegen for Prisma + API client. |
| **Type Safety** | **Zod is the single source of truth.** Schemas in `packages/types` infer TS types *and* validate at runtime on both ends. Prisma generates DB types. End-to-end: DB → API DTO → HTTP → React Query → form. |
| **Maintainability** | Strict domain boundaries (NestJS modules ↔ Next.js route groups ↔ contract slices), enforced import rules, ADRs, conventional commits. |
| **Testability** | Hexagonal-ish module design (services depend on injected ports), Testcontainers for integration, factory/fixture packages, Playwright against a seeded ephemeral DB. |
| **Performance** | Server Components by default, streaming + Suspense, edge-cached public pages (ISR), Redis caching for hot reads (vet search, profiles), DB connection pooling (PgBouncer-ready), image CDN. |

**Three load-bearing decisions** (detailed in §13):
1. **Zod-first shared contracts** — eliminates client/server type drift without a heavyweight codegen pipeline.
2. **PostGIS via Prisma `Unsupported` + raw SQL repository** — Prisma can't model `geography` natively; we isolate spatial queries behind a `GeoRepository`.
3. **Refresh-token rotation with hashed tokens + reuse detection** — secure auth that scales statelessly.

---

## 1 · Monorepo structure

Turborepo + pnpm workspaces. Build orchestration and remote caching via Turbo; dependency installation and workspace linking via pnpm.

```
petnalia/
├── apps/
│   ├── web/                      # Next.js 16 (App Router) — the marketplace front end
│   ├── api/                      # NestJS — REST API, auth, jobs
│   └── mobile/                   # (future) Expo / React Native — scaffold placeholder only
│
├── packages/
│   ├── ui/                       # PetNalia Design System as a real React component lib
│   ├── types/                    # Zod schemas + inferred types + shared contracts (THE CONTRACT)
│   ├── validation/               # Reusable Zod validators/refinements — BR rules (CPF, CEP, CRMV, phone)
│   ├── config/                   # Runtime config: env parsing (Zod), constants, feature flags
│   ├── utils/                    # Framework-agnostic pure helpers (dates/UTC, money in cents, formatters)
│   ├── eslint-config/            # Shared flat ESLint config
│   └── tsconfig/                 # Shared base tsconfig presets
│
├── docs/
│   ├── architecture/             # ← this document, ADRs, diagrams
│   └── design-system/            # design system source of truth (existing)
│
├── infra/
│   ├── docker/                   # Dockerfiles (api, web, worker) + compose files
│   ├── postgres/                 # init SQL (CREATE EXTENSION postgis), seed scripts
│   └── github/                   # reusable workflow fragments (optional)
│
├── .github/
│   └── workflows/                # CI/CD pipelines
│
├── turbo.json                    # pipeline: build, lint, test, typecheck, dev
├── pnpm-workspace.yaml
├── package.json                  # root scripts, devDependencies (turbo, prettier, husky)
├── .nvmrc                        # pin Node 22 LTS
├── .npmrc                        # pnpm settings (shamefully-hoist=false, strict-peer-deps)
├── docker-compose.yml            # local dev: postgres+postgis, redis, minio, mailhog
├── .env.example                  # documented, never committed real secrets
└── README.md
```

### 1.1 `apps/web` — Next.js 16

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (public)/             # route group — unauthenticated, ISR/SSG where possible
│   │   │   ├── page.tsx                      # Homepage
│   │   │   ├── busca/page.tsx                # Veterinarian Search (search params driven)
│   │   │   ├── vet/[slug]/page.tsx           # Veterinarian Profile
│   │   │   ├── para-veterinarios/page.tsx    # Veterinarian Landing Page
│   │   │   └── planos/page.tsx               # Pricing Page
│   │   │
│   │   ├── (auth)/               # login / register / forgot — centered card template
│   │   │   ├── entrar/page.tsx
│   │   │   ├── cadastro/page.tsx
│   │   │   └── recuperar-senha/page.tsx
│   │   │
│   │   ├── (tutor)/              # protected: role=tutor (layout enforces guard)
│   │   │   ├── painel/page.tsx               # Dashboard
│   │   │   ├── pets/...                       # list + [id] + novo
│   │   │   ├── consultas/...                  # Appointments list + [id]
│   │   │   └── perfil/page.tsx                # Profile
│   │   │
│   │   ├── (vet)/                # protected: role=veterinarian
│   │   │   ├── painel/page.tsx               # Dashboard
│   │   │   ├── perfil/page.tsx                # Profile Management
│   │   │   ├── disponibilidade/page.tsx       # Availability
│   │   │   ├── area-atendimento/page.tsx      # Service Area (Mapbox)
│   │   │   ├── consultas/...                  # Appointments
│   │   │   └── assinatura/page.tsx            # Subscription
│   │   │
│   │   ├── (admin)/              # protected: role=admin
│   │   │   ├── verificacao/page.tsx           # Veterinarian Verification (CRMV)
│   │   │   ├── consultas/page.tsx             # Appointments
│   │   │   └── usuarios/page.tsx              # Users
│   │   │
│   │   ├── api/                  # Route Handlers — BFF helpers, webhooks, auth cookie bridge
│   │   ├── layout.tsx           # root layout: fonts, theme provider, design tokens
│   │   └── globals.css          # imports design-system tokens (@import styles.css) + tailwind
│   │
│   ├── components/              # app-specific compositions (NOT design-system primitives)
│   ├── features/               # feature modules mirroring API domains (search, booking, pets…)
│   │   └── <feature>/
│   │       ├── components/      # client/server components for the feature
│   │       ├── actions.ts       # Server Actions
│   │       ├── queries.ts       # TanStack Query hooks + query keys
│   │       └── schema.ts        # re-exports from @petnalia/types, feature-local form schemas
│   ├── lib/
│   │   ├── api-client.ts        # typed fetch wrapper (reads @petnalia/types contracts)
│   │   ├── auth.ts              # session helpers, server-side guard utilities
│   │   ├── query-client.ts      # TanStack Query config
│   │   └── mapbox.ts           # Mapbox GL init + helpers
│   ├── stores/                 # Zustand stores (client-only ephemeral UI state)
│   └── middleware.ts           # auth/role gate at the edge, locale, redirects
├── public/
├── next.config.ts
├── tailwind.config.ts          # Tailwind v4 — @theme maps to design-system tokens
├── vitest.config.ts
├── playwright.config.ts
└── tsconfig.json
```

**Rendering policy:**
- **Server Components by default.** Data fetched on the server via the typed API client; results streamed.
- **Client Components only when necessary** — interactivity (Mapbox, search filters, forms, calendars, Zustand-driven UI). Marked `'use client'` at the leaf, not the page.
- **Server Actions** for mutations that benefit from progressive enhancement and revalidation (profile edits, booking confirmation, availability updates). Heavier/async flows still go through the NestJS API; Server Actions call the API client server-side.
- **Caching:** public pages use ISR (`revalidate`) + tag-based revalidation; authenticated pages are dynamic; hot read endpoints cached in Redis at the API tier.

### 1.2 `apps/api` — NestJS

```
apps/api/
├── src/
│   ├── main.ts                 # bootstrap, global pipes (ZodValidationPipe), helmet, cors
│   ├── app.module.ts
│   ├── modules/
│   │   ├── auth/               # AuthModule
│   │   ├── users/              # UsersModule
│   │   ├── pets/               # PetsModule
│   │   ├── veterinarians/      # VeterinariansModule
│   │   ├── appointments/       # AppointmentsModule
│   │   ├── availability/       # AvailabilityModule
│   │   ├── reviews/            # ReviewsModule
│   │   ├── notifications/      # NotificationsModule
│   │   ├── subscriptions/      # SubscriptionsModule
│   │   ├── geo/                # GeoModule (PostGIS)
│   │   └── admin/              # AdminModule
│   ├── shared/
│   │   ├── prisma/             # PrismaModule + PrismaService (extends client)
│   │   ├── redis/              # Redis + cache module
│   │   ├── queue/              # BullMQ registration, queue tokens
│   │   ├── storage/            # S3-compatible storage port + adapter
│   │   ├── mailer/             # email port + adapter (nodemailer → MailHog locally)
│   │   ├── guards/             # JwtAuthGuard, RolesGuard
│   │   ├── decorators/         # @CurrentUser, @Roles, @Public
│   │   ├── interceptors/       # audit, logging, soft-delete filter
│   │   └── filters/            # global exception filter → consistent error envelope
│   ├── jobs/                   # BullMQ processors (workers) — can run in-process or standalone
│   │   ├── email.processor.ts
│   │   ├── reminders.processor.ts
│   │   ├── subscription.processor.ts
│   │   └── crmv-verification.processor.ts
│   └── config/                 # ConfigModule wiring @petnalia/config env schema
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/                       # integration + e2e (Supertest), Testcontainers setup
├── vitest.config.ts
├── nest-cli.json
└── tsconfig.json
```

Each module follows a consistent internal layout:

```
modules/<domain>/
├── <domain>.module.ts
├── <domain>.controller.ts      # HTTP boundary; validates via Zod DTOs from @petnalia/types
├── <domain>.service.ts         # business logic / use cases
├── <domain>.repository.ts      # Prisma data access (only place that touches PrismaService)
├── dto/                        # thin re-exports / mappers over @petnalia/types schemas
├── events/                     # domain events emitted to the queue/event bus
└── <domain>.service.spec.ts    # unit tests
```

---

## 2 · Shared packages & dependency graph

```
Foundation (no runtime):   @petnalia/tsconfig   ·   @petnalia/eslint-config
                           (extended by every    (lint + import-boundary
                            tsconfig)             rules; consumed by all)

Leaves (lowest runtime tier):
   ┌─────────────────────┐        ┌──────────────────────────────────────┐
   │   @petnalia/utils   │        │        @petnalia/validation          │
   │ pure helpers, ZERO  │        │ Zod validators/refinements (CPF, CEP, │
   │ runtime deps        │        │ CRMV, BR phone) — dep: zod            │
   └──────────┬──────────┘        └────────────────────┬─────────────────┘
              │                                         │ reused by
              │                                         ▼
              │                          ┌──────────────────────────────┐
              │                          │       @petnalia/types        │
              │                          │  Zod contracts — THE CONTRACT │
              │                          │  dep: zod, validation         │
              │                          └───────────────┬──────────────┘
              │                                           ▲
              │                          ┌────────────────┴─────────────┐
              │                          │       @petnalia/config       │
              │                          │  env + constants · dep: zod,  │
              │                          │  types                        │
              │                          └───────────────┬──────────────┘
              ▼                                           │
   ┌─────────────────────┐                                │
   │    @petnalia/ui     │                                │
   │ design system (may  │                                │
   │ use utils) — react, │                                │
   │ radix, tailwind     │                                │
   └──────────┬──────────┘                                │
              │                                            │
        ┌─────┴───────────────────────┬────────────────────┘
        ▼                             ▼
┌────────────────┐           ┌────────────────┐           ┌──────────────┐
│   apps/api     │           │   apps/web     │◄──────────│  apps/mobile │ (future)
│   (NestJS)     │           │   (Next.js)    │  same      │   (Expo)     │
└────────────────┘           └────────────────┘  packages  └──────────────┘

  apps/api    imports:  types · validation · config · utils        (never ui — no React)
  apps/web    imports:  ui · types · validation · config · utils
  apps/mobile imports:  ui · types · validation · config · utils    (future)
```

**Rules of the graph (enforced by ESLint `no-restricted-imports` + Turbo):**
- `packages/*` may depend on other packages but **never** on `apps/*`.
- `apps/web` and `apps/mobile` may import `ui`, `types`, `validation`, `config`, `utils` — **never** `api` internals (only the published contract in `types`).
- `apps/api` imports `types`, `validation`, `config`, `utils` — **never** `ui` (no React in the backend).
- `utils` has **zero** runtime dependencies (pure helpers). `validation` depends only on `zod`.
- `types` depends only on `zod` and `validation` (to reuse BR refinements). It is the universal currency.
- No package imports `ui` except apps and `ui` itself; no app imports another app; no dependency cycles.

### Package responsibilities

| Package | Owns | Depends on | Key exports |
|---|---|---|---|
| **`@petnalia/types`** | Zod schemas for every entity, DTO, request/response, enum (roles, statuses), error envelope. Inferred TS types. | `zod`, `validation` | `UserSchema`, `CreateAppointmentInput`, `VetSearchQuery`, `Role`, `AppointmentStatus`, `ApiError` |
| **`@petnalia/validation`** | Reusable Zod validators/refinements & domain primitives — Brazilian rules: **CPF** (check digits), **CEP**, **CRMV**, **BR phone**; shared refinements consumed by `types` and forms. | `zod` | `cpf`, `cep`, `crmv`, `phoneBR`, `zCpf()`, `zCep()` |
| **`@petnalia/config`** | Env var schema + parse (fails fast), feature flags, app constants (radius limits, page sizes), URLs. | `zod`, `types` | `env`, `featureFlags`, `CONSTANTS` |
| **`@petnalia/utils`** | Framework-agnostic **pure helpers** — date/time (UTC, ISO 8601), money (cents ↔ BRL), pt-BR formatters (distance, phone), slug. No I/O, no framework. | — | `toCents`, `formatBRL`, `toUTC`, `formatDistanceKm`, `slugify` |
| **`@petnalia/ui`** | The PetNalia Design System compiled to a typed React lib (atoms→organisms), Tailwind preset, token CSS, `cn()` util. | `react`, `radix`, `tailwind` | `Button`, `VetCard`, `AvailabilityCalendar`, `tokens.css`, `tailwindPreset` |
| **`@petnalia/eslint-config`** | Flat config: TS, React, import-order, boundary rules, a11y. | eslint plugins | `base`, `next`, `nest`, `react` |
| **`@petnalia/tsconfig`** | `base.json`, `nextjs.json`, `nestjs.json`, `react-lib.json`. | — | tsconfig presets |

> **Note on `@petnalia/ui` vs. the existing design system.** The design system in `docs/design-system/` ships a compiled IIFE bundle (`window.VetNaliaDesignSystem_7efbb4`) for prototyping. For production we **port** those components into `packages/ui` as first-class TypeScript React components built on shadcn/ui + Radix, preserving every token, class (`vn-*`), prop name, and UX decision verbatim. The tokens CSS (`tokens/*.css`) moves in unchanged and feeds the Tailwind v4 `@theme`. This is a re-housing, **not** a redesign — no design decision is recreated.

---

## 3 · Domain boundaries & module responsibilities

Each backend module is a bounded context. The web `features/` folders mirror them 1:1, and each owns a slice of `@petnalia/types`.

| Module | Responsibility | Owns entities | Emits events | Key collaborators |
|---|---|---|---|---|
| **AuthModule** | Registration, login, JWT issue, refresh-token rotation + reuse detection, password reset, (future) magic link & Google OAuth, role assignment. | RefreshToken (Redis/DB) | `user.registered` | Users, Notifications |
| **UsersModule** | User + Profile CRUD, account settings, soft delete, audit. | User, Profile | `profile.updated` | Auth, Pets |
| **PetsModule** | Pet CRUD for tutores, photos, medical metadata. | Pet | `pet.created` | Users, Storage |
| **VeterinariansModule** | Vet profile, specialties, CRMV, verification state machine, base coordinates + service radius, premium tier flags. | Veterinarian, VeterinarianSpecialty | `vet.submitted_for_review`, `vet.verified` | Geo, Subscriptions, Admin |
| **AppointmentsModule** | Booking lifecycle (request→confirm→complete/cancel), slot reservation, conflict checks, status machine. | Appointment | `appointment.requested/confirmed/cancelled/completed` | Availability, Notifications, Geo |
| **AvailabilityModule** | Vet recurring schedules + concrete `AvailabilitySlot` generation, slot locking, exceptions/blackouts. | AvailabilitySlot | `slot.booked`, `slot.released` | Appointments |
| **ReviewsModule** | Post-appointment reviews + ratings, aggregate scores, moderation hooks. | Review | `review.created` | Appointments, Veterinarians |
| **NotificationsModule** | Notification records + delivery dispatch (email MVP; WhatsApp/push future). Listens to domain events → enqueues jobs. | Notification | — (consumer) | Queue, Mailer, all modules |
| **SubscriptionsModule** | Vet premium plans, billing webhooks (Stripe-ready), plan entitlements, lifecycle events. | Subscription | `subscription.activated/cancelled/payment_failed` | Veterinarians, Notifications |
| **GeoModule** | PostGIS spatial queries: match tutor address → vets within radius; reverse geocode; distance calc; **future polygon service areas**. | Address (geo columns) | — | Veterinarians, Appointments |
| **AdminModule** | CRMV verification queue + approve/reject, user management, appointment oversight, platform metrics. | — (cross-cutting) | `vet.verified/rejected` | Veterinarians, Users, Appointments |

**Cross-module communication:** synchronous calls go through injected service ports; asynchronous/side-effectful work is decoupled via **domain events → BullMQ queues** (e.g. `appointment.confirmed` → Notifications enqueues an email + a reminder). Notifications never block the request path.

---

## 4 · Database architecture

### 4.1 Engine & extensions
- **PostgreSQL 16** + **PostGIS 3.4** (`CREATE EXTENSION postgis;`), `pgcrypto` (UUIDs), `citext` (case-insensitive email).
- Migrations via **Prisma Migrate**; PostGIS-specific DDL (geography columns, GIST indexes) applied through **`--create-only` migrations hand-edited with raw SQL** (see §10).

### 4.2 Conventions (every table)
- **`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`** — UUID v4, never sequential exposure.
- **`createdAt timestamptz NOT NULL DEFAULT now()`**, **`updatedAt timestamptz`** (Prisma `@updatedAt`).
- **Soft delete:** `deletedAt timestamptz NULL`. A global Prisma query extension filters `deletedAt IS NULL` by default; hard delete reserved for GDPR/LGPD erasure jobs.
- **Audit fields:** `createdById UUID NULL`, `updatedById UUID NULL` (FK to User), populated by an interceptor from the request context. For high-value tables (Appointment, Subscription, Veterinarian) an append-only `audit_log` table records mutations.

### 4.3 Entities & relationships

```
User 1───1 Profile
User 1───* Pet                         (tutor's animals)
User 1───1 Veterinarian                (when role = veterinarian)
User 1───* Address                     (tutor saved addresses; vet base address)
User 1───* Notification
User 1───* Review                      (author)

Veterinarian *───* Specialty           via VeterinarianSpecialty
Veterinarian 1───* AvailabilitySlot
Veterinarian 1───* Appointment
Veterinarian 1───1 Subscription
Veterinarian 1───* Review              (subject)
Veterinarian 1───1 Address             (base location, has geo point + radius)

Pet 1───* Appointment
Address 1───* Appointment              (visit location)
AvailabilitySlot 1───1 Appointment     (a booked slot)
Appointment 1───1 Review               (post-visit)
```

| Entity | Notable columns | Geo / index notes |
|---|---|---|
| **User** | `email citext UNIQUE`, `passwordHash`, `role enum(tutor,veterinarian,admin)`, `emailVerifiedAt`, `status` | idx on `email`, `role` |
| **Profile** | `userId FK`, `fullName`, `phone`, `avatarUrl`, `locale` | — |
| **Pet** | `ownerId FK`, `name`, `species`, `breed`, `birthdate`, `weightKg`, `sex`, `neutered`, `microchip`, `photoUrl` | idx `ownerId` |
| **Veterinarian** | `userId FK`, `crmv`, `crmvState`, `bio`, `verificationStatus enum(pending,in_review,verified,rejected)`, `tier enum(free,premium)`, `serviceRadiusKm` | idx `verificationStatus`, `tier` |
| **VeterinarianSpecialty** | `veterinarianId FK`, `specialtyId FK` (join) | composite PK |
| **Specialty** | `name`, `slug` (reference table) | unique `slug` |
| **Address** | `userId FK`, `label`, street fields, `cep`, `geog geography(Point,4326)`, `serviceRadiusKm?` (for vet base), `serviceArea geography(Polygon,4326)?` (future) | **GIST index on `geog` and `serviceArea`** |
| **Appointment** | `tutorId`, `veterinarianId`, `petId`, `addressId`, `slotId`, `modality enum(home,online)`, `status enum(requested,confirmed,pending,completed,cancelled)`, `priceCents`, `notes` | idx `(veterinarianId,status)`, `(tutorId,status)`, `slotId UNIQUE` |
| **AvailabilitySlot** | `veterinarianId FK`, `startsAt`, `endsAt`, `status enum(open,held,booked,blocked)`, `recurrenceId?` | idx `(veterinarianId,startsAt)`, partial idx `status='open'` |
| **Review** | `appointmentId UNIQUE`, `authorId`, `veterinarianId`, `rating 1-5`, `text`, `publishedAt` | idx `veterinarianId` |
| **Subscription** | `veterinarianId UNIQUE`, `plan`, `status`, `provider`, `providerCustomerId`, `currentPeriodEnd`, `cancelAtPeriodEnd` | idx `status` |
| **Notification** | `userId FK`, `type`, `channel enum(email,whatsapp,push)`, `payload jsonb`, `readAt`, `sentAt`, `status` | idx `(userId,readAt)` |

### 4.4 Geolocation model
- **Vet base:** `Address.geog = geography(Point,4326)` + `serviceRadiusKm`.
- **Tutor address:** `geography(Point,4326)`.
- **Match query (radius MVP):**
  `ST_DWithin(vet.geog, :tutorPoint, vet.serviceRadiusKm * 1000)` — `geography` gives true meters; GIST index makes it index-assisted. Distance shown via `ST_Distance`.
- **Future polygon areas:** swap/augment the radius predicate with `ST_Contains(vet.serviceArea, :tutorPoint)`. The column already exists nullable; `GeoRepository` branches on its presence so the API contract doesn't change.
- All spatial SQL lives **only** in `GeoModule`'s `GeoRepository` (raw parameterized `$queryRaw`), keeping Prisma models clean and the rest of the app DB-engine-agnostic.

---

## 5 · Authentication & authorization

- **Strategy:** stateless JWT **access token** (short TTL ~15 min) + **refresh token** (long TTL ~30 days) with **rotation**.
- **Refresh-token rotation + reuse detection:** each refresh issues a new token and invalidates the prior; tokens stored **hashed** (Redis primary, DB fallback for audit), keyed per-device/session. A presented-but-already-rotated token ⇒ session family revoked (theft signal).
- **Transport:** web stores tokens in **httpOnly, Secure, SameSite=Lax cookies** (set via a Next.js Route Handler bridge so RSC fetches are authenticated). Mobile (future) uses secure storage + Authorization header.
- **Roles:** `tutor | veterinarian | admin`. Enforced at two layers:
  - **API:** `JwtAuthGuard` + `RolesGuard` (`@Roles('admin')`) + resource-ownership checks in services.
  - **Web:** `middleware.ts` edge guard per route group `(tutor)/(vet)/(admin)` + server-side session check in layouts.
- **Extensibility (future, scaffolded but disabled by flag):** magic-link (passwordless email token) and Google OAuth, both funneling into the same `AuthService.issueSession()` so token handling stays uniform.
- **Password storage:** Argon2id.

---

## 6 · Background jobs (BullMQ + Redis)

| Queue | Triggered by | Job(s) | Notes |
|---|---|---|---|
| **email** | domain events | send transactional email (confirmation, reset, receipt) | MVP delivery channel; idempotent by job id |
| **reminders** | `appointment.confirmed` | schedule reminder at T-24h / T-2h (delayed jobs) | cancelled if appointment cancelled |
| **subscription** | billing webhooks | activate / renew / dunning / cancel side-effects | retries with backoff |
| **crmv-verification** | `vet.submitted_for_review` | enqueue CRMV check task for admin queue / external lookup | feeds AdminModule verification |

- **Workers** run as the same NestJS image with a `--worker` entrypoint (separate container/replica set in production) so HTTP and job processing scale independently.
- **Reliability:** exponential backoff, max attempts, dead-letter queue, BullMQ board (admin-only) for observability. Jobs are **idempotent** (dedupe by deterministic job key).
- **Scheduling:** repeatable jobs (e.g. nightly subscription sweeps) via BullMQ cron.

---

## 7 · Notifications

- **MVP:** email only, through a `MailerPort` (nodemailer → **MailHog** locally, SMTP/SES in prod).
- **Architecture:** `NotificationsModule` subscribes to domain events, writes a `Notification` row, and enqueues delivery on the `email` queue. The **channel is an abstraction** (`NotificationChannel` port) so **WhatsApp** (Cloud API) and **push** (FCM/APNs) plug in later without touching producers.
- **Preferences:** per-user channel/type preferences stored on Profile (future-ready column).

---

## 8 · File storage

- **S3-compatible** via a `StoragePort` (AWS SDK v3). **MinIO** locally, S3/R2 in prod.
- **Buckets / prefixes:** `vet-photos/`, `pet-photos/`, `documents/` (CRMV docs — private, signed-URL access only).
- **Upload flow:** client requests a **pre-signed PUT URL** from the API (authorized, size/type validated via Zod) → uploads directly to storage → API stores the resulting key. Avoids proxying large files through the API.
- **Delivery:** public images via CDN; private documents via short-lived signed GET URLs gated by role/ownership.

---

## 9 · Testing strategy

| Level | Frontend (`apps/web`) | Backend (`apps/api`) |
|---|---|---|
| **Unit** | Vitest + Testing Library — components, hooks, Zod schemas, Zustand stores. | Vitest — services/use-cases with mocked repository ports. |
| **Integration** | Vitest — feature flows with mocked API client (MSW). | Vitest + **Testcontainers** (Postgres+PostGIS, Redis) — repository + module wiring against a real DB; **Supertest** for controller/HTTP contracts. |
| **E2E** | **Playwright** — critical journeys: search→book, vet onboarding, admin verification — against a seeded ephemeral stack. | (covered by Playwright hitting the full stack in CI) |

- **Shared contract tests:** because both ends import `@petnalia/types`, a single suite asserts request/response payloads satisfy the Zod schemas — guaranteeing API↔web alignment.
- **Fixtures/factories:** a `test/factories` set (per entity) shared via a lightweight internal package or `apps/api/test/factories`.
- **Coverage gates** enforced in CI per package (e.g. services ≥ 80%).

---

## 10 · Migration strategy

1. **Source of truth:** `apps/api/prisma/schema.prisma`. Prisma models cover relational columns; PostGIS columns declared as `Unsupported("geography(Point, 4326)")` so Prisma tracks them without trying to type them.
2. **Standard migrations:** `prisma migrate dev` (local) → `prisma migrate deploy` (CI/prod). Never edit applied migrations.
3. **PostGIS / spatial DDL:** generate with `prisma migrate dev --create-only`, then **hand-edit the SQL** to add `CREATE EXTENSION IF NOT EXISTS postgis;`, geography columns, and `CREATE INDEX ... USING GIST (...)`. Commit the edited migration.
4. **Extension bootstrap:** the very first migration (or `infra/postgres/init.sql` in the Docker image) enables `postgis`, `pgcrypto`, `citext` so fresh databases and Testcontainers come up ready.
5. **Seeding:** `prisma/seed.ts` populates specialties, demo vets (with realistic São Paulo coordinates), and an admin user — reused by local dev and Playwright.
6. **Zero-downtime in prod:** expand→migrate→contract pattern (add nullable column → backfill via job → enforce constraint in a later migration). Migrations run as a pre-deploy CI step gated on green tests.
7. **Backfills:** one-off data migrations run as BullMQ jobs or `tsx` scripts under `apps/api/scripts/`, never inline in schema migrations.

---

## 11 · Environment variables

Parsed and validated once in `@petnalia/config` (Zod) — the app **fails to boot** on a missing/invalid var. `.env.example` documents every key.

```dotenv
# ── Core ───────────────────────────────────────────
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:4000

# ── Database ───────────────────────────────────────
DATABASE_URL=postgresql://petnalia:petnalia@localhost:5432/petnalia?schema=public
# (PgBouncer pooling URL in prod via DATABASE_URL + DIRECT_URL for migrations)
DIRECT_URL=postgresql://petnalia:petnalia@localhost:5432/petnalia?schema=public

# ── Redis / Queues ─────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Auth ───────────────────────────────────────────
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
# (future) GOOGLE_OAUTH_CLIENT_ID / SECRET, MAGIC_LINK_SECRET

# ── Storage (S3 / MinIO) ───────────────────────────
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET=petnalia
S3_FORCE_PATH_STYLE=true

# ── Email ──────────────────────────────────────────
SMTP_HOST=localhost
SMTP_PORT=1025          # MailHog
SMTP_FROM="PetNalia <nao-responda@petnalia.com.br>"

# ── Geo / Maps ─────────────────────────────────────
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# ── Billing (future) ───────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# ── Feature flags ──────────────────────────────────
FEATURE_MAGIC_LINK=false
FEATURE_GOOGLE_OAUTH=false
FEATURE_WHATSAPP=false
FEATURE_POLYGON_SERVICE_AREA=false
```

Public (browser-exposed) vars are prefixed `NEXT_PUBLIC_` and validated separately; secrets never reach the client bundle.

---

## 12 · Docker & local development

**`docker-compose.yml`** (dev dependencies — apps run on host via `pnpm dev` for HMR, or containerized):

| Service | Image | Port | Purpose |
|---|---|---|---|
| `postgres` | `postgis/postgis:16-3.4` | 5432 | DB with PostGIS preinstalled; `init.sql` enables extensions |
| `redis` | `redis:7-alpine` | 6379 | cache + BullMQ |
| `minio` | `minio/minio` | 9000/9001 | S3-compatible storage + console |
| `mailhog` | `mailhog/mailhog` | 1025/8025 | SMTP sink + web UI |

**Production images** (`infra/docker/`), multi-stage, pnpm + Turbo prune for slim builds:
- `Dockerfile.api` — builds `apps/api` (+ generates Prisma client).
- `Dockerfile.web` — builds `apps/web` (Next standalone output).
- `Dockerfile.worker` — same base as api, `--worker` entrypoint (BullMQ processors).

Each uses `turbo prune --scope=<app>` to produce a minimal context, then installs only that app's dependency closure → small, cacheable layers.

---

## 13 · Key architectural decisions (ADR summaries)

**ADR-001 · Zod-first shared contracts.** A single `@petnalia/types` package holds Zod schemas; types are *inferred*, validation is *runtime*, and both API and web consume them. Rejected: separate DTO classes + manual TS interfaces (drift risk), full OpenAPI codegen (heavier toolchain). Trade-off: discipline required to keep schemas in `types`, not inline.

**ADR-002 · PostGIS behind a repository, not in Prisma models.** Prisma lacks first-class geography support; modeling it as `Unsupported` + isolating spatial SQL in `GeoRepository` keeps the ORM ergonomic while enabling indexed `ST_DWithin`/`ST_Contains`. Trade-off: spatial queries are raw SQL (well-contained, parameterized).

**ADR-003 · Refresh-token rotation with reuse detection.** Stateless access + rotating, hashed refresh tokens with session families gives security (theft detection) without sticky sessions. Trade-off: a Redis round-trip on refresh.

**ADR-004 · Event-driven side effects via BullMQ.** Notifications, reminders, verification, billing reactions are decoupled from request handling through domain events → queues. Trade-off: eventual consistency for side effects (acceptable; the booking write itself is transactional).

**ADR-005 · Server Components by default, API as system of record.** Next.js renders/streams on the server and uses Server Actions for ergonomic mutations, but **NestJS remains the single source of business logic**. The web never talks to the DB directly. Trade-off: one extra hop vs. a unified ownership/testability boundary — worth it.

**ADR-006 · Design system ported, never recreated.** `packages/ui` re-houses the existing PetNalia design system (tokens, `vn-*` classes, component APIs) as typed React on shadcn/Radix. Trade-off: an upfront porting pass; payoff is production-grade, tree-shakeable components honoring every brand decision.

---

## 14 · CI/CD strategy (GitHub Actions)

**Pipeline philosophy:** Turbo-cached, affected-only, fail-fast, everything reproducible from `pnpm`.

```
PR opened / push to feature branch
└─ ci.yml
   ├─ setup: pnpm install --frozen-lockfile, restore turbo cache
   ├─ lint        → turbo run lint   (affected)
   ├─ typecheck   → turbo run typecheck (affected)
   ├─ unit tests  → turbo run test   (affected, Vitest)
   ├─ integration → spin Postgres+PostGIS + Redis (services), Prisma migrate, Vitest+Supertest
   ├─ build       → turbo run build  (affected)
   └─ e2e (label-gated / nightly) → Playwright against docker-compose stack

merge to main
└─ release.yml
   ├─ build & push images (api, web, worker) to registry (tag = sha + semver)
   ├─ run prisma migrate deploy against staging
   ├─ deploy staging → smoke tests
   └─ manual approval → deploy production (blue/green)
```

- **Caching:** Turbo remote cache keyed by content hash → unchanged packages skip work.
- **Quality gates:** lint + typecheck + tests + coverage thresholds must pass before merge; Prisma migration check (no drift) in CI.
- **Security:** `pnpm audit`, secret scanning, Dependabot/Renovate for updates.
- **Conventional commits** drive changelog + semver tagging.
- **Environments:** preview (per-PR web deploy), staging (auto on main), production (gated).

---

## 15 · Build & scaffold order (recommended sequencing)

1. **Foundation:** root tooling (`pnpm-workspace`, `turbo.json`), `tsconfig`, `eslint-config`, `utils`, `validation`, `types` (core enums + entity schemas), `config`.
2. **Data layer:** `apps/api` Prisma schema + initial migration (with PostGIS bootstrap) + seed; `docker-compose` for deps.
3. **API skeleton:** Nest app, shared modules (prisma, redis, queue, storage, mailer, guards), then domain modules in dependency order: Auth → Users → Pets → Veterinarians → Geo → Availability → Appointments → Reviews → Subscriptions → Notifications → Admin.
4. **UI package:** port design-system tokens + components into `packages/ui`.
5. **Web app:** App Router shell, route groups, auth bridge/middleware, then feature folders mirroring API modules.
6. **Jobs & notifications:** wire BullMQ processors + email.
7. **Testing harness:** Vitest/Playwright configs, Testcontainers, factories, seed-driven E2E.
8. **CI/CD:** workflows + Docker prod images.

---

## Appendix · Tech-stack-to-responsibility map

| Concern | Technology |
|---|---|
| Monorepo / build | Turborepo, pnpm |
| Web runtime | Next.js 16 (App Router, RSC, Server Actions), React 19 |
| Web data/state | TanStack Query (server state), Zustand (UI state), React Hook Form + Zod (forms) |
| Styling/UI | Tailwind CSS v4, shadcn/ui, Radix UI, `@petnalia/ui` design system |
| Maps | Mapbox GL JS (service area, coverage, search map) |
| API | NestJS, Zod validation pipe |
| ORM / DB | Prisma, PostgreSQL 16, PostGIS 3.4 |
| Cache / queue | Redis, BullMQ |
| Storage | S3-compatible (MinIO/S3/R2) |
| Email | nodemailer (MailHog → SES/SMTP) |
| Auth | JWT (access + rotating refresh), Argon2id |
| Types/contract | Zod + TypeScript (`@petnalia/types`) |
| Infra | Docker, Docker Compose, GitHub Actions |
| Testing | Vitest, Testing Library, Playwright, Supertest, Testcontainers |
```
