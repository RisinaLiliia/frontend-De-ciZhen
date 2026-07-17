# De'ciZhen Project Current State

## Snapshot

- Date: `2026-07-17`
- Frontend branch: `preview/v0.4.0-workspace-platform`
- Backend branch: `refactor/live-market-stats-seed`
- Scope: cross-repository platform state

## Executive Summary

The platform is in an advanced but incomplete workspace-first refactor.

Major progress is already real:

- the product is converging on `/workspace` as the canonical working surface
- legacy home and legacy workspace fragments have been reduced significantly
- backend now exposes a substantial `workspace/*` BFF layer
- statistics, chat, profile, and requests contracts are materially stronger than before

But the refactor is not complete yet.

The current state is best described as:

- one canonical direction
- several completed foundations
- several still-active compatibility layers
- some public and list-heavy sections still rendered through transitional UI paths

## What Is Already in Good Shape

### 1. Workspace-first direction is real

The platform is no longer conceptually centered on unrelated pages.

Current reality:

- `/workspace` is the main product shell
- several older client/provider entry routes already redirect into workspace
- shared workspace shell and branch-model architecture are in place

### 2. Backend BFF layer is substantially stronger

Backend now provides dedicated workspace contracts for:

- public overview
- private overview
- requests
- providers
- reviews rail
- actions rail
- chat rail
- profile
- statistics

This is the correct architectural direction.

### 3. Legacy home cleanup is well underway

A large portion of historical home-specific panels and styles has already been removed from the frontend branch.

This is important because:

- it reduces conflicting visual ownership
- it reduces duplicated discovery flows
- it makes workspace the actual product core

### 4. Stats architecture is mature enough to stabilize around

The statistics/dashboard area already has:

- a dedicated contract layer
- a normalization boundary
- typed models
- tests around compatibility behavior
- backend-owned direction of travel

Even where temporary compatibility remains, the structure is intentional.

## What Is Still Incomplete

### 1. Legacy routing and alias handling still exists

Some route aliases and compatibility remapping are still active.

This is acceptable during migration, but it means the refactor is not finished.

Examples of incomplete platform state:

- legacy route redirects still exist as active migration paths
- query alias compatibility is still present in workspace routing/state
- part of the navigation model still carries transition semantics

### 2. Private workspace still depends on transitional public-overview compatibility

A notable remaining architectural issue is that parts of private workspace composition still use `legacyPublicOverviewData`.

This means:

- the architecture is improved, but not yet fully canonical
- some state still flows through old overview-shaped contracts
- private and public concerns are not yet fully separated at the data composition layer

### 3. Providers content is still transitional

The providers section is only partially migrated.

Current pattern:

- backend already owns a rich providers contract
- frontend rail uses backend-owned providers contract
- main providers content still relies on an older explore/list rendering path

This is one of the clearest remaining mismatches between backend maturity and frontend implementation.

### 4. Reviews section is split across two architectural models

Current reviews state is mixed:

- workspace reviews rail already uses `GET /workspace/reviews`
- the main reviews list still depends on older reviews endpoints and normalization

This means the reviews section is not yet a single workspace-native contract.

### 5. Some compatibility shaping still lives in frontend stats flow

Statistics architecture is strong, but not fully pure yet.

Temporary compatibility remains around:

- payload normalization
- fallback shaping for older data
- support for legacy section semantics during transition

This is acceptable for now, but it should shrink over time.

## Technical Debt Categories

The remaining technical debt is not random.
It mostly falls into four buckets:

### 1. Migration debt

- route aliases
- query aliases
- transitional redirects
- compatibility payload mappers

### 2. UI system debt

- remaining list surfaces still rendered through older panel systems
- section implementations that have not yet switched to canonical workspace primitives

### 3. Boundary debt

- places where frontend still compensates for non-final backend contracts
- places where old and new contracts coexist

### 4. Cleanup debt

- legacy helpers still intentionally present
- pointer docs and audit docs not yet fully organized into a single project manual

## What Must Not Be Misread

The current state is not a failed refactor.

It is a partially completed successful refactor with unfinished consolidation.

Important interpretation:

- the direction is correct
- much of the hard foundation work is done
- the remaining work is mainly convergence, cleanup, and contract completion

## Practical Current-State Conclusion

As of `2026-07-17`, De'ciZhen is:

- already a workspace-first platform in architecture direction
- already strongly backend-driven in several critical sections
- not yet fully clean, final, or legacy-free

The next phase is not broad reinvention.
It is controlled completion:

- finish section contract adoption
- remove compatibility layers
- unify remaining list surfaces
- reduce duplicate styling and rendering paths
