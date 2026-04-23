---
title: "ADR-0001: Language and Runtime"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "language", "runtime", "typescript"]
supersedes: ""
superseded_by: ""
---

# ADR-0001: Language and Runtime

## Status

**Accepted**

## Context

The Mars Rover kata is a classic exercise in domain modeling. Before writing a single line of code, we need to pick a language and runtime. Selection criteria for this repository:

- Expressive static type system (the domain model leans heavily on discriminated unions and value objects).
- First-class support for a modern test runner (we follow strict TDD).
- Low friction for a CLI adapter (stdin/argv, exit codes).
- Wide availability for future contributors and readers of the kata.
- Ecosystem that encourages small, composable pure modules.

The author is comfortable with TypeScript, Python, Java, and C#.

## Decision

Use **TypeScript** (ES2022 syntax, `"strict": true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) on **Node.js 20 LTS or later**. Modules are ESM (`"type": "module"`). TypeScript is run through `tsx` in development and compiled via `tsc` for release artifacts.

## Consequences

### Positive

- **POS-001**: TypeScript's discriminated unions model `RoverStatus = Ok | Blocked` naturally, enabling exhaustive `switch` without casts.
- **POS-002**: Structural typing lets us express value objects as readonly interfaces/records without bespoke base classes.
- **POS-003**: Node 20 ships a stable `stream`, `readline`, and `process` API that supports the CLI adapter with no extra dependencies.
- **POS-004**: Ecosystem tooling (Vitest, ESLint, Prettier) is mature and fast, keeping the TDD inner loop under two seconds.

### Negative

- **NEG-001**: TypeScript is a transpiled language; we accept a small toolchain surface (`tsc`, `tsx`, `vitest`) compared with a single-binary runtime such as Go.
- **NEG-002**: ESM + Node can produce frustrating import-extension errors; we mitigate by using `"moduleResolution": "Bundler"` and avoiding relative `.js` suffixes.
- **NEG-003**: Performance is not competitive with compiled languages, but this is irrelevant for a kata.

## Alternatives Considered

### Python 3

- **ALT-001**: **Description**: Typed Python (3.12 + mypy) with `pytest`.
- **ALT-002**: **Rejection Reason**: Discriminated unions are simulated via `typing.Literal` + isinstance checks, verbose compared with TypeScript's natural form. Value-object immutability requires `@dataclass(frozen=True)`, not the default.

### Java 21

- **ALT-003**: **Description**: Sealed interfaces + records, JUnit 5, Gradle.
- **ALT-004**: **Rejection Reason**: Excellent domain modeling, but toolchain overhead (JVM cold start, Gradle daemon) is disproportionate for a kata. Contributors less likely to have Java 21 installed than Node 20.

### C# / .NET 8

- **ALT-005**: **Description**: C# records, pattern matching, xUnit.
- **ALT-006**: **Rejection Reason**: Comparable expressiveness to TypeScript, but team convention leans toward JS/TS for public kata repos.

## Implementation Notes

- **IMP-001**: Enable `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` in `tsconfig.json` to catch off-by-one and undefined access at compile time.
- **IMP-002**: Pin Node via `"engines": { "node": ">=20" }` in `package.json` and surface the same version in CI.
- **IMP-003**: Avoid `any`; prefer `unknown` with narrowing for adapter boundaries.

## References

- **REF-001**: [ADR-0003: Architectural Style (Hexagonal + DDD)](adr-0003-hexagonal-architecture.md)
- **REF-002**: [ADR-0005: Testing Framework (Vitest)](adr-0005-testing-framework-vitest.md)
- **REF-003**: TypeScript Handbook — https://www.typescriptlang.org/docs/handbook/
- **REF-004**: Node.js 20 LTS release notes — https://nodejs.org/en/blog/announcements/v20-release-announce
