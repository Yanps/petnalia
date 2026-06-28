# PetNalia — Engineering Guide (Technical Constitution)

> This document is the **permanent source of truth** for how PetNalia is built. Every contribution — human or AI — MUST comply. When generating code, Claude Code MUST read this guide and [ARCHITECTURE.md](./ARCHITECTURE.md) first, and MUST read the design system in [`docs/design-system/`](../design-system/) before producing any UI.
>
> If a rule here conflicts with a habit, the rule wins. If two rules conflict, the more specific one wins; escalate genuine conflicts via an ADR (§17).

**Companion documents (read together):**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — structure, boundaries, infra, DB, migrations.
- [`docs/design-system/`](../design-system/) — branding, tokens, components, UX. **Source of truth for all UI.**

---

## 0 · How to read this guide

### 0.1 Normative keywords
- **MUST / MUST NOT** — non-negotiable. A PR violating a MUST is blocked.
- **SHOULD / SHOULD NOT** — strong default. Deviation requires a one-line justification in the PR.
- **MAY** — permitted, at the author's discretion.

### 0.2 Golden rules (the five that override everything)
1. **The contract is law.** All data crossing a boundary (HTTP, Server Action, form) MUST be a Zod schema from `@petnalia/types`, validated at runtime.
2. **Business logic lives in the domain.** Never in controllers, React components, Server Actions, or repositories.
3. **The web never touches the database.** `apps/web` talks only to the API (or Server Actions that call the API). Only `apps/api` owns persistence.
4. **Reuse the design system; never recreate a design decision.** UI is composed from `@petnalia/ui`. No ad-hoc colors, spacing, or shadows.
5. **Types and tests are not optional.** `strict` TypeScript, no `any`, and tests-first for business logic.

### 0.3 AI Agent Rules (Claude Code)

When generating code for PetNalia, Claude Code MUST:
- **Read [ARCHITECTURE.md](./ARCHITECTURE.md) first.**
- **Read this ENGINEERING_GUIDE.md first.**
- **Read [`docs/design-system/`](../design-system/) before generating any UI.**
- **Reuse existing components whenever possible** (compose from `@petnalia/ui`; never re-implement a design decision).
- **Follow the Atomic Design hierarchy** (Tokens → Atoms → Molecules → Organisms → Templates → Pages; never skip levels).
- **Generate tests together with production code** (TDD for business logic; respect the pyramid in §9).
- **Avoid creating duplicate abstractions** (search for an existing port, schema, util, or component before adding a new one).

When uncertain, **prefer the simpler implementation** (KISS · YAGNI · DDD Lite).

---

# PART I — ARCHITECTURE

## 1 · Backend architecture (Pragmatic DDD · Clean · Vertical Slice · Hexagonal)

PetNalia's backend combines four ideas that reinforce each other:
- **Vertical Slice** — code is organized by **feature/domain module**, not by technical layer. Everything for `appointments` lives under `modules/appointments/`.
- **Clean Architecture** — *within* a slice, dependencies point **inward**: `controller → service (use case) → repository (port)`. The domain core never imports infrastructure.
- **DDD (Lite)** — each module is a **bounded context** with its own ubiquitous language (Tutor, Veterinarian, Appointment, Slot, CRMV). Model the business with entities and value objects **where they reduce complexity** — not as a ceremony applied uniformly to every CRUD module.
- **Hexagonal** — services depend on **ports (interfaces)**; concrete adapters (Prisma, S3, Mailer, Stripe) are injected. This is what makes the domain testable in isolation.

### 1.1 DDD Lite

PetNalia adopts pragmatic DDD (**DDD Lite**).

- **Avoid excessive abstraction and tactical patterns unless domain complexity justifies them.**
- **Favor simplicity over theoretical purity.**
- Use **Aggregates, Value Objects, and Domain Events only when they provide clear business value.** Simple CRUD domains SHOULD remain simple.
- Complex domains — **Appointments**, **Availability**, **Subscriptions**, **Veterinarians** — MUST use richer domain modeling (entities, value objects, state machines, domain events).

### 1.2 Clean Architecture usage

- Simple CRUD modules MAY use a simplified **service + repository** structure (no separate `domain/` / `application/` layers).
- Complex domains MUST use the full Clean Architecture layering (`domain/` → `application/` → `infrastructure/` → `interface/`; see §1.4).
- **Avoid overengineering.** YAGNI applies to architecture too — add a layer when the complexity exists, not in anticipation of it.

### 1.3 The dependency rule (MUST)
```
HTTP / Queue (adapters in)
      │
      ▼
 Controller  ───────────────►  depends on ►  Service (use case)
                                                  │
                                                  ▼  depends on ► Port (interface)
                                          ┌───────┴────────┐
                                          ▼                ▼
                                   Repository Port    External Port
                                   (Prisma adapter)  (S3 / Mailer adapter)
```
- A **service** MUST NOT import `PrismaService`, `S3Client`, HTTP types, or any framework adapter directly. It depends on **interfaces**.
- A **repository** is the **only** place that touches `PrismaService`.
- The **domain core** (entities, value objects, domain services) MUST NOT import NestJS, Prisma, or `@nestjs/*` decorators.

### 1.4 Canonical module layout (MUST)
```
modules/appointments/
├── appointments.module.ts
├── application/                      # use cases (Clean "application" layer)
│   ├── book-appointment.use-case.ts
│   ├── cancel-appointment.use-case.ts
│   └── ports/                        # interfaces the use cases depend on
│       ├── appointment.repository.ts # interface (port)
│       └── slot-locker.port.ts
├── domain/                           # pure business model — NO framework imports
│   ├── appointment.entity.ts
│   ├── appointment-status.vo.ts      # value object + state machine
│   └── appointment.errors.ts         # domain errors
├── infrastructure/                   # adapters (Clean "infrastructure" layer)
│   ├── prisma-appointment.repository.ts  # implements the port
│   └── appointment.mapper.ts             # DB row ⇄ domain entity
├── interface/                        # delivery layer
│   ├── appointments.controller.ts    # thin HTTP boundary
│   └── appointments.events.ts        # BullMQ listeners
└── appointments.use-case.spec.ts     # unit tests (no DB)
```

> Simple CRUD modules (e.g. `pets`) MAY collapse `application/` + `domain/` into a single `service.ts` + `repository.ts`. Rich domains (`appointments`, `subscriptions`, `availability`, `veterinarians`) MUST use the full layout. Use judgment — but never put logic in the controller.

### 1.5 Example — thin controller → use case → port (illustrative)
```ts
// interface/appointments.controller.ts — THIN. Validate, delegate, map response.
@Controller({ path: 'appointments', version: '1' })
export class AppointmentsController {
  constructor(private readonly bookAppointment: BookAppointmentUseCase) {}

  @Post()
  @Roles('tutor')
  async book(
    @CurrentUser() user: AuthUser,
    @Body(new ZodBody(CreateAppointmentInput)) dto: CreateAppointmentInput, // from @petnalia/types
  ): Promise<AppointmentResponse> {
    const appointment = await this.bookAppointment.execute({ tutorId: user.id, ...dto });
    return AppointmentResponse.parse(appointment); // contract-validated output
  }
}

// application/book-appointment.use-case.ts — the business logic lives HERE.
@Injectable()
export class BookAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository, // PORT (interface)
    private readonly slots: SlotLockerPort,               // PORT
    private readonly events: DomainEventBus,
  ) {}

  async execute(cmd: BookAppointmentCommand): Promise<Appointment> {
    return this.appointments.transaction(async (tx) => {        // §8 transactions
      const slot = await this.slots.lock(cmd.slotId, tx);       // pessimistic lock
      if (!slot.isOpen()) throw new SlotUnavailableError(cmd.slotId);
      const appointment = Appointment.request(cmd, slot);       // domain decides validity
      await this.appointments.save(appointment, tx);
      await this.events.publish(appointment.pullEvents());      // → notifications/reminders
      return appointment;
    });
  }
}
```
**Rule:** if you can't unit-test a use case without a database, the boundaries are wrong.

---

## 2 · Frontend architecture (Atomic Design · Feature-based · RSC-first)

### 2.1 Atomic Design ownership (MUST)
The atomic hierarchy is **split by responsibility**:

| Layer | Lives in | Rule |
|---|---|---|
| Tokens, Atoms, Molecules, Organisms, domain components | **`@petnalia/ui`** | The reusable design system. Generic, app-agnostic. MUST be imported, never reimplemented. |
| Templates / Pages | **`apps/web/src/app/**`** | Compose organisms from `@petnalia/ui` with real data + state. |
| Feature compositions | **`apps/web/src/features/<feature>/`** | App-specific component groupings that wire data to UI. |

- You MUST NOT create a new color, spacing, radius, shadow, or font value in `apps/web`. Use design tokens (`--brand`, `--space-*`, Tailwind `@theme` aliases).
- You MUST NOT re-implement a component that exists in `@petnalia/ui` (e.g. `VetCard`, `AvailabilityCalendar`, `Button`). Compose it.
- New generic primitive needed? Add it to `@petnalia/ui` (following the design system), not to the app.
- Brand/content rules from the design system are binding: **pt-BR product copy, sentence case, address users as *você*, no emoji, no cartoon pets, teal=primary, green=availability/confirm only.**

### 2.2 Feature-based organization (MUST)
`apps/web/src/features/` mirrors the API domains 1:1 (`search`, `booking`, `pets`, `appointments`, `availability`, `vet-profile`, `subscription`, `admin`). Each feature folder:
```
features/booking/
├── components/      # server + client components for this feature
├── actions.ts       # 'use server' Server Actions (mutations)
├── queries.ts       # TanStack Query hooks + query-key factory
└── schema.ts        # re-exports @petnalia/types + feature-local form schemas
```
- A feature MUST NOT import another feature's internals. Share via `@petnalia/ui`, `@petnalia/types`, or `src/lib`.

### 2.3 Server Components first (MUST)
- Components are **Server Components by default.** Add `'use client'` **only** when the component needs: state/effects, event handlers, browser APIs, Mapbox GL, a form, or a Zustand store.
- Push `'use client'` to the **leaf**, never the page. A page stays a Server Component and renders small client islands.
- Data for initial render MUST be fetched on the **server** (RSC) via the typed API client, then streamed (Suspense). TanStack Query hydrates/refetches on the client for interactivity.

```tsx
// app/(public)/busca/page.tsx — Server Component, no 'use client'
export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = VetSearchQuery.parse(await searchParams);     // contract-validated input
  const results = await api.vets.search(query);               // server-side typed fetch
  return (
    <SearchTemplate>
      <SearchFiltersIsland defaultValue={query} />            {/* 'use client' island */}
      <ResultsGrid vets={results.items} />                    {/* @petnalia/ui organism */}
    </SearchTemplate>
  );
}
```

### 2.4 State management boundaries (MUST)
| State kind | Tool | Example |
|---|---|---|
| **Server state** (anything from the API) | **TanStack Query** | vet search results, appointments, profile |
| **Client UI state** (ephemeral, never persisted to server) | **Zustand** | filter drawer open, map viewport, multi-step booking wizard step |
| **Form state** | **React Hook Form + Zod** | every form, via `zodResolver` with a `@petnalia/types` schema |
| **URL state** (shareable, server-readable) | **searchParams** | search filters, pagination |

- Zustand MUST NOT hold server data. Server data MUST NOT be duplicated into Zustand.
- Mutations go through **Server Actions that call the API** (progressive enhancement + `revalidateTag`). Client-side `useMutation` is allowed for purely interactive flows, but the system of record is always the API.

---

# PART II — CODE QUALITY

## 3 · Clean Code · SOLID · DRY · KISS · YAGNI

### 3.1 General (MUST / SHOULD)
- **Names reveal intent.** `getVetsWithinRadius`, not `getData`. Booleans read as predicates (`isVerified`, `hasOpenSlots`).
- Functions SHOULD do one thing; keep them small. A function doing "and" in its name is a smell.
- **No magic numbers/strings.** Extract to named constants (`@petnalia/config` `CONSTANTS`) or enums.
- **Guard clauses over nested conditionals.** Return early.
- Comments explain **why**, not **what**. Delete commented-out code.
- **DRY** within a bounded context; **KISS** across boundaries (a little duplication beats a wrong abstraction). **YAGNI** — build for today's requirement, leave seams (ports, flags) for tomorrow. Don't build speculative generality.

### 3.2 SOLID with PetNalia examples
- **S**ingle Responsibility — `BookAppointmentUseCase` books; it doesn't send email (it emits an event). Notifications are a separate concern.
- **O**pen/Closed — adding a WhatsApp channel adds a `NotificationChannel` adapter; producers don't change.
- **L**iskov — every `AppointmentRepository` implementation (Prisma, in-memory test double) is substitutable; tests use the in-memory one.
- **I**nterface Segregation — `SlotLockerPort` exposes only `lock/release`, not the whole repository.
- **D**ependency Inversion — use cases depend on ports; adapters depend on ports. Wiring happens in the NestJS module.

### 3.3 Composition over inheritance (MUST)
- No deep class hierarchies. Compose behavior via injected collaborators (backend) and component composition / hooks (frontend).
- React: extract logic into hooks (`useBookingWizard`), not base components. No HOC pyramids.

---

# PART III — LANGUAGE & FRAMEWORK RULES

## 4 · TypeScript (MUST)

- `strict: true` everywhere (inherited from `@petnalia/tsconfig`). Also enable `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.
- **`any` is banned.** Use `unknown` + a Zod parse / type guard at boundaries. `// eslint-disable` of `no-explicit-any` requires a justification comment and reviewer sign-off.
- Prefer **`readonly`** for properties and `ReadonlyArray<T>` / `readonly T[]` for data that shouldn't mutate. Domain entities expose readonly state.
- Model variants as **discriminated unions**, not optional-field grab-bags.
- **Exhaustive checks** on every union/enum switch via `assertNever`.
- Derive types from schemas/values: `type Role = z.infer<typeof RoleSchema>`. Don't hand-maintain parallel types.
- No non-null assertions (`!`) except where provably safe with a comment. No `as` casts to launder types — parse instead.

```ts
// Discriminated union + exhaustive check
type AppointmentEvent =
  | { type: 'requested'; slotId: string }
  | { type: 'confirmed'; confirmedAt: Date }
  | { type: 'cancelled'; reason: string };

function reduce(state: Appointment, e: AppointmentEvent): Appointment {
  switch (e.type) {
    case 'requested': return state.markRequested(e.slotId);
    case 'confirmed': return state.confirm(e.confirmedAt);
    case 'cancelled': return state.cancel(e.reason);
    default: return assertNever(e); // compile error if a case is added and unhandled
  }
}

export function assertNever(x: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(x)}`);
}
```

## 5 · React / Next.js (MUST)

- Next.js **16 App Router** + **React 19**. No Pages Router. No `getServerSideProps`.
- Server Components by default; `'use client'` only when justified (§2.3).
- **Async params:** `params` and `searchParams` are Promises in Next 16 — `await` them.
- Data fetching: server-side in RSC for first paint; **TanStack Query** for client cache/refetch. Configure sensible `staleTime`; use a **query-key factory** per feature (no stringly-typed keys).
- **Forms:** React Hook Form + `zodResolver(schema)` where `schema` is from `@petnalia/types`. Never trust client validation alone — the Server Action / API re-validates.
- **Mutations:** Server Actions (`'use server'`) that call the API client; on success, `revalidateTag` / `revalidatePath`. Show optimistic UI only for low-risk interactions.
- Keys MUST be stable IDs, never array index. No side effects in render. Effects MUST clean up.
- Accessibility (from the design system) is mandatory: visible focus rings, ≥44px targets, labelled controls, AA contrast, `prefers-reduced-motion` honored.

```tsx
'use client';
export function PetForm({ onCreated }: { onCreated: () => void }) {
  const form = useForm<CreatePetInput>({ resolver: zodResolver(CreatePetInput) }); // @petnalia/types
  const onSubmit = form.handleSubmit(async (values) => {
    await createPetAction(values); // Server Action → API; re-validates server-side
    onCreated();
  });
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input label="Nome do pet" {...form.register('name')} error={form.formState.errors.name?.message} />
      <Button type="submit" loading={form.formState.isSubmitting}>Salvar</Button>
    </form>
  );
}
```

## 6 · NestJS (MUST)

- **Controllers are thin:** parse input (Zod), call exactly one use case/service, map output. No `if/else` business logic, no Prisma, no loops over domain rules.
- **Services / use cases** hold business logic and orchestrate ports.
- **Repositories** isolate persistence; the only place `PrismaService` appears. Return domain entities or DTOs, never leak Prisma model types past the repository.
- **DTOs come from `@petnalia/types`** (Zod schemas). Validate inbound with a `ZodValidationPipe`; parse outbound responses against the response schema.
- One responsibility per provider; wire dependencies via constructor injection and module providers (bind port → adapter).
- Use the global exception filter for the standard error envelope (§7.3). Throw **domain errors**; the filter maps them to HTTP.

---

# PART IV — API & DATA

## 7 · API design (MUST)

### 7.1 API-first (the API is the system of record)

- **The API is the single system of record.** All business state and rules live behind it.
- **All clients consume the same API contracts** (`@petnalia/types`): the **web**, **future mobile apps**, and **external integrations**.
- **Business rules MUST live only in the API.** Clients (web Server Actions, React components, mobile) orchestrate and present — they do not own business logic.
- **Clients MUST NOT duplicate business logic.** No re-implementing validation, pricing, eligibility, or state transitions on the client. Validate for UX, enforce on the API.

### 7.2 REST conventions

- **REST first.** Resource-oriented URLs, correct verbs/status codes. (GraphQL is out of scope unless an ADR adds it.)
- **Versioned:** every route under **`/v1`** (`@Controller({ version: '1' })`, URI versioning). Breaking changes → `/v2`, never mutate `/v1`.
- **OpenAPI:** generated and served (`/v1/docs`). Schemas derive from the Zod contracts (single source).
- **Standard error envelope** for every non-2xx (§7.3). Never leak stack traces or Prisma errors to clients.
- **Idempotency:** unsafe-to-retry mutations (booking, subscription create, payment) accept an `Idempotency-Key` header; the API dedupes via Redis. All `GET/PUT/DELETE` are naturally idempotent.
- **Pagination:** cursor or `page/pageSize` (documented in `CONSTANTS`); list responses return `{ items, total, page, pageSize }`.
- **Auth:** every endpoint is protected unless explicitly `@Public()`. Validate ownership in the service, not just the role.

### 7.3 Standard error envelope (MUST — defined in `@petnalia/types`)
```jsonc
{
  "error": {
    "code": "SLOT_UNAVAILABLE",          // stable, machine-readable enum
    "message": "Este horário não está mais disponível.", // pt-BR, user-safe
    "details": [{ "path": "slotId", "issue": "already_booked" }], // optional, e.g. Zod issues
    "correlationId": "01J..."            // ties to logs/traces (§10)
  }
}
```
- HTTP status reflects category (400 validation, 401 auth, 403 forbidden, 404, 409 conflict, 422 domain rule, 429 rate limit, 500). The `code` is the contract; clients switch on it, never on `message`.

## 8 · Database (MUST)

- **PostgreSQL + PostGIS.** Access only through Prisma + the repository layer (spatial SQL only in `GeoRepository`, §ARCHITECTURE 4.4).
- **UUID primary keys** (`gen_random_uuid()`); never expose sequential ids.
- **Soft delete** via `deletedAt`; a Prisma query extension filters `deletedAt IS NULL` by default. Hard delete only via LGPD erasure jobs.
- **Audit fields** on every table: `createdAt`, `updatedAt`, `createdById`, `updatedById`. High-value tables (`Appointment`, `Subscription`, `Veterinarian`) also append to `audit_log`.
- **Transactions for critical operations** (MUST): booking (slot lock + appointment write + event), subscription changes, anything spanning ≥2 writes that must be atomic. Use `prisma.$transaction` with the repository's `transaction()` helper; pick the right isolation level for slot contention (serializable / `SELECT … FOR UPDATE`).
- **Migrations** follow ARCHITECTURE §10 (Prisma Migrate; PostGIS via hand-edited `--create-only` SQL). Never edit an applied migration. Every migration is reviewed.
- Index every foreign key and every column used in a `WHERE`/`ORDER BY` on a hot path; GIST indexes for geography columns.

---

# PART V — TESTING

## 9 · Testing strategy (MUST)

### 9.1 TDD for business logic
- Use cases, domain entities, state machines (appointment status, subscription lifecycle, slot transitions), and pricing/geo logic MUST be developed **test-first**: red → green → refactor. The domain is testable without a DB (in-memory repository doubles).

### 9.2 The pyramid (target mix)
| Level | ~Share | Scope | Tools |
|---|---|---|---|
| **Unit** | **70%** | use cases, entities, hooks, components, Zod schemas, utils — no I/O | Vitest, Testing Library |
| **Integration** | **20%** | repository ↔ real DB, controller ↔ HTTP, feature ↔ mocked API | Vitest + **Testcontainers** (Postgres+PostGIS, Redis), **Supertest**, **MSW** (web) |
| **E2E** | **10%** | full-stack user journeys | **Playwright** against a seeded ephemeral stack |

### 9.3 Critical flows that MUST have E2E coverage
1. **Authentication** (register, login, refresh rotation, logout, role gating).
2. **Search veterinarians** (filters + PostGIS radius match + results).
3. **Book appointment** (slot select → confirm → notification).
4. **Veterinarian onboarding** (profile, service area, CRMV submit).
5. **Subscription flow** (upgrade to premium, webhook activation).

### 9.4 Rules
- Every bug fix MUST add a regression test reproducing the bug.
- Tests MUST be deterministic (no real network, no `Date.now()` without injection, no shared mutable state). Use factories/fixtures (per-entity) and a fresh DB per integration run.
- Coverage gates in CI (services/use cases ≥ 80%); coverage is a floor, not a goal — test behavior, not implementation.
- Name tests by behavior: `it('rejeita reserva quando o horário já está ocupado')`.

```ts
// Unit test of a use case with an in-memory repository (no DB) — TDD style
describe('BookAppointmentUseCase', () => {
  it('lança SlotUnavailableError quando o slot não está aberto', async () => {
    const slots = new InMemorySlotLocker({ 'slot-1': { status: 'booked' } });
    const useCase = new BookAppointmentUseCase(new InMemoryAppointments(), slots, new FakeEventBus());
    await expect(useCase.execute({ tutorId: 't1', slotId: 'slot-1' }))
      .rejects.toBeInstanceOf(SlotUnavailableError);
  });
});
```

---

# PART VI — CROSS-CUTTING CONCERNS

## 10 · Observability (MUST be wired from day one)

- **Structured logging:** JSON logs (pino), no `console.log` in app code. Every log line carries `correlationId`, `userId?`, `module`, `level`. Never log secrets, tokens, passwords, or full PII.
- **Correlation IDs:** a middleware generates/propagates `x-correlation-id` per request; it flows into logs, the error envelope, BullMQ job data, and downstream calls. The web forwards it from the browser.
- **OpenTelemetry:** the API, workers, and web server are instrumented (HTTP, Prisma, Redis, BullMQ spans). Trace context propagates across the queue. Exporter is configurable (OTLP).
- **Sentry:** wired in `apps/web` (RSC + client) and `apps/api` (+ workers). Errors include `correlationId` and release/version. PII scrubbed.
- **Health & metrics:** `/health` (liveness/readiness) and `/metrics` (Prometheus) on the API.

## 11 · Security (MUST — OWASP-aligned)

- **Input validation everywhere:** every external input parsed by a Zod schema at the boundary. Reject unknown fields (`.strict()` on inbound DTOs). This is the primary defense (injection, mass-assignment).
- **AuthZ:** RBAC via `RolesGuard` **plus** resource-ownership checks in services (a tutor can only read their own pets/appointments). Never rely on the client to hide data.
- **JWT rotation:** short-lived access + rotating, hashed refresh tokens with reuse detection and session-family revocation (ARCHITECTURE §5).
- **Secure cookies:** auth cookies are `httpOnly`, `Secure`, `SameSite=Lax`; CSRF protection on state-changing Server Actions/routes.
- **Rate limiting:** global throttler + stricter limits on auth, search, and write endpoints (Redis-backed); `429` with the standard envelope.
- **Headers:** `helmet` (CSP, HSTS, etc.) on the API; security headers on the web.
- **Secrets:** only via env (validated in `@petnalia/config`); never committed. No secret in client bundles (server-only env unless `NEXT_PUBLIC_`).
- **File uploads:** type/size validated, pre-signed URLs scoped, documents private (signed GET, ownership-checked).
- **Dependencies:** `pnpm audit` + Renovate; no known-critical vulns merged.
- **PII / LGPD:** minimize, encrypt in transit, support erasure (hard-delete job).

---

## 12 · Performance budgets (MUST be monitored)

**Web (Core Web Vitals — field targets):**
- **LCP < 2.5 s**
- **INP < 200 ms**
- **CLS < 0.1**

**API (server latency):**
- **P95 latency < 300 ms**
- **P99 latency < 1 s**

- These are budgets, not aspirations: regressions beyond target MUST block release or open a tracked perf issue.
- **Slow queries MUST be monitored and optimized** (log queries over threshold, add indexes, avoid N+1; the repository layer is the place to fix them).
- Measure in CI (Lighthouse/Playwright traces for web) and in production (OTel + RUM, §10).

## 13 · Cache strategy (MUST)

- Use **Next.js cache tags and revalidation** (`revalidateTag` / `revalidatePath`, `fetch` cache options) for server-rendered data.
- Prefer **stale-while-revalidate** semantics where appropriate (public/listing pages) for fast paints with fresh-enough data.
- **Cache invalidation MUST occur after mutations** — every Server Action/mutation that changes data revalidates the affected tags/paths (and busts the relevant Redis keys).
- **Redis MAY be used for server-side caching** of hot reads (vet search, profiles) with explicit TTLs and invalidation on write.
- Never cache per-user/authenticated data in a shared/public cache; key by user or mark dynamic.

## 14 · Feature flags (MUST)

- **All experimental features MUST be protected behind a feature flag.**
- Flags SHOULD support: **gradual rollout** (percentage/cohort), **A/B testing**, and **emergency disable** (kill switch).
- **The default state of any new experimental feature MUST be disabled.**
- Flags are defined and read via `@petnalia/config` (`featureFlags`); the same flag value MUST be consistently available to API and web. Remove a flag once the feature is fully rolled out (no permanent dead flags).
- Wiring already reserved in env (`FEATURE_*`, ARCHITECTURE §11).

---

# PART VII — PROCESS

## 15 · Git workflow (MUST)

- **Conventional Commits:** `type(scope): subject` — `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`, `ci`. Scope = package/module (`feat(appointments): lock slot on booking`). Drives changelog + semver.
- **Feature branches** off `main`: `feat/<short-slug>`, `fix/<short-slug>`. No direct commits to `main`.
- **Pull Requests required** — `main` is protected. PRs are small and focused; description links the issue and states what/why.
- **Code review mandatory:** ≥1 approval; CI green (lint, typecheck, tests, build, migration-drift) before merge. Reviewers check against this guide.
- Squash-merge with a Conventional Commit title. Delete the branch after merge.

### 15.1 Definition of Done (PR checklist — MUST all be true)
- [ ] Complies with the five golden rules (§0.2).
- [ ] `strict` TS passes; no new `any`; unions have exhaustive checks.
- [ ] All boundary I/O validated by a `@petnalia/types` Zod schema.
- [ ] Business logic in use cases/domain (not controllers/components/actions).
- [ ] UI composed from `@petnalia/ui`; tokens only; pt-BR copy; a11y AA.
- [ ] Tests added/updated; pyramid respected; critical flows keep E2E green.
- [ ] Logs structured w/ correlation id; no secrets/PII logged.
- [ ] Migration reviewed (if schema changed); transaction used for critical writes.
- [ ] New experimental features behind a flag, default-off; cache invalidated after mutations.
- [ ] Conventional Commit; docs/ADR updated if a decision changed.

## 16 · Naming & file conventions (MUST)

| Thing | Convention | Example |
|---|---|---|
| Files (TS/React) | `kebab-case` | `book-appointment.use-case.ts`, `vet-card.tsx` |
| React components | `PascalCase` export | `VetCard`, `BookingWizard` |
| Hooks | `useCamelCase` | `useBookingWizard` |
| Types/schemas | `PascalCase` schema, inferred type same name | `CreateAppointmentInput` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_SERVICE_RADIUS_KM` |
| DB tables | singular `PascalCase` (Prisma model) | `Appointment` |
| API routes | plural kebab nouns under `/v1` | `/v1/veterinarians`, `/v1/appointments` |
| Branches | `feat/…`, `fix/…` | `feat/service-area-polygon` |
| Test files | `*.spec.ts` (unit/int), `*.e2e.ts` (Playwright) | `book-appointment.use-case.spec.ts` |

## 17 · Decisions & exceptions (ADRs)

- A change to any rule in this guide, or a significant architectural choice, MUST be recorded as an **ADR** in `docs/architecture/adr/NNNN-title.md` (Context · Decision · Consequences) and referenced in the PR.
- This guide and ARCHITECTURE.md are living documents: update them in the same PR that changes the practice.

## 18 · Enforcement matrix (how each rule is guaranteed)

| Rule area | Enforced by |
|---|---|
| `strict` TS, no `any`, import boundaries | `@petnalia/tsconfig`, `@petnalia/eslint-config` (`no-explicit-any`, `no-restricted-imports`), `typecheck` in CI |
| Contract validation | Zod schemas in `@petnalia/types`, `ZodValidationPipe`, contract tests |
| Web ≠ DB, no cross-feature imports | ESLint boundary rules + Turbo graph + review |
| Design-system compliance | ESLint (no raw hex/px where token exists), review against `docs/design-system/` |
| Testing pyramid & coverage | Vitest coverage gates, Playwright suite, CI |
| Conventional Commits, PR, review | commitlint + Husky, branch protection on `main` |
| Migrations / drift | `prisma migrate diff` check in CI |
| Security headers, rate limit, validation | `helmet`, throttler, Zod, CI security scan |
| Observability | pino + OTel SDK + Sentry wired in bootstrap; health/metrics endpoints |
| API-first (no client-side business logic) | ESLint boundary rules, review; shared `@petnalia/types` contracts |
| Performance budgets | Lighthouse/Playwright in CI, OTel + RUM in prod, slow-query logging |
| Cache strategy | Next.js cache tags + `revalidateTag` on mutations; Redis TTLs |
| Feature flags (default-off) | `@petnalia/config` `featureFlags`, `FEATURE_*` env, review |

---

### Final word
PetNalia optimizes for **trust** — for pet owners and vets alike. Trustworthy software is **typed, tested, observable, secure, and consistent**. When in doubt, choose the boring, explicit, well-tested option. Reuse before you build. Validate at every boundary. Keep the domain pure.
