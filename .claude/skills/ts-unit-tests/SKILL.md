---
name: ts-unit-tests
description: House rules for writing TypeScript unit tests in this repository - Vitest, file layout, what every test file must cover, and how to verify. Preloaded into the local workers; use it whenever you write or review unit tests here.
---

# TypeScript unit tests (Vitest)

- Vitest only (`import { describe, it, expect } from 'vitest'`); no new dependencies, no mocks of our own modules.
- One file per module: tests for `src/lib/<module>.ts` go in `tests/unit/<module>.test.ts`, one `describe` per
  exported function.
- Import the code under test the way the app does: `import { formatDuration } from '../../src/lib/format'`.
- Time is always an explicit parameter: build a fixed `const now = new Date('2026-10-29T15:00:00Z')` and derive
  every timestamp from it (`new Date(now.getTime() - 30 * 60_000)`); never call `Date.now()` in a test.
- Fixtures: small, explicit objects with the project's types (`import type { Case } from '../../src/data/types'`
  or wherever the type lives: check with Grep), built by a local `makeCase(overrides)` helper that returns a complete,
  valid object (nested objects too). Never cast a partial object with `as` to satisfy a type.
- Every exported function gets: the normal case, every rule in the spec, the boundaries (exactly at a threshold,
  one unit before, one unit after), empty or missing values, and each exception the spec names.
- Assert exact values (`expect(formatDuration(90 * 60_000)).toBe('1h 30m')`), not truthiness.
- Test names say the behaviour, with the numbers from the spec: `it('returns "1h 30m" for ninety minutes')`.
- The rules come only from the lead's brief. Never take a business rule from an example, the README or the data.
- Do not change the code under test. If a test exposes a real bug, keep the test and report the bug.
- Use the project's commands (`npm run typecheck`, `npx vitest run <file>`), not your own compiler invocations.
- Verify before you finish: `npx vitest run tests/unit/<module>.test.ts` must pass (or fail only on the bugs you
  reported). If the implementation does not exist yet, say so and make sure the file at least type-checks against
  the spec's signatures.
