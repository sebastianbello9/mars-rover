# Mars Rover

[![ci](https://github.com/sebastianbello9/mars-rover/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastianbello9/mars-rover/actions/workflows/ci.yml)
[![node](https://img.shields.io/badge/node-%3E%3D20-43853d)](https://nodejs.org/)
[![typescript](https://img.shields.io/badge/typescript-5.4-3178c6)](https://www.typescriptlang.org/)

A TypeScript take on the classic **Mars Rover** kata — built as a study in deliberate architecture. The solution itself is short; the point is the process: hexagonal layering, strict outside-in TDD, conventional commits, branch-protected PRs, GitHub Actions CI, and every non-trivial choice captured in an ADR.

> [!NOTE]
> This repository is a learning artifact. It favors clarity over cleverness and optimizes for reading, not running at scale.

## Features

- **Direction · Grid · Position · Planet · Rover** as immutable value objects / aggregates.
- **Spherical planet** — moves wrap around both axes with a math-true modulo.
- **Obstacle detection** — the rover stops before a collision and returns a structured `Blocked` status carrying the last valid position and the obstacle coordinate.
- **Pure domain** — no I/O, no exceptions for domain outcomes; failures surface through a `RoverStatus = Ok | Blocked` discriminated union.
- **Single input port** — `ExecuteCommandsUseCase` converts primitives at the hexagonal boundary.
- **Thin CLI adapter** — reads stdin and flags, prints a one-liner, exits with a meaningful status code.
- **GitHub Actions CI** — lint, typecheck, test, coverage gate (≥ 95% aggregate) on every push and PR.

## Quick start

```bash
git clone https://github.com/sebastianbello9/mars-rover.git
cd mars-rover
npm ci
npm test
```

Run the CLI directly from TypeScript sources (no build required):

```bash
echo "LMLMLMLMM" | npm start -- --grid 5x5 --start "1 2 N"
# → 1 3 N

echo "MMM" | npm start -- --grid 5x5 --start "1 2 N" --obstacles "1,3"
# → O:1 2 N 1,3
```

### CLI contract

```
mars-rover --grid WxH --start "X Y HEADING" [--obstacles "x1,y1;x2,y2;..."] < COMMANDS
```

| Output scenario | stdout                          | Exit |
| --------------- | ------------------------------- | ---- |
| Ok              | `X Y HEADING`                   | `0`  |
| Blocked         | `O:X Y HEADING OBX,OBY`         | `0`  |
| Invalid input   | `ERR: <message>` on **stderr**  | `2`  |

## Architecture

```
┌──────────────────── Adapters (infrastructure) ────────────────────┐
│   CLI adapter  (stdin/argv → parser → use case → stdout)          │
└────────────────────────────┬──────────────────────────────────────┘
                             │ input port
┌────────────────────────────▼──────────────────────────────────────┐
│                      Application layer                            │
│   ExecuteCommandsUseCase(planet, startState, commands) → Result   │
└────────────────────────────┬──────────────────────────────────────┘
                             │ pure calls
┌────────────────────────────▼──────────────────────────────────────┐
│                          Domain                                   │
│   Direction · Position · Grid · Obstacle · Planet · Rover         │
│   Command (L|R|M) · RoverStatus (Ok | Blocked)                    │
└───────────────────────────────────────────────────────────────────┘
```

Dependency rule: **adapters → application → domain**; domain imports nothing from above it. Every value object is immutable; every transition returns a new instance.

## Architectural decisions

All significant choices live as ADRs under [`docs/adr/`](docs/adr/README.md). Read the index for the full list; highlights:

| ADR                                                                                  | Topic                                                    |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| [0001](docs/adr/adr-0001-language-and-runtime.md)                                     | TypeScript on Node 20+                                    |
| [0002](docs/adr/adr-0002-kata-scope.md)                                               | Scope: wrap-around + obstacles                            |
| [0003](docs/adr/adr-0003-hexagonal-architecture.md)                                   | Hexagonal + DDD                                           |
| [0004](docs/adr/adr-0004-strict-tdd-workflow.md)                                      | Strict outside-in TDD                                     |
| [0005](docs/adr/adr-0005-testing-framework-vitest.md)                                 | Vitest as the test runner                                 |
| [0006](docs/adr/adr-0006-domain-modeling-and-result-type.md)                          | Immutable VOs + `RoverStatus` union (no exceptions)       |
| [0007](docs/adr/adr-0007-cli-adapter.md)                                              | CLI adapter contract                                      |
| [0008](docs/adr/adr-0008-conventional-commits.md)                                     | Conventional Commits everywhere                           |
| [0009](docs/adr/adr-0009-branching-and-protection.md)                                 | `main` ← `develop` branching + branch protection rules    |
| [0010](docs/adr/adr-0010-ci-pipeline.md)                                              | CI pipeline (GitHub Actions)                              |

The CI workflow also has a companion specification at [`spec/spec-process-cicd-ci.md`](spec/spec-process-cicd-ci.md).

## Development workflow

Work lands through PRs only — **never** direct commits to `develop` or `main`.

1. Pick an open GitHub issue.
2. Branch from `develop`: `git checkout -b feat/<slug>` (or `fix/`, `chore/`, `ci/`, `docs/`).
3. Red: write one failing test. Commit as `test(scope): …`.
4. Green: minimum production code to pass. Commit as `feat(scope): …`.
5. Refactor if needed. Commit as `refactor(scope): …`.
6. Push; open a PR into `develop` (title must be a Conventional Commit).
7. Wait for CI to go green.
8. Squash-merge with `gh pr merge --squash --delete-branch`.

A release is a PR from `develop` → `main`, then `git tag v<semver>`.

### Scripts

| Command                   | What it does                                      |
| ------------------------- | ------------------------------------------------- |
| `npm test`                | Runs Vitest once                                  |
| `npm run test:watch`      | Vitest in watch mode                              |
| `npm run test:coverage`   | Runs tests with v8 coverage; enforces 95% gates   |
| `npm run typecheck`       | `tsc --noEmit`                                    |
| `npm run lint`            | ESLint on `src/` + `tests/`                       |
| `npm run format`          | Prettier write                                    |
| `npm run build`           | Emits `dist/` via `tsconfig.build.json`           |
| `npm start`               | Runs the CLI via `tsx` without building           |

## Project layout

```
src/
  domain/        Pure TS: Direction, Position, Grid, Planet, Rover, Command, RoverStatus
  application/   ExecuteCommandsUseCase (input port)
  adapters/cli/  parseCommands, formatOutput, main
tests/
  unit/          One spec per domain/adapter module
  acceptance/    executeCommands end-to-end specs
docs/adr/        Architectural decision records (0001–0010 + index)
spec/            Workflow specifications
.github/         GitHub Actions workflow (ci)
```
