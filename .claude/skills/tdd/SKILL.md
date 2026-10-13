---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

When exploring the codebase, use the project's domain glossary so that test names and interface vocabulary match the project's language, and respect ADRs in the area you're touching.

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](interface-design.md)
- [ ] List the behaviors to test (not implementation steps)
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## PetNalia: stack de testes

O PetNalia usa **Vitest** (não Jest) em todos os packages. Configurações relevantes:

- **Unit tests:** `vitest` com `vi.mock()` para dublês de repositório — serviços testados sem banco de dados.
- **Integration tests:** `vitest` + **Testcontainers** (Postgres+PostGIS, Redis) — repositórios contra banco real.
- **E2E:** **Playwright** contra stack completa com seed.
- **Backend HTTP:** **Supertest** para contratos de controller.

Nomes de teste em **pt-BR** descrevendo comportamento:
```ts
it('rejeita reserva quando o horário já está ocupado')
it('emite AppointmentBooked ao confirmar consulta')
```

Cobertura mínima de serviços/use-cases: **80%** (gate de CI).

## Gotcha: alias de path não resolvido no Vitest

O Vitest precisa dos mesmos `paths` do `tsconfig.json` mapeados em `vitest.config.ts`. Se um import `@petnalia/types` ou `~/lib/...` não resolver, o teste falha com `Cannot find module` mesmo que o código compile. 

**Fix:** espelhe os `alias` do Tailwind/tsconfig no `resolve.alias` do `vitest.config.ts`:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: 'node' },
})
```

O plugin `vite-tsconfig-paths` resolve os paths automaticamente a partir do `tsconfig.json` — sem duplicação manual.

## Gotcha: Zustand persist — bumpar `version` ao mudar campo persistido

Ao **adicionar, remover ou trocar o default de qualquer campo** num store Zustand com `persist()`, é obrigatório:

1. Bumpar `version`.
2. Declarar `migrate()` que retorna o estado novo com o campo inicializado corretamente.

Sem isso, o `localStorage` stale do usuário (com a estrutura antiga) **sobrescreve silenciosamente** o novo comportamento em runtime — sem erro visível.

```ts
// stores/search-filters.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SearchFiltersState {
  radius: number;        // campo existente
  onlyVerified: boolean; // campo NOVO — exige migrate
}

export const useSearchFiltersStore = create<SearchFiltersState>()(
  persist(
    (set) => ({
      radius: 10,
      onlyVerified: false,
    }),
    {
      name: 'petnalia-search-filters',
      version: 2,  // bumpe a cada breaking change de campo persistido
      migrate: (state: unknown, fromVersion: number) => {
        const s = state as Partial<SearchFiltersState>;
        if (fromVersion < 2) {
          // campo novo: inicializar com default
          return { ...s, onlyVerified: false };
        }
        return s as SearchFiltersState;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ radius: state.radius, onlyVerified: state.onlyVerified }),
    },
  ),
);
```

**Regra:** mudou campo persistido → bumpa `version` + declara `migrate`. Sem exceção.

**Teste do migrate:**

```ts
it('migra store da v1 para v2 sem perder radius', () => {
  // simula localStorage stale (v1, sem onlyVerified)
  localStorage.setItem('petnalia-search-filters', JSON.stringify({
    state: { radius: 25 },
    version: 1,
  }));

  const { result } = renderHook(() => useSearchFiltersStore());

  expect(result.current.radius).toBe(25);          // preservado
  expect(result.current.onlyVerified).toBe(false); // inicializado pelo migrate
});
```

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
