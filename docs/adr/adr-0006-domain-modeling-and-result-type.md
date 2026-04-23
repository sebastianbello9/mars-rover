---
title: "ADR-0006: Domain Modeling and Result Type"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "domain", "ddd", "result-type", "immutability"]
supersedes: ""
superseded_by: ""
---

# ADR-0006: Domain Modeling and Result Type

## Status

**Accepted**

## Context

ADR-0003 commits us to DDD-flavored value objects; this ADR fixes the two derived decisions that ripple through every domain file:

1. **Mutability**: do value objects mutate in place, or do transitions return new instances?
2. **Failure signalling**: when a rover encounters an obstacle, does the domain throw an exception, return `null`, set a boolean flag, or return a structured result?

Both decisions affect every call site, so they are resolved together.

## Decision

### Immutability

All domain types are **immutable**. Transitions return new instances:

```ts
const d2 = d1.turnLeft();               // Direction
const p2 = p1.moveBy(vector, grid);     // Position
```

Types are expressed as `readonly`-propertied interfaces with factory functions, or as `class`es whose methods only produce new instances. Never mutate fields.

### Failure signalling via discriminated union

Obstacle encounters are represented by a `RoverStatus` tagged union — **never** a thrown exception:

```ts
export type RoverStatus =
  | { readonly kind: 'Ok'; readonly position: Position; readonly heading: Direction }
  | { readonly kind: 'Blocked'; readonly lastPosition: Position; readonly heading: Direction; readonly obstacleAt: Position };
```

`Rover.execute(commands)` returns `RoverStatus`. The use case passes it through unchanged. The CLI adapter matches on `kind` to format output and choose an exit code.

## Consequences

### Positive

- **POS-001**: Exhaustive `switch` on `status.kind` is checked by the compiler — forgetting the `Blocked` branch is a compile error.
- **POS-002**: Immutable VOs are trivially safe to share across tests and across frames of recursion.
- **POS-003**: `Rover.execute` is a pure function in the mathematical sense: given the same `(planet, start, commands)`, it returns the same `RoverStatus`.
- **POS-004**: No exception stack unwinding in the domain means no I/O (stack traces) coupled to domain behavior.

### Negative

- **NEG-001**: Tiny allocation overhead per transition. Irrelevant at kata scale.
- **NEG-002**: Callers must remember to *assign* the result of each transition (`p = p.moveBy(...)` not `p.moveBy(...)`). `readonly` fields make the intent clear; ESLint catches the common mistake of ignoring a returned value if configured to do so.

## Alternatives Considered

### Mutable Classes with Setters

- **ALT-001**: **Description**: `Rover` holds mutable `position`/`heading` fields; `move()` updates them in place.
- **ALT-002**: **Rejection Reason**: Introduces aliasing bugs and makes parameterized tests awkward (each test case must construct a fresh object).

### Exceptions for Obstacle Encounters

- **ALT-003**: **Description**: `Rover.move` throws an `ObstacleError` carrying the obstacle position; the use case catches it.
- **ALT-004**: **Rejection Reason**: Obstacles are a **normal domain outcome**, not an error. Exceptions obscure control flow in the type signature, push error handling outside the compiler's exhaustiveness check, and couple the domain to the host's exception machinery.

### `null` or `undefined` on Blocked

- **ALT-005**: **Description**: Return `Position | null` from `Rover.execute`.
- **ALT-006**: **Rejection Reason**: Loses the information needed to report *which* obstacle blocked the rover. No principled place to encode the last valid position.

### Boolean Flag Plus Out-Parameter

- **ALT-007**: **Description**: `Rover.execute(commands, out: { obstacleAt?: Position })` returns a boolean.
- **ALT-008**: **Rejection Reason**: Out-parameters are alien to TypeScript; no ergonomic advantage over the union.

## Implementation Notes

- **IMP-001**: Every domain transition method returns the same VO type it lives on (or a `RoverStatus` for terminal moves). Void return types are forbidden in the domain layer.
- **IMP-002**: Use `Object.freeze` only where profiling shows a need; structural `readonly` in the type system is the primary guarantee.
- **IMP-003**: A single helper `ok(position, heading)` / `blocked(lastPosition, heading, obstacleAt)` pair keeps construction of `RoverStatus` centralized and searchable.

## References

- **REF-001**: [ADR-0003: Hexagonal + DDD](adr-0003-hexagonal-architecture.md)
- **REF-002**: [ADR-0002: Kata Scope](adr-0002-kata-scope.md)
- **REF-003**: Scott Wlaschin — "Railway Oriented Programming" — https://fsharpforfunandprofit.com/rop/ (applies conceptually even though we use TS)
