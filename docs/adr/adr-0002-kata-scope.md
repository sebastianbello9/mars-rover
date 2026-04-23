---
title: "ADR-0002: Kata Scope"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "scope", "requirements"]
supersedes: ""
superseded_by: ""
---

# ADR-0002: Kata Scope

## Status

**Accepted**

## Context

The Mars Rover kata has several canonical variants. We must fix the scope up front so that tests, the domain model, and documentation all target the same behavior. Variants considered:

- **Classic**: `L/R/M` commands on a finite rectangular grid with a bounded edge; the rover reports its final `(x, y, heading)`.
- **Spherical**: wrap-around on both axes (moving off the right re-enters on the left).
- **Obstacle detection**: the rover refuses to execute a move that would land on an obstacle and reports its last valid position plus the obstacle it encountered.
- **Multi-rover / batch I/O**: multiple rovers, formatted input file, formatted output list (the full Codurance / Google Code Jam brief).

Adding scope increases domain complexity; reducing scope limits the learning value of the exercise.

## Decision

Scope the kata to the **spherical planet with obstacle detection**: `L/R/M` commands, wrap-around on both axes, and graceful stop-before-obstacle with structured failure output. **Multi-rover batch I/O is out of scope** for v0.1.0.

Concretely:

1. A rover executes a string of commands (`L`, `R`, `M`).
2. The planet is a toroidal grid of width × height; positions `{x, y}` are normalized modulo those dimensions.
3. Obstacles are fixed `{x, y}` positions. When the *next* move would land on an obstacle, the rover does not move, stops processing the remaining commands, and returns a `Blocked` status carrying the last valid position, the heading, and the coordinates of the obstacle.
4. On successful completion, the rover returns an `Ok` status with its final position and heading.

## Consequences

### Positive

- **POS-001**: Wrap-around + obstacle detection is the widely accepted "full" kata scope, giving the exercise enough richness to exercise value objects, aggregates, and explicit failure modeling.
- **POS-002**: Leaving multi-rover out keeps the domain small enough to finish in a few TDD sessions while still exercising hexagonal boundaries.
- **POS-003**: Obstacle handling forces us to commit to a domain-failure convention (see ADR-0006), which is exactly the kind of decision the kata is designed to practice.

### Negative

- **NEG-001**: Excluding multi-rover defers work the user may later want as an extension, requiring an ADR-0002 revision or a follow-up ADR.
- **NEG-002**: Spherical wrap-around adds a subtle invariant — all positions must pass through `Grid.normalize` — that we must hold across every move operation to avoid leaking negative or out-of-range coordinates.

## Alternatives Considered

### Classic-Only Bounded Grid

- **ALT-001**: **Description**: `L/R/M` commands on a finite grid where moving off the edge is an error or a no-op.
- **ALT-002**: **Rejection Reason**: Too thin to exercise discriminated-union failure modeling or wrap-around invariants — the kata becomes almost entirely about direction vectors.

### Full Multi-Rover Batch Brief

- **ALT-003**: **Description**: Parse a multi-line input (plateau size, N rovers × (start + commands)) and print N final positions.
- **ALT-004**: **Rejection Reason**: The extra I/O shape adds parser complexity without new domain insight. Better revisited as a follow-up feature after the core domain is stable.

## Implementation Notes

- **IMP-001**: All position arithmetic goes through `Grid.normalize(position)` to enforce the wrap-around invariant in one place.
- **IMP-002**: `Planet.isBlocked(position)` is the only path into obstacle checks; `Rover.move` must consult it before committing a position change.
- **IMP-003**: Blocked output includes the obstacle coordinate so downstream consumers can differentiate "I stopped because of obstacle A" from "I stopped because of obstacle B".

## References

- **REF-001**: [ADR-0006: Domain Modeling & Result Type](adr-0006-domain-modeling-and-result-type.md)
- **REF-002**: [ADR-0007: CLI Adapter](adr-0007-cli-adapter.md)
- **REF-003**: Codurance Mars Rover kata brief — https://kata-log.rocks/mars-rover-kata
