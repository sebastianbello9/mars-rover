---
title: "ADR-0011: CI Path Filters with Required-Check Stub"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "ci", "github-actions", "performance"]
supersedes: ""
superseded_by: ""
---

# ADR-0011: CI Path Filters with Required-Check Stub

## Status

**Accepted**

## Context

ADR-0010 defined a single GitHub Actions workflow, `ci`, that runs on every push and pull request targeting `main` or `develop`. In practice, roughly half of the changes in a documentation-heavy kata touch only Markdown or spec files, and the full pipeline (`npm ci` → lint → typecheck → test + coverage → artifact upload) is wasted work on those changes — ~25 s per run × 3–4 docs PRs per week.

A naive fix — adding `paths-ignore` to the trigger — would cause the required `ci` status check to not be reported on docs-only PRs, and GitHub's branch protection would then block merges because "Required check is expected but not reported." See [GitHub's documentation on handling skipped-but-required checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#handling-skipped-but-required-checks).

We need a pattern that: (a) skips the heavy pipeline on docs-only changes, (b) still reports a `ci` status so branch protection is satisfied, and (c) keeps the solution declarative — no custom GitHub Apps, no `tj-actions/changed-files` incantations.

## Decision

Split the triggers across **two workflow files with the same workflow and job name `ci`**:

- `.github/workflows/ci.yml` — the real pipeline. Trigger limited by `paths:` to code / tooling paths only.
- `.github/workflows/ci-docs.yml` — a stub workflow with trigger `paths-ignore:` covering the same code paths (i.e. docs-only changes). Its single job is named `ci` and does nothing but `echo` a skip message.

Because GitHub surfaces a status check by its **job name** (`ci`) and at most one of the two workflows will actually run for any given push/PR, branch protection's required context `ci` is always satisfied: by the real pipeline for code changes, by the stub for everything else.

Path-filter lists are kept in sync between the two files. Paths considered "code / tooling":

```
src/**
tests/**
package.json
package-lock.json
tsconfig*.json
vitest.config.ts
.eslintrc.cjs
.prettierrc
.github/workflows/**
```

Any change outside those paths (README, docs/, spec/, .gitignore, LICENSE, etc.) goes through the stub.

## Consequences

### Positive

- **POS-001**: Docs-only pushes finish in under 5 s instead of ~25 s; no `npm ci` network hit, no runner minutes wasted.
- **POS-002**: Branch protection continues to enforce the required `ci` check for every PR, regardless of content.
- **POS-003**: Solution is fully declarative in two small YAML files; no third-party actions, no token scopes beyond `contents: read`.
- **POS-004**: Editing `.github/workflows/**` always triggers the real pipeline (both files change together), so the path-filter list cannot drift silently.

### Negative

- **NEG-001**: Two files must keep their `paths:` / `paths-ignore:` lists exactly complementary. A missed path in one file would either (a) run the heavy pipeline unnecessarily (safe) or (b) never run anything (unsafe — blocks merges). We guard against (b) by using `paths-ignore` in the stub covering the same list as `paths` in the real pipeline.
- **NEG-002**: If GitHub changes the rules for reporting status contexts from workflows sharing a name, the behavior may need to be revisited.
- **NEG-003**: Some observability loss: a docs PR's "CI" entry shows a 3-second success, not a full matrix. Acceptable for a kata.

## Alternatives Considered

### Single workflow with `paths-ignore` only

- **ALT-001**: **Description**: Add `paths-ignore:` to the single `ci.yml`; no stub.
- **ALT-002**: **Rejection Reason**: Required status checks are not reported when the trigger excludes a change, so `main`/`develop` protection blocks docs-only PRs.

### Single workflow with job-level `if:` + `changed-files` action

- **ALT-003**: **Description**: Always trigger the workflow; use a third-party action (`dorny/paths-filter` or `tj-actions/changed-files`) to detect docs-only changes and short-circuit heavy steps with `if:` conditions.
- **ALT-004**: **Rejection Reason**: Adds a third-party dependency and token scope; requires per-step `if:` boilerplate. Two native YAML files are simpler and have no supply-chain surface.

### No filtering — run CI on everything

- **ALT-005**: **Description**: Status quo from ADR-0010; CI runs on every change.
- **ALT-006**: **Rejection Reason**: The user flagged the waste directly. Continuing to run ~25 s of CI for README edits is not defensible once the fix is known.

## Implementation Notes

- **IMP-001**: Both workflow files declare `name: ci` and a single job `name: ci` — this is what produces a single required-check context.
- **IMP-002**: The stub workflow sets `timeout-minutes: 1` and `permissions: contents: read` for hygiene; it does not perform a checkout.
- **IMP-003**: Changes to `.github/workflows/**` are intentionally considered "code" so edits to CI itself always run the real pipeline.
- **IMP-004**: If a new file type begins living outside `src/`, `tests/`, or tooling files (e.g., a `benchmarks/` directory), it must be added to both YAML files in the same PR.
- **IMP-005**: The two workflows use **distinct concurrency groups** (`ci-real-${{ github.ref }}` and `ci-docs-${{ github.ref }}`). A PR that touches both code and docs triggers both workflows; they must run independently so the combined required status check ends green. Sharing a single concurrency group would cause one to cancel the other and block merges.

## References

- **REF-001**: [ADR-0010: CI Pipeline (supersedes)](adr-0010-ci-pipeline.md)
- **REF-002**: [ADR-0009: Branching and Protection](adr-0009-branching-and-protection.md)
- **REF-003**: GitHub — Handling skipped but required checks — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#handling-skipped-but-required-checks
- **REF-004**: Workflow syntax — `paths` and `paths-ignore` — https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore
- **REF-005**: `spec/spec-process-cicd-ci.md` (updated v1.1)
