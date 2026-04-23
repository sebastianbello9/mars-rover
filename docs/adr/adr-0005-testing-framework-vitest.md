---
title: "ADR-0005: Testing Framework (Vitest)"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "testing", "vitest", "tooling"]
supersedes: ""
superseded_by: ""
---

# ADR-0005: Testing Framework (Vitest)

## Status

**Accepted**

## Context

Strict TDD (ADR-0004) demands a fast, ESM-native test runner with a watch mode that re-runs in well under a second for a kata-sized suite. TypeScript sources must be runnable without a separate compile step. Coverage must be computable with a single flag.

## Decision

Use **Vitest 1.x** as the test runner with `@vitest/coverage-v8` for coverage reports.

- Configuration lives in `vitest.config.ts` at repo root.
- Test files are `*.spec.ts` under `tests/` (mirrors the `src/` layout: `tests/unit/`, `tests/acceptance/`).
- Coverage includes `src/domain/**` and `src/application/**` with lines/branches/functions/statements thresholds at 95%.
- Globals (`describe`, `it`, `expect`) are enabled for ergonomics.

## Consequences

### Positive

- **POS-001**: Vitest runs TypeScript sources directly via esbuild — zero additional compile step in the TDD loop.
- **POS-002**: Watch mode re-runs only affected tests in tens of milliseconds.
- **POS-003**: Jest-compatible matcher API keeps the kata approachable to readers familiar with Jest.
- **POS-004**: v8 coverage is accurate for ES2022 targets, unlike istanbul's instrumentation for recent syntax.

### Negative

- **NEG-001**: Vitest is newer than Jest; some rarely-used matchers differ. Not a real issue for this kata.
- **NEG-002**: Bundled assertion library is less ergonomic than Chai for deep-diff messages; acceptable given how small the domain is.

## Alternatives Considered

### Jest

- **ALT-001**: **Description**: The de facto JS test runner; mature ecosystem.
- **ALT-002**: **Rejection Reason**: Jest's ESM story still requires experimental flags and `ts-jest` or Babel transformers — friction the kata does not need.

### Node's built-in `node:test`

- **ALT-003**: **Description**: Standard-library runner shipped with Node 20+.
- **ALT-004**: **Rejection Reason**: Minimal matchers, less polished watch mode, weak coverage integration. Good for tiny scripts, not TDD.

### Mocha + Chai

- **ALT-005**: **Description**: Classic combo with explicit assertion library.
- **ALT-006**: **Rejection Reason**: Separate coverage tooling, separate TS loader, slower cold start. No win over Vitest.

## Implementation Notes

- **IMP-001**: `test.include` pins matched files to `tests/**/*.spec.ts` to avoid picking up stray `*.test.ts` files or colocated fixtures.
- **IMP-002**: Coverage `include` is scoped to `src/domain/**` and `src/application/**`; adapters are intentionally out of scope for the 95% bar.
- **IMP-003**: `--coverage` is only run in CI and on demand; the default watch loop skips instrumentation for speed.

## References

- **REF-001**: [ADR-0004: Strict TDD Workflow](adr-0004-strict-tdd-workflow.md)
- **REF-002**: [ADR-0010: CI Pipeline](adr-0010-ci-pipeline.md)
- **REF-003**: Vitest documentation — https://vitest.dev
