---
title: "ADR-0008: Conventional Commits"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "process", "commits", "git"]
supersedes: ""
superseded_by: ""
---

# ADR-0008: Conventional Commits

## Status

**Accepted**

## Context

Strict TDD (ADR-0004) produces many small commits — one per red/green/refactor step. Without a commit convention, the log becomes an untyped list of "fix stuff" messages. We want every commit to machine-parseable so the history itself becomes documentation and so future automation (changelogs, release-please, semver bumps) is cheap to add.

The `conventional-commit` skill is installed in this repository and provides an XML-structured template that the assistant uses when generating commits.

## Decision

All commits on every branch follow the **Conventional Commits 1.0.0 specification**:

```
type(scope): description

[optional body]

[optional footer(s)]
```

- **Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope**: feature area — e.g. `direction`, `planet`, `rover`, `cli`, `adr`, `readme`, `ci`.
- **Description**: imperative mood, no trailing period, under 72 characters.
- **Breaking changes**: `feat!` or `BREAKING CHANGE:` footer.
- **PR titles**: PRs are squash-merged; the PR title becomes the commit on `develop`, so PR titles must also parse as Conventional Commits.

## Consequences

### Positive

- **POS-001**: `git log --oneline` is readable without any tooling.
- **POS-002**: Future adoption of release-please, commitlint, or semantic-release is a drop-in.
- **POS-003**: The TDD cadence is legible in the log: alternating `test(...)` and `feat(...)` commits.
- **POS-004**: Combined with squash-merging (ADR-0009), `develop` accumulates one Conventional Commit per shipped feature.

### Negative

- **NEG-001**: Requires discipline; a malformed commit slips in easily without automation. We accept this risk in v0.1.0 and can add `commitlint` later if it becomes a problem.
- **NEG-002**: The `scope` field has no closed vocabulary; drift is possible. We document expected scopes in the README development-workflow section.

## Alternatives Considered

### Free-form Messages

- **ALT-001**: **Description**: Write whatever explains the change.
- **ALT-002**: **Rejection Reason**: Loses all machine readability and the TDD-legibility benefit above.

### Gitmoji

- **ALT-003**: **Description**: Prefix commits with emoji codes (`✨`, `🐛`, etc.).
- **ALT-004**: **Rejection Reason**: Cute but not machine-parseable by the standard toolchain, and coding types in emoji reduces scan speed for mixed readers.

### Chronological Log Only (No Convention)

- **ALT-005**: **Description**: Rely on PR descriptions; keep commits informal.
- **ALT-006**: **Rejection Reason**: The user explicitly asked for conventional commits; also removes the squash-merge benefit.

## Implementation Notes

- **IMP-001**: The `conventional-commit` skill (`.claude/skills/conventional-commit`) is the canonical template generator; the XML block maps 1:1 to the spec.
- **IMP-002**: PR merges use `gh pr merge --squash --delete-branch`; the PR title is edited to be a valid Conventional Commit before merging.
- **IMP-003**: `commitlint` is not installed at v0.1.0. If it is added later, pin the `config-conventional` preset to keep allowed types in sync with this ADR.

## References

- **REF-001**: [ADR-0004: Strict TDD Workflow](adr-0004-strict-tdd-workflow.md)
- **REF-002**: [ADR-0009: Branching and Protection](adr-0009-branching-and-protection.md)
- **REF-003**: Conventional Commits 1.0.0 — https://www.conventionalcommits.org/en/v1.0.0/
- **REF-004**: `.claude/skills/conventional-commit/SKILL.md`
