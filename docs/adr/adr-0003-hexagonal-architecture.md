---
title: "ADR-0003: Hexagonal Architecture with DDD Value Objects"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "hexagonal", "ddd", "ports-and-adapters"]
supersedes: ""
superseded_by: ""
---

# ADR-0003: Hexagonal Architecture with DDD Value Objects

## Status

**Accepted**

## Context

The kata is small, but the user's explicit goal is to practice **deliberate architecture**. We must decide where domain logic lives, how it is decoupled from I/O, and how data is shaped at each layer.

Candidate styles:

- **Simple layered**: a single module with classes; pragmatic and fast.
- **Hexagonal (Ports & Adapters) with DDD-flavored domain model**: pure domain core surrounded by ports; adapters (CLI, tests) plug in from the outside.
- **Functional core / imperative shell**: pure functions for state transitions, thin imperative shell for I/O.
- **OOP state machine with Command pattern**: rover as a stateful object, commands as objects.

We want: testability, discoverability of the domain vocabulary, and a codebase that teaches the pattern to a reader.

## Decision

Adopt a **Hexagonal architecture with DDD value objects and aggregates**:

- `src/domain/` — pure TypeScript, no I/O, no `fs`, no `process`, no `Date.now()`. Contains `Direction`, `Position`, `Grid`, `Obstacle`, `Planet`, `Rover`, `Command`, `RoverStatus`.
- `src/application/` — use cases (input ports). `ExecuteCommandsUseCase` orchestrates domain objects; takes primitives/DTOs in, returns a domain `RoverStatus` out.
- `src/adapters/` — outer edges. Currently one: `cli/` (stdin/argv in, stdout/exit-code out).
- Value objects are **immutable**; any transition returns a new instance.

The dependency rule: adapters depend on application, application depends on domain, domain depends on nothing.

## Consequences

### Positive

- **POS-001**: Domain is exercised by unit tests with zero I/O mocking — pure inputs, pure outputs.
- **POS-002**: Adding a new adapter (HTTP server, library export, playground web UI) does not touch the domain.
- **POS-003**: The architecture makes the vocabulary of the problem explicit: a reader of `src/domain/` sees the Mars Rover domain without any runtime noise.
- **POS-004**: Immutability eliminates a class of bugs (aliased mutable state across moves) at the type level.

### Negative

- **NEG-001**: More files than a single-module solution — eight domain files for a ~200-line kata.
- **NEG-002**: Slight object-allocation overhead from immutability; irrelevant at kata scale but worth noting.
- **NEG-003**: The "application" layer is a single use case; it may feel like ceremony, but it is intentional as a teaching artifact and leaves room for a second use case later.

## Alternatives Considered

### Simple Layered (Single Module)

- **ALT-001**: **Description**: One `rover.ts` file with a `Rover` class and a `run(commands)` method; a CLI script imports it.
- **ALT-002**: **Rejection Reason**: Pragmatic but defeats the stated learning goal; the kata becomes invisible as an architecture exercise.

### Functional Core / Imperative Shell

- **ALT-003**: **Description**: Domain as pure functions over records; I/O in a thin wrapper.
- **ALT-004**: **Rejection Reason**: Valid and appealing in TypeScript, but the user picked Hexagonal + DDD explicitly. The value-object vocabulary (aggregate vs entity vs VO) is more teachable than "plain record + function".

### OOP State Machine with Command Pattern

- **ALT-005**: **Description**: Rover as a stateful object, each command as a polymorphic class with `apply(rover)`.
- **ALT-006**: **Rejection Reason**: Mutable state complicates testing and reasoning; the GoF ceremony adds no domain insight here.

## Implementation Notes

- **IMP-001**: Enforce layer boundaries with ESLint import rules once ADR-0010 (CI) is active.
- **IMP-002**: Domain files export **only** types and constructors; no default exports.
- **IMP-003**: `ExecuteCommandsUseCase` accepts a plain input DTO (grid size, obstacle list, start state, commands string) and returns `RoverStatus` — the use case is where primitives meet value objects, not the domain.

## References

- **REF-001**: [ADR-0001: Language and Runtime](adr-0001-language-and-runtime.md)
- **REF-002**: [ADR-0006: Domain Modeling & Result Type](adr-0006-domain-modeling-and-result-type.md)
- **REF-003**: [ADR-0007: CLI Adapter](adr-0007-cli-adapter.md)
- **REF-004**: Alistair Cockburn — "Hexagonal architecture" — https://alistair.cockburn.us/hexagonal-architecture/
- **REF-005**: Eric Evans — *Domain-Driven Design*, Addison-Wesley, 2003.
