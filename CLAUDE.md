# CLAUDE.md — PetNalia Operating Rules

> Permanent behavior and operating rules for Claude Code on this repository. These rules are binding. When they conflict with habit, the rules win.

---

## Project Overview

PetNalia is the **veterinary equivalent of Doctoralia, focused on home veterinary care** — connecting pet owners (*tutores*) with veterinarians for home visits and telemedicine.

**Core domains:** Tutors · Veterinarians · Pets · Appointments · Availability · Reviews · Subscriptions · Notifications.

---

## Source of Truth

Claude Code MUST read, **in this order**, before working:

1. **[ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)** — structure, boundaries, infra, DB, migrations.
2. **[ENGINEERING_GUIDE.md](./docs/architecture/ENGINEERING_GUIDE.md)** — enforceable engineering rules (the technical constitution).
3. **[docs/design-system/](./docs/design-system/)** — branding, tokens, components, UX. MUST be read before generating any UI.

When writing or changing tests, Claude MUST also follow **[TESTING_GUIDE.md](./docs/architecture/TESTING_GUIDE.md)** (testing strategy + quality gates).

**Conflict resolution:**
- **ENGINEERING_GUIDE.md overrides habits.**
- **ARCHITECTURE.md overrides assumptions.**
- **The Design System overrides UI decisions.**

---

## Technology Stack

**Frontend:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query · React Hook Form · Zod · Zustand.
**Backend:** NestJS · Prisma · PostgreSQL · PostGIS · Redis · BullMQ.
**Monorepo:** Turborepo · pnpm.

Claude MUST use these technologies and MUST NOT introduce alternatives without an ADR (`docs/architecture/adr/`).

---

## Architecture Rules

Claude **MUST**:
- Follow **DDD Lite** (pragmatic; richer modeling only where domain complexity justifies it).
- Follow **Clean Architecture** (dependencies point inward).
- Follow **Vertical Slice Architecture** (organize by domain module, not by layer).
- Follow **Atomic Design** on the frontend.
- Use **Hexagonal principles** (ports + injected adapters) where appropriate.

Claude **MUST NOT**:
- Place business logic in **controllers**.
- Place business logic in **React components** (or Server Actions).
- Access the database **outside repositories**.
- Duplicate domain rules across clients.

> Simple CRUD modules MAY use a simplified `service + repository` structure. Complex domains (Appointments, Availability, Subscriptions, Veterinarians) MUST use the full layering. **Avoid overengineering.**

---

## API Rules

- **The API is the system of record.** All business rules MUST live in the API.
- Web and future mobile clients MUST consume the **same contracts** (`@petnalia/types`). Clients MUST NOT duplicate business logic.
- Claude MUST use: **REST**, **versioned APIs (`/v1`)**, **OpenAPI**.
- Every boundary payload MUST be validated by a Zod schema from `@petnalia/types`.

---

## Shared Contracts

- All API request/response contracts MUST live in **`@petnalia/types`**.
- **Web, API, and future mobile clients MUST import the same contracts.**
- **Contract duplication is forbidden.**

---

## Error Handling Rules

- Claude MUST use a **standardized error envelope**.
- Errors MUST:
  - **have stable codes**;
  - **be localized when exposed to users** (pt-BR);
  - **never expose internal implementation details** (no stack traces / Prisma errors).
- **Domain errors MUST be explicit and typed.**

Example codes: `APPOINTMENT_NOT_AVAILABLE` · `VETERINARIAN_NOT_FOUND` · `OUTSIDE_SERVICE_AREA`.

---

## Idempotency Rules

- **Write operations that may be retried MUST be idempotent.**
- Examples: **appointment booking · payments · subscription activation**.
- Unsafe-to-retry mutations MUST accept an `Idempotency-Key` (deduped via Redis).

---

## TypeScript Rules

- `strict` mode MUST be enabled.
- Claude MUST NOT use `any` (use `unknown` + parse/guard).
- Claude MUST prefer `readonly` types.
- Claude MUST model variants as **discriminated unions**.
- Claude MUST add **exhaustive switch checks** (`assertNever`) on unions/enums.

---

## Frontend Rules

- **Server Components first.** Client Components only when necessary (`'use client'` at the leaf, never the page).
- Claude MUST use `@petnalia/ui` components and MUST NOT recreate existing components.
- Claude MUST respect the Atomic Design hierarchy:

  **Pages → Templates → Organisms → Molecules → Atoms → Tokens.**

**Business logic (MUST NOT):** Claude MUST NOT place business logic in:
- **React Components**
- **Server Actions**

Server Actions are **orchestration only** and MUST delegate to the API. **The API remains the single source of truth.**

**State (MUST):**
- **TanStack Query** for server state.
- **Zustand** for client UI state only (never server data).
- **React Hook Form + Zod** for forms.

---

## Backend Rules

- **Controllers MUST be thin** — validate, delegate, map. No business logic.
- **Services implement use cases.**
- **Repositories isolate persistence** — the only place that touches Prisma.
- Claude MUST use **dependency injection** (depend on ports/interfaces).
- Claude MUST **validate all input using Zod**.

---

## Domain Events

Claude SHOULD emit domain events for:
- `AppointmentBooked`
- `AppointmentCancelled`
- `SubscriptionActivated`
- `VeterinarianVerified`

**Events MUST be asynchronous whenever possible** — dispatched via **BullMQ**; side effects (notifications, reminders) MUST NOT block the request path.

---

## Database Rules

Claude MUST:
- **Generate Prisma migrations for every schema change.**
- **Never edit production data manually.**
- **Keep migrations deterministic and reversible.**
- **Use transactions for multi-step operations.**
- **Prefer explicit foreign keys and indexes.**
- **Use database constraints whenever possible.**

---

## Date and Time Rules

- **Store all timestamps in UTC.**
- Convert to local timezone **only in presentation layers**.
- Use **ISO 8601** for serialization.
- **Never store local times without timezone information.**

---

## Money Rules

- **Monetary values MUST be stored as integers in cents.**
- **Never use floating point for currency.**
- Currency defaults to **BRL**.

Example: `priceInCents = 9900 // R$ 99,00`

---

## Testing Rules

> Full strategy and quality gates: **[TESTING_GUIDE.md](./docs/architecture/TESTING_GUIDE.md)** — MUST be followed when writing tests.

- Claude MUST adopt **TDD for business logic**.
- **Every use case MUST have unit tests.**
- **Critical flows MUST have E2E tests** (Authentication · Search veterinarians · Book appointment · Veterinarian onboarding · Subscription).
- Claude MUST **generate tests together with production code**.
- Pyramid: ~70% unit · 20% integration · 10% E2E.
- Tools: **Vitest · Testing Library · Supertest · Playwright · Testcontainers**.

---

## Security Rules

Follow **OWASP** principles. Claude MUST always:
- **Validate input** (Zod at every boundary; reject unknown fields).
- **Sanitize output** (never leak stack traces / Prisma errors; standard error envelope).
- **Use RBAC** (roles + resource-ownership checks in services).
- **Use rate limiting** (auth, search, write endpoints).
- **Protect secrets** (env only, validated; never in client bundles or commits).

---

## Design System Rules

- Claude MUST read **[docs/design-system/](./docs/design-system/)** before generating UI.
- Claude MUST **reuse existing components**.
- Claude MUST NOT create new **colors**, **spacing**, or **typography scales**.
- Claude MUST use **design tokens only** (`--brand`, `--space-*`, `--radius-*`, Tailwind `@theme` aliases).
- Product copy MUST be **pt-BR**, sentence case, address users as *você*; **no emoji, no cartoon pets**; teal = primary, green = availability/confirm only; WCAG AA + visible focus rings.

---

## Localization Rules

- **UI copy MUST be pt-BR.**
- **Architecture MUST remain i18n-ready** for future locales — no hardcoded user-facing strings outside the i18n layer; keep all copy externalizable.

---

## Naming Conventions

- **Files and folders:** `kebab-case`.
- **React components:** `PascalCase`.
- **Hooks:** `useSomething`.
- **Types:** `PascalCase`.
- **Zod schemas:** `SomethingSchema`.
- **DTOs:** `SomethingDto`.
- **Enums:** `PascalCase`.
- **Constants:** `UPPER_SNAKE_CASE` when globally shared.

---

## Import Rules

- Prefer **absolute imports**; avoid deep relative imports.
- Use workspace packages: `@petnalia/ui` · `@petnalia/types` · `@petnalia/validation` · `@petnalia/utils`.
- Imports MUST be grouped, in order:
  1. External libraries
  2. Workspace packages
  3. Internal modules
  4. Relative imports
- **Unused imports MUST be removed.**

---

## Monorepo Rules

- Shared code MUST live inside `packages/`.
- Avoid duplication between apps.
- Prefer shared **contracts and validation schemas**.
- **Business rules MUST remain in the API layer.**

---

## Feature Flags

- Experimental features MUST be protected behind **feature flags**.
- Flags SHOULD support: **gradual rollout · A/B testing · emergency disable**.
- **The default state of experimental features MUST be disabled.**

---

## Performance

**Web targets:** LCP < 2.5 s · INP < 200 ms · CLS < 0.1.
**API targets:** P95 latency < 300 ms · P99 latency < 1 s.

- **Slow queries MUST be monitored and optimized.**
- Avoid unnecessary client-side JavaScript.
- Prefer **streaming and partial rendering** when possible.

---

## Observability Rules

Claude MUST:
- **Use structured logging.**
- **Propagate correlation IDs across requests.**
- **Emit domain events when appropriate.**
- **Prepare integrations for OpenTelemetry and Sentry.**

- Logs MUST be **machine-readable**.
- Claude MUST NOT use `console.log` in production code.

---

## Documentation Rules

- Claude MUST update documentation whenever architectural decisions change. Relevant files: **ARCHITECTURE.md · ENGINEERING_GUIDE.md · ADRs · API documentation**.
- Every significant architectural decision SHOULD generate an **ADR** (`docs/architecture/adr/`).

---

## Code Generation Rules

Before generating code, Claude MUST:
1. **Verify if similar code already exists.**
2. **Reuse existing abstractions** (ports, schemas, utils, components).
3. **Prefer simple solutions.**
4. **Avoid overengineering** (KISS · YAGNI · DDD Lite).
5. **Generate tests.**
6. **Update documentation when needed** (and record rule/architecture changes as an ADR).

**When uncertain, Claude MUST prefer the simplest implementation that satisfies current requirements.**

---

## AI Code Generation Rules

Before generating code, Claude MUST:
1. **Search for existing implementations.**
2. **Reuse existing abstractions.**
3. **Generate tests together with code.**
4. **Verify TypeScript types.**
5. **Update documentation when necessary.**

When uncertain, Claude MUST:
- Prefer the **simplest implementation** that satisfies current requirements.
- **Avoid premature abstraction.**
- **Avoid overengineering.**
- Generate only the **minimal code necessary**.
- **Preserve backward compatibility** whenever possible.
- **MUST NOT remove existing functionality without explicit instruction.**

---

## Final Principle

PetNalia values **Trust · Simplicity · Maintainability · Performance · Accessibility**.

**Code MUST optimize for long-term maintainability over short-term speed.**
