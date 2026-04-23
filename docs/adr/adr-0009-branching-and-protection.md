---
title: "ADR-0009: Branching Model and Branch Protection"
status: "Accepted"
date: "2026-04-22"
authors: "Sebastián Bello"
tags: ["architecture", "decision", "git", "branching", "github", "protection"]
supersedes: ""
superseded_by: ""
---

# ADR-0009: Branching Model and Branch Protection

## Status

**Accepted**

## Context

A solo-developer kata still benefits from the discipline of a real branching model. We need to decide:

- How many long-lived branches? (`main` only vs. `main` + `develop`)
- How integration branches interact (direct push vs. pull request)
- What branch protection rules apply on GitHub
- How the solo author unblocks themselves without neutering protection

The user explicitly asked for a development branch so that feature work goes through two levels of PR: `feat/*` → `develop` → `main`.

## Decision

### Branches

- **`main`** — release branch. Receives one merge per release, from `develop`.
- **`develop`** — default branch on GitHub. Integration branch for all feature work.
- **Short-lived branches** — one per GitHub issue, named by purpose:
  - `feat/<slug>` for issues representing features.
  - `ci/<slug>` for CI-related work.
  - `docs/<slug>` for documentation.
  - `chore/<slug>` for tooling/ADR batches.
  - `fix/<slug>` for bug fixes.

### Merge strategy

PRs are **squash-merged** with `gh pr merge --squash --delete-branch`. The PR title becomes the squash commit message and must be a Conventional Commit (ADR-0008). This keeps `develop` and `main` histories linear and one-commit-per-feature.

### Branch protection (applied to both `main` and `develop`)

| Rule                              | Value                       | Rationale                                                      |
| --------------------------------- | --------------------------- | -------------------------------------------------------------- |
| `required_pull_request_reviews`   | 1 required PR, 0 approvers  | Force PR-based changes; solo-friendly (no required reviewer).  |
| `dismiss_stale_reviews`           | `true`                      | Any new push invalidates prior approvals (future-proof).       |
| `required_status_checks.strict`   | `true`                      | Branches must be up to date before merging.                    |
| `required_status_checks.contexts` | `["ci"]` (post-Phase 5)     | CI job must be green. GitHub reports the check by **job name**, so the context is just `ci` (not `ci / ci`). |
| `required_linear_history`         | `true`                      | No merge commits; enforces squash/rebase workflow.             |
| `allow_force_pushes`              | `false`                     | History is immutable once pushed.                              |
| `allow_deletions`                 | `false`                     | Neither protected branch can be deleted.                       |
| `enforce_admins`                  | `false`                     | Solo admin can bypass in a genuine emergency.                  |
| `required_conversation_resolution`| `true`                      | Encourages resolving review comments before merge.             |

## Consequences

### Positive

- **POS-001**: Every change to shared history goes through a PR with CI, mirroring real-team discipline.
- **POS-002**: Two-level promotion (`develop` → `main`) gives a natural place for a release PR and a tag.
- **POS-003**: Squash merges combined with Conventional Commits (ADR-0008) mean `develop`'s log reads as a changelog.
- **POS-004**: `required_linear_history` keeps `git bisect` well-behaved.

### Negative

- **NEG-001**: Two-branch model is heavier than trunk-based for a solo kata; the user accepts the ceremony as part of the practice.
- **NEG-002**: Setting `enforce_admins: false` means a sufficiently careless admin push could still bypass protection. We accept it as the safety valve for solo work.
- **NEG-003**: `required_status_checks.contexts` cannot be populated until the CI workflow has run at least once; Phase 1 of the plan applies protection with empty contexts and Phase 5 updates them.

## Alternatives Considered

### Trunk-Based

- **ALT-001**: **Description**: Single long-lived branch (`main`); everyone pushes tiny commits or opens short-lived branches into it.
- **ALT-002**: **Rejection Reason**: Removes the second PR promotion step the user asked for; loses the release-PR checkpoint.

### Classic GitFlow (feature / develop / release / hotfix)

- **ALT-003**: **Description**: Full GitFlow with release branches and hotfix branches.
- **ALT-004**: **Rejection Reason**: Over-heavy for a kata; release branches add no value when releases are single commits.

### No Branch Protection

- **ALT-005**: **Description**: Rely on discipline alone.
- **ALT-006**: **Rejection Reason**: Defeats the exercise; the user asked for protection rules.

## Implementation Notes

- **IMP-001**: Protection is applied via `gh api repos/sebastianbello9/mars-rover/branches/{branch}/protection -X PUT` with the JSON payload in `.agents/protection.json` (gitignored as it is an operational artifact).
- **IMP-002**: `required_approving_review_count` is `0` for solo; if a second contributor joins, raise it to `1` in a new PR and supersede this ADR.
- **IMP-003**: Release flow: PR from `develop` to `main` titled `release: v<semver>`; squash-merge; `git tag v<semver> && git push --tags`.

## References

- **REF-001**: [ADR-0008: Conventional Commits](adr-0008-conventional-commits.md)
- **REF-002**: [ADR-0010: CI Pipeline](adr-0010-ci-pipeline.md)
- **REF-003**: GitHub branch protection docs — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
