# De'ciZhen Project Current State

## Snapshot

- Date: `2026-07-18`
- Frontend baseline branch: `preview/v0.4.0-workspace-platform`
- Backend branch: `refactor/live-market-stats-seed`
- Scope: cross-repository platform state

## Executive Summary

The platform is no longer in the middle of broad architectural reinvention.

On the frontend refactor line, the major workspace convergence steps are effectively complete:

- `/workspace` is the canonical shell
- providers and reviews are section-shaped workspace surfaces
- private workspace no longer depends on `legacyPublicOverviewData`
- statistics no longer rebuild avoidable backend semantics in the main query path
- route and query alias support is materially smaller
- canonical workspace list/panel/filter primitives now live under `workspace/shared`
- final workspace visual consolidation has started from canonical surfaces instead of transitional request-owned surfaces

The current state is therefore best described as:

- architecture largely converged
- compatibility surface reduced
- merge hardening still required

## What Is Already In Good Shape

### 1. Workspace-first direction is real

Current reality:

- `/workspace` is the main product shell
- older entry routes already converge into workspace
- public and private behavior share one shell path

### 2. Backend BFF direction is established

Backend now exposes dedicated workspace-oriented contracts for:

- public overview
- private overview
- requests
- providers
- reviews
- chat
- profile
- statistics

This is the correct final ownership model.

### 3. Providers and reviews are no longer split architecturally

Current reality:

- providers main content and rail are driven through the workspace providers contract
- reviews main content and rail are driven through the workspace reviews contract
- canonical workspace primitives own the active providers/reviews list surfaces

### 4. Statistics compatibility reduction is materially complete

Current reality:

- the main stats query path validates backend payload directly
- client-side semantic reconstruction has been removed from the hot path
- old compatibility builders were deleted or reduced to thin non-runtime helpers

### 5. Route model is now much simpler

Current reality:

- canonical section routing is `section`-based
- legacy section aliases have been reduced significantly
- requests filter URLs now prefer canonical keys

### 6. Visual consolidation is now happening on canonical surfaces

Current reality:

- workspace-owned list/panel/filter primitives exist under `workspace/shared`
- providers and reviews no longer import request-branded primitives directly
- workspace style ownership now has dedicated canonical surface stylesheets

## What Is Still Incomplete

### 1. Merge readiness is not the same as architectural convergence

The architecture is much closer to target state, but the branch is not yet merge-ready by default.

Remaining work is mostly operational and cleanup-oriented:

- manual browser QA
- full release gate execution
- final documentation refresh
- explicit merge strategy

### 2. Some compatibility paths remain intentionally active

The remaining compatibility surface is now much smaller, but not zero.

Examples still intentionally present:

- legacy workspace tab redirect support in `workspaceRequestsScope.model.ts`
- some chat legacy param normalization
- residual stats fallback rendering outside the removed main semantic normalization path
- request-side wrappers that now delegate to canonical workspace primitives

These should be tracked explicitly rather than treated as invisible debt.

### 3. Manual visual proof is still missing

The branch now has a cleaner visual system, but it still needs human verification across the required breakpoints and key route states.

What still needs manual confirmation:

- no overflow or clipping at core breakpoints
- no duplicated navigation or rail states
- no degraded modal/sheet behavior on mobile
- stable spacing and rhythm on canonical surfaces

### 4. Release and CI confidence still need final confirmation

This repository still needs final merge confidence through the agreed release gate:

- `release:check`
- critical E2E
- accessibility smoke
- controlled build confidence

### 5. Backend/frontend merge coordination still matters

Frontend architecture is now closer to target state than before, but production merge still depends on:

- backend contract readiness
- cross-repo regression confidence
- merge sequencing discipline

## Technical Debt Categories

The remaining debt is now narrower and more explicit.

### 1. Operational debt

- missing manual browser QA evidence
- incomplete final regression package
- merge sequencing not yet formalized

### 2. Residual compatibility debt

- explicit migration redirects and alias handlers that still exist for safety
- thin wrapper layers kept for controlled compatibility
- a small number of non-hot-path fallback adapters

### 3. Documentation debt

- some older audit/handoff documents still described already-closed gaps
- merge-readiness evidence needed to be consolidated into one canonical package

## What Must Not Be Misread

The current state is not "still mid-refactor" in the old sense.

Important interpretation:

- the main convergence work is largely done on the frontend refactor line
- the branch is substantially closer to target state than the old audits describe
- the remaining work is mostly cleanup, verification, and controlled merge preparation

## Practical Current-State Conclusion

As of `2026-07-18`, De'ciZhen is:

- already a workspace-first platform in architecture and UI ownership
- already much closer to backend-computes / frontend-renders discipline
- not yet fully merge-ready until manual QA, release checks, and final cleanup gates are completed
