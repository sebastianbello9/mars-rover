---
title: "ADR-0007: CLI Adapter"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "cli", "adapter", "hexagonal"]
supersedes: ""
superseded_by: ""
---

# ADR-0007: CLI Adapter

## Status

**Accepted**

## Context

Hexagonal architecture (ADR-0003) requires at least one driving adapter to exercise the domain from outside. The adapter shape determines the developer experience and the CI smoke-test surface.

## Decision

Provide a **thin CLI adapter** under `src/adapters/cli/`:

- `main.ts` — entry point, reads flags and stdin, invokes `ExecuteCommandsUseCase`, prints output, exits with a status-appropriate code.
- `parseCommands.ts` — parses the commands string and input flags into the use case DTO; returns a result union rather than throwing.
- `formatOutput.ts` — turns a `RoverStatus` into a one-line text representation.

Flag contract:

```
mars-rover --grid WxH --start "X Y HEADING" [--obstacles "x1,y1;x2,y2;..."] < COMMANDS
```

`COMMANDS` is read from stdin as a single line of `L`, `R`, `M` characters.

Output contract:

| Scenario          | stdout                                     | Exit code |
| ----------------- | ------------------------------------------ | --------- |
| Ok                | `X Y HEADING`                              | `0`       |
| Blocked           | `O:X Y HEADING OBSTACLE_X,OBSTACLE_Y`      | `0`       |
| Invalid input     | `ERR: <message>` on stderr                 | `2`       |

## Consequences

### Positive

- **POS-001**: Stdin-driven commands make the adapter trivially pipeable in shell (`echo "LMM" | mars-rover ...`).
- **POS-002**: Exit codes let CI smoke tests assert behavior without parsing output strings.
- **POS-003**: Parsing lives entirely in the adapter layer, keeping the domain free of string-handling logic.
- **POS-004**: Blocked is not an error exit — the rover ran its program correctly; it simply chose to stop. This matches the domain's view in ADR-0006.

### Negative

- **NEG-001**: A thin CLI is less discoverable than a REPL or GUI; we accept this for a kata.
- **NEG-002**: Obstacle list parsing uses a mini syntax (`x,y;x,y`); we document it in the README rather than invent a file format.

## Alternatives Considered

### HTTP Server Adapter

- **ALT-001**: **Description**: Express or Node's built-in `http` server exposing POST `/rover/execute`.
- **ALT-002**: **Rejection Reason**: Adds operational surface (ports, request lifecycle) that this kata does not need. A follow-up ADR can introduce it later without changing the domain.

### Library-Only (No Adapter)

- **ALT-003**: **Description**: Export `ExecuteCommandsUseCase` as the public API; users embed it into their own host.
- **ALT-004**: **Rejection Reason**: Leaves no runnable artifact, making the kata harder to demo and making a CI smoke test impossible without a scaffold.

## Implementation Notes

- **IMP-001**: `main.ts` is the only file that touches `process.stdin` / `process.stdout` / `process.exit`; everything it needs is injected or imported from `application/`.
- **IMP-002**: Parsing functions return `{ ok: true; value } | { ok: false; message }` to mirror the domain's aversion to exceptions at the boundary.
- **IMP-003**: Tests cover `parseCommands` and `formatOutput` in unit tests; `main.ts` itself is exercised by a single end-to-end shell smoke test.

## References

- **REF-001**: [ADR-0003: Hexagonal + DDD](adr-0003-hexagonal-architecture.md)
- **REF-002**: [ADR-0006: Domain Modeling & Result Type](adr-0006-domain-modeling-and-result-type.md)
