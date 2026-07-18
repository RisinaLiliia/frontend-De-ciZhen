# Workspace Merge Readiness

## Purpose

This document is the final gate for merging the workspace-first refactor line into `main`.

It is not another architecture wishlist.
It is the concrete checklist for deciding whether the branch is safe to merge, how to merge it, and what still remains blocked.

## Current Status

As of `2026-07-18`:

- phases 1-7 of the workspace refactor roadmap are effectively complete on the frontend refactor line
- phase 8 is active
- the major remaining risks are operational, not architectural

## What Is Already Ready

- canonical workspace shell is established
- providers section convergence is complete
- reviews section unification is complete
- private workspace data cleanup is complete
- statistics compatibility reduction is complete for the main runtime path
- route and alias cleanup is materially complete for canonical workspace routing
- visual/system consolidation is complete for canonical providers/reviews surfaces and shared workspace primitives

## Remaining Merge Blockers

### 1. Manual browser QA

Must still be completed and recorded for at least:

- `375px`
- `425px`
- `768px`
- `1024px`
- `1280px`
- `1440px`

Must explicitly verify:

- no horizontal overflow
- no duplicated nav or rail states
- providers, reviews, stats, requests, and overview feel visually consistent
- modal, drawer, and sheet interactions remain usable

### 2. Frontend release gate

Must be run on the final integration branch:

- `npm run release:check`
- `npm run test:e2e:critical`
- `npm run test:e2e:a11y`

If any of these are intentionally skipped, that skip must be documented with owner and reason.

### 3. Backend cross-repo confirmation

Before merge is treated as production-ready, confirm with backend:

- workspace contract compatibility
- auth/session behavior
- statistics endpoint readiness
- deployment sequencing

### 4. Controlled merge strategy

Merge must not happen as an unreviewed dump of unrelated commits.

The integration branch should be reviewed as one coherent frontend state that includes:

1. providers convergence
2. reviews unification
3. private workspace data cleanup
4. statistics compatibility reduction
5. route/alias cleanup
6. workspace surface primitive extraction
7. final visual consolidation
8. this merge-readiness pass

## Residual Explicit Compatibility Surface

The following items are still acceptable if they remain explicit and reviewed:

- `useWorkspaceShellLegacyRouting.tsx`
- legacy workspace tab redirect support in `workspaceRequestsScope.model.ts`
- thin request wrappers over workspace-owned primitives
- narrow documented stats/chat fallback logic

These must stay smaller than before the refactor, not larger.

## Merge Decision Rule

The branch is merge-ready only if all of the following are true:

- canonical docs describe the actual current branch state
- architectural blockers are no longer open
- manual QA evidence exists
- release gate is green or exceptions are documented
- backend coordination is confirmed
- the resulting branch is simpler than `main`

## Recommended Final Sequence

1. Land documentation refresh and merge-readiness package.
2. Run manual browser QA and capture findings.
3. Run final release gate on the integration branch.
4. Confirm backend sequencing and deployment expectations.
5. Merge in a controlled reviewed PR.
