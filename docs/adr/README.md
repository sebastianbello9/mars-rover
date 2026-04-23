# Architectural Decision Records

This directory holds the architectural decisions for the Mars Rover kata, recorded using the [MADR-ish template](https://adr.github.io/madr/) produced by the `create-architectural-decision-record` skill. Each file is a standalone, immutable record: amend a decision by writing a new ADR that supersedes it.

## Index

| ADR     | Title                                                        | Status   |
| ------- | ------------------------------------------------------------ | -------- |
| [0001](adr-0001-language-and-runtime.md)            | Language and Runtime — TypeScript on Node.js 20+          | Accepted |
| [0002](adr-0002-kata-scope.md)                      | Kata Scope — L/R/M + wrap-around + obstacles              | Accepted |
| [0003](adr-0003-hexagonal-architecture.md)          | Hexagonal Architecture with DDD Value Objects             | Accepted |
| [0004](adr-0004-strict-tdd-workflow.md)             | Strict Outside-In TDD Workflow                            | Accepted |
| [0005](adr-0005-testing-framework-vitest.md)        | Testing Framework — Vitest                                | Accepted |
| [0006](adr-0006-domain-modeling-and-result-type.md) | Domain Modeling — Immutability + `RoverStatus` union      | Accepted |
| [0007](adr-0007-cli-adapter.md)                     | CLI Adapter — stdin/argv → use case → stdout              | Accepted |
| [0008](adr-0008-conventional-commits.md)            | Commit Convention — Conventional Commits 1.0.0            | Accepted |
| [0009](adr-0009-branching-and-protection.md)        | Branching Model and Branch Protection                     | Accepted |
| [0010](adr-0010-ci-pipeline.md)                     | CI Pipeline — GitHub Actions (lint · typecheck · test)    | Superseded by 0011 |
| [0011](adr-0011-ci-path-filters.md)                 | CI Path Filters with Required-Check Stub                  | Accepted |

## Conventions

- Sequentially numbered `adr-NNNN-<kebab-slug>.md`.
- Front matter: `title`, `status`, `date`, `authors`, `tags`, `supersedes`, `superseded_by`.
- Body sections: Status · Context · Decision · Consequences (Positive/Negative) · Alternatives Considered · Implementation Notes · References.
- Multi-item sections use coded bullets: `POS-NNN`, `NEG-NNN`, `ALT-NNN`, `IMP-NNN`, `REF-NNN`.
- Never edit a merged ADR to reverse its decision — write a superseding ADR and update both `supersedes` / `superseded_by` front-matter fields.
