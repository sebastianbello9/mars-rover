---
title: "ADR-0004: Strict Outside-In TDD Workflow"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "tdd", "testing", "workflow"]
supersedes: ""
superseded_by: ""
---

# ADR-0004: Strict Outside-In TDD Workflow

## Status

**Accepted**

## Context

The kata is a test-driven design exercise by tradition. We must decide how strict to be: does every line of production code require a preceding failing test, or is "test-after" acceptable? We also need to decide whether to drive tests from the outside in (acceptance-first) or bottom-up (value objects first).

## Decision

Follow **strict outside-in TDD**:

1. **Red**: write one failing test that describes the next smallest behavior the system lacks.
2. **Green**: write the minimum production code that makes the test pass — not one line more.
3. **Refactor**: clean up production and test code without changing behavior; re-run the suite after every change.
4. Each red → green → refactor cycle is committed separately with a Conventional Commit (see ADR-0008).
5. The first test in a feature branch is either a new acceptance test (for the use case) or the next unit test for a value object. Work from the outside in when introducing new use cases, bottom-up when growing an existing one.

No production code is written without a failing test driving it.

## Consequences

### Positive

- **POS-001**: Every line of production code has a reason to exist, expressed as a test.
- **POS-002**: Design pressure from tests naturally pushes toward small, cohesive value objects.
- **POS-003**: A reader of the git log sees the design evolve one behavior at a time.
- **POS-004**: Regressions are caught immediately because the entire suite is re-run on every change.

### Negative

- **NEG-001**: Strict TDD is slower than code-first for trivial modules; we accept the overhead as the cost of teaching.
- **NEG-002**: Over-literal interpretation can lead to micro-tests that couple tests to implementation. We mitigate by favoring behavior-level assertions and refactoring aggressively in the green step.

## Alternatives Considered

### Test-After

- **ALT-001**: **Description**: Implement production code; write tests afterward to document and guard it.
- **ALT-002**: **Rejection Reason**: Loses the design-pressure benefit of TDD; the kata becomes a typing exercise.

### Spike-Then-TDD

- **ALT-003**: **Description**: Build a throwaway prototype to explore the domain, delete it, then start TDD.
- **ALT-004**: **Rejection Reason**: The Mars Rover domain is well understood; there is nothing to learn from a spike that is not learned faster from the first failing test.

## Implementation Notes

- **IMP-001**: Run `npm run test:watch` throughout development; the suite must stay under five seconds end-to-end for watch to be usable.
- **IMP-002**: Test files colocate by layer under `tests/unit/` (value objects, aggregates) and `tests/acceptance/` (use cases).
- **IMP-003**: A commit is either a `test:` or a `feat:` — mixing "test + implementation" into one commit hides the red/green step.
- **IMP-004**: Coverage thresholds of 95% on `src/domain/**` and `src/application/**` are enforced in CI (ADR-0010); the CLI adapter is not subject to the same threshold.

## References

- **REF-001**: [ADR-0005: Testing Framework](adr-0005-testing-framework-vitest.md)
- **REF-002**: [ADR-0008: Conventional Commits](adr-0008-conventional-commits.md)
- **REF-003**: [ADR-0010: CI Pipeline](adr-0010-ci-pipeline.md)
- **REF-004**: Kent Beck — *Test-Driven Development: By Example*, Addison-Wesley, 2002.
