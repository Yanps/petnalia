# PetNalia — Testing Guide

> Defines the **testing strategy and quality gates** for the entire PetNalia platform. These rules are binding and enforced in CI. They extend, and MUST stay consistent with, [ENGINEERING_GUIDE.md §9](./ENGINEERING_GUIDE.md) and [CLAUDE.md](../../CLAUDE.md).

**Read first (source of truth, in order):**
1. [ARCHITECTURE.md](./ARCHITECTURE.md) — boundaries, modules, infra.
2. [ENGINEERING_GUIDE.md](./ENGINEERING_GUIDE.md) — engineering rules (testing = §9).
3. [CLAUDE.md](../../CLAUDE.md) — operating rules.

Normative keywords: **MUST / MUST NOT** = blocking · **SHOULD / SHOULD NOT** = strong default (deviation needs justification) · **MAY** = permitted.

---

## 1 · Testing philosophy

PetNalia adopts:
- **Test Pyramid** — many fast unit tests, fewer integration, very few E2E.
- **TDD for business logic** — Red → Green → Refactor.
- **Shift-left testing** — defects caught at the lowest, cheapest level; tests authored with the code, not after.
- **Fast feedback loops** — the local + CI suites MUST be fast enough to run on every change.

**Quality is everyone's responsibility.** Tests are not a separate phase or a separate role.

---

## 2 · Testing pyramid

Target distribution across the codebase:

| Level | Target | Speed | Scope |
|---|---|---|---|
| **Unit** | **70%** | ms | pure logic, no I/O |
| **Integration** | **20%** | 10s–100s ms | real DB/Redis/queue, HTTP |
| **End-to-End** | **10%** | seconds | full-stack user journeys |

- Claude **MUST** favor unit and integration tests whenever possible.
- Claude **MUST NOT** write excessive E2E tests — they are slow, brittle, and expensive. Reserve E2E for the critical flows in §7.
- A bug at level N MUST be reproduced by a test at the **lowest level that can express it** (prefer a unit test over an E2E test).

---

## 3 · General rules

Claude **MUST**:
- **Generate tests together with production code** (never "later").
- **Keep tests deterministic** — no reliance on wall-clock, randomness, ordering, or network. Inject clocks and random sources.
- **Avoid flaky tests** — no arbitrary `sleep`; await explicit conditions.
- **Prefer explicit assertions** — assert exact expected values, not just "truthy".
- **Use realistic fixtures** (see §8).
- **Isolate external dependencies** — stub third parties (S3, email, payment, maps) at the port boundary.

Tests **MUST** be **independent and order-agnostic** (any subset, any order, passes).
Tests **MUST NOT** share mutable state (no cross-test globals; fresh fixtures per test).

- Test names MUST describe **behavior**: `it('rejeita reserva quando o horário já está ocupado')`.
- Every bug fix **MUST** add a regression test that fails before the fix and passes after.

---

## 4 · TDD rules

Business logic (use cases, domain entities, value objects, state machines, pricing, geo matching) **MUST** follow:

```
Red  →  Green  →  Refactor
(failing test)  (make it pass)  (improve, behavior preserved)
```

- **Every use case MUST begin with tests** — write the failing test first.
- **Refactoring MUST preserve behavior** — the test suite is the contract; green stays green.
- A use case that cannot be unit-tested **without a database** is a design defect (fix the boundaries, §ARCHITECTURE / hexagonal ports).

---

## 5 · Backend testing

**Tools:** **Vitest** (runner) · **Supertest** (HTTP) · **Testcontainers** (real Postgres+PostGIS, Redis).

### Unit tests (no I/O)
- **Domain entities** — invariants, state transitions.
- **Value objects** — equality, validation, formatting.
- **Use cases** — business rules, with **in-memory repository/port doubles** (no DB).
- **Services** — orchestration logic.

### Integration tests (real infrastructure via Testcontainers)
- **Repositories** — queries, soft-delete filtering, audit fields.
- **Prisma** — migrations apply; spatial queries (`ST_DWithin`) return correct matches.
- **Redis** — caching, refresh-token rotation, idempotency keys.
- **BullMQ** — jobs enqueue, process, retry, and are idempotent.

### API tests (Supertest against the Nest app)
- **Authentication** — login, refresh rotation + reuse detection, logout.
- **Authorization** — RBAC roles + resource-ownership (a tutor cannot read another tutor's data).
- **Validation** — Zod rejects bad/unknown fields with the standard error envelope.
- **Error handling** — stable error `code`s, correct HTTP status, no leaked internals (no stack traces / Prisma errors).

---

## 6 · Frontend testing

**Tools:** **Vitest** · **Testing Library** · **Playwright**.

### Unit tests
- **Hooks** (e.g. `useBookingWizard`).
- **Utilities** and **formatters** (pt-BR currency, dates, distance).
- **State stores** (Zustand — UI state transitions).
- **Zod schemas** (form/contract validation).

### Component tests (Testing Library)
- **Atoms · Molecules · Organisms** from `@petnalia/ui` and feature compositions.
- Query by **role/label/text**, interact as a user would; assert visible behavior.

Rules:
- Claude **MUST** test **behavior, not implementation details** (no asserting on internal state, class names, or call counts where a user-visible outcome exists).
- Claude **MUST** use **MSW** to mock the API at the network boundary for feature/integration tests — not by mocking the api-client internals.
- Claude **MUST NOT** use snapshot testing **except** for very stable, presentational components; snapshots MUST be small and reviewed, never giant auto-blobs.

---

## 7 · E2E testing

**Tool:** **Playwright**, run against a seeded ephemeral full stack (§9 database).

**Critical flows that MUST have E2E coverage:**
1. User registration
2. Login
3. Search veterinarians
4. View veterinarian profile
5. Book appointment
6. Appointment confirmation
7. Veterinarian onboarding
8. Availability management
9. Subscription flow

- E2E tests **MUST** assert real user-visible outcomes (confirmation screen, persisted appointment, sent notification record).
- E2E tests **MUST** be resilient (stable selectors via `data-testid` or roles; no brittle CSS/text coupling).
- New product surface outside these flows **SHOULD NOT** add E2E unless it is genuinely critical — cover it with unit/integration instead.

---

## 8 · Test data

- Claude **MUST** use **factories and fixtures**; Claude **MUST NOT** hardcode data inline across tests.
- Factories **MUST** generate **realistic Brazilian (pt-BR) data**, valid where the domain validates it:
  - **CPF** (valid check digits) · **CEP** · **phone numbers** (BR format) · **pet names** (Mel, Thor…) · **CRMV** (e.g. `CRMV-SP 28431`) · São Paulo coordinates for geo.
- Factories **MUST** allow overrides (`makeVet({ verificationStatus: 'verified' })`) and produce **unique** values per call to keep tests independent.
- A shared `test/factories` set (one per entity) is reused by backend integration tests and Playwright seeding.

---

## 9 · Database testing

- Claude **MUST** use **isolated databases** — never a shared/long-lived dev DB.
- Claude **MUST** use **Testcontainers** whenever possible (Postgres+PostGIS with extensions bootstrapped: `postgis`, `pgcrypto`, `citext`).
- Each test suite **MUST clean its own data** (transaction rollback per test, or truncate/reset between suites).
- Tests **MUST NOT** depend on production data, production services, or manual seeding.

---

## 10 · Contract testing

- API contracts are defined **only** in **`@petnalia/types`** (Zod schemas).
- Clients and API **MUST** use the **same contracts** — a contract test asserts request/response payloads satisfy the shared schema, guaranteeing API ↔ web ↔ mobile alignment.
- Contract **duplication is forbidden** (consistent with CLAUDE.md → Shared Contracts).
- **Breaking changes require all of:** a **version bump** (`/v2`, never mutate `/v1`), a **migration plan**, and an **ADR** (`docs/architecture/adr/`).

---

## 11 · Performance testing

Monitor:
- **Query performance** — log and fail on queries exceeding threshold; assert no N+1 in hot paths.
- **API latency** — budgets: **P95 < 300 ms**, **P99 < 1 s** (ENGINEERING_GUIDE §12).
- **Rendering performance** — Web Vitals budgets: **LCP < 2.5 s · INP < 200 ms · CLS < 0.1**, measured via Lighthouse/Playwright traces in CI.

- Critical endpoints (vet search, booking) **SHOULD** have benchmarks; regressions beyond budget MUST block release or open a tracked perf issue.

---

## 12 · Accessibility testing

UI **MUST** comply with **WCAG AA** (design-system mandate).

Test:
- **Keyboard navigation** — every interactive element reachable and operable.
- **Focus states** — visible focus rings, logical focus order, focus trapping in overlays.
- **Screen readers** — correct roles, labels, and `aria-*` (via Radix primitives).
- **Contrast ratios** — AA in both light and dark themes.

- Automated a11y assertions (axe via Testing Library/Playwright) **MUST** run on key pages and components; violations fail the build.
- Touch targets **MUST** be ≥ 44px; `prefers-reduced-motion` **MUST** be honored.

---

## 13 · CI/CD quality gates

Every pull request **MUST** pass, before merge:
- ✅ **Type checking** (`strict`, no `any`)
- ✅ **Lint** (incl. import-boundary rules)
- ✅ **Unit tests**
- ✅ **Integration tests**
- ✅ **E2E tests** (critical flows)
- ✅ **Build verification**

`main` is protected; gates are non-negotiable and Turbo-cached/affected-only for speed.

### Coverage thresholds (enforced)

**Global (MUST):**
| Metric | Threshold |
|---|---|
| Statements | ≥ 80% |
| Branches | ≥ 80% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

**Critical domains (MUST — higher bar):**
| Domain | Threshold |
|---|---|
| Appointments | ≥ 90% |
| Payments | ≥ 90% |
| Authentication | ≥ 90% |

> Coverage is a **floor, not a goal** — high coverage of meaningless assertions is still a failure. Test behavior and edge cases, not lines.

---

## 14 · Anti-patterns

Claude **MUST NOT**:
- **Test implementation details** (internal state, private methods, render internals).
- **Write flaky tests** (timing/order/randomness dependence).
- **Depend on network access** (no live third-party calls in unit/integration).
- **Use production services** or production data.
- **Mock everything** — over-mocking tests the mocks, not the system.

Claude **SHOULD** prefer **real integrations** whenever practical (Testcontainers over mocked DB; MSW over hand-stubbed clients).

---

## Final principle

- **Tests are documentation** — they specify behavior and intent.
- **Reliable tests increase delivery speed** — they enable fearless refactoring.
- **Fast feedback is more valuable than perfect coverage** — optimize the loop, then the breadth.
