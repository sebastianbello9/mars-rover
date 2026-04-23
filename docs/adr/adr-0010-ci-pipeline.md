---
title: "ADR-0010: CI Pipeline (GitHub Actions)"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "ci", "github-actions", "automation"]
supersedes: ""
superseded_by: ""
---

# ADR-0010: CI Pipeline (GitHub Actions)

## Status

**Accepted**

## Context

Branch protection (ADR-0009) requires passing status checks before a PR can merge. We need a CI system to produce those checks, and we need to decide what the pipeline verifies. Non-goals for v0.1.0: publishing, release notes, deployment.

## Decision

Use **GitHub Actions** with a single workflow file, `.github/workflows/ci.yml`:

- Name: `ci`
- Triggers: `push` to `main` or `develop`; `pull_request` targeting either.
- Runner: `ubuntu-latest`, Node 20 via `actions/setup-node@v4` with `cache: npm`.
- Single job, `ci`, with sequential steps:
  1. `npm ci`
  2. `npm run lint`
  3. `npm run typecheck`
  4. `npm run test:coverage`
  5. Upload `coverage/` as a workflow artifact.
- Companion human/AI-readable spec at `spec/spec-process-cicd-ci.md` produced via the `create-github-action-workflow-specification` skill.

## Consequences

### Positive

- **POS-001**: Runs for free on public repos with adequate minutes for a kata.
- **POS-002**: Single `ci / ci` status check is easy to wire into `required_status_checks.contexts`.
- **POS-003**: Coverage artifact is downloadable from any PR for quick inspection.
- **POS-004**: Native GitHub integration — no third-party SaaS to authorize.

### Negative

- **NEG-001**: Running all four steps sequentially (lint → typecheck → test) ~ 45–90 s. At kata scale, fine; a larger project would split into parallel jobs.
- **NEG-002**: GitHub Actions workflow files require the `workflow` token scope to push, which the default `gh auth login` does not grant; a one-time `gh auth refresh -s workflow` is required.

## Alternatives Considered

### CircleCI

- **ALT-001**: **Description**: Use CircleCI config in `.circleci/config.yml`.
- **ALT-002**: **Rejection Reason**: No advantage over Actions for a GitHub-hosted kata; additional third-party authorization.

### Pre-commit Hooks Only (No CI)

- **ALT-003**: **Description**: Enforce tests via a local `pre-commit` or Husky hook.
- **ALT-004**: **Rejection Reason**: Branch protection cannot key on local hooks; the chain-of-trust requires a server-side check. Also, hooks can be bypassed with `--no-verify`.

### No CI

- **ALT-005**: **Description**: Rely on local test runs.
- **ALT-006**: **Rejection Reason**: Incompatible with branch protection (ADR-0009) and the user's stated goal.

## Implementation Notes

- **IMP-001**: The workflow is added in Phase 5 on branch `ci/github-actions-pipeline` with a PR to `develop`.
- **IMP-002**: After the first successful run, Phase 5 re-PUTs branch protection on `main` and `develop` with `required_status_checks.contexts: ["ci / ci"]` (the context name is `"<workflow> / <job>"`).
- **IMP-003**: The spec file `spec/spec-process-cicd-ci.md` is updated in lockstep with any workflow change; the spec is the source of truth, the YAML is the implementation.
- **IMP-004**: Coverage thresholds are enforced by Vitest itself (configured in `vitest.config.ts`); CI failure on coverage drop is automatic.

## References

- **REF-001**: [ADR-0004: Strict TDD Workflow](adr-0004-strict-tdd-workflow.md)
- **REF-002**: [ADR-0005: Testing Framework (Vitest)](adr-0005-testing-framework-vitest.md)
- **REF-003**: [ADR-0009: Branching and Protection](adr-0009-branching-and-protection.md)
- **REF-004**: `.claude/skills/create-github-action-workflow-specification/SKILL.md`
- **REF-005**: GitHub Actions documentation — https://docs.github.com/en/actions
