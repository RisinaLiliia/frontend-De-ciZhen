# Workspace Refactor Roadmap

## Purpose

This roadmap translates the current project state into a practical completion plan.

It is not a vague wishlist.
It is the ordered path from the current mixed workspace state to the target professional SaaS platform.

## Baseline

As of `2026-07-17`:

- workspace-first direction is established
- backend BFF layer is substantially expanded
- legacy home has been reduced heavily
- several critical sections still contain compatibility or transitional rendering paths

## Completion Strategy

The next phase should optimize for convergence, not reinvention.

Main rule:

- finish canonical section adoption
- then remove compatibility
- then perform final UI/system cleanup

## Phase 1. Documentation and rules

Goal:

- make the platform rules explicit
- stop future drift while the refactor is still open

Deliverables:

- canonical documentation set
- platform engineering standard
- current-state and target-state definition
- backend/frontend boundary definition
- refactor roadmap

Status:

- this phase is now in progress through the new documentation set

## Phase 2. Providers section convergence

Priority: `highest practical frontend/backend convergence win`

Why this comes first:

- backend providers contract is already rich
- frontend providers rail already uses it
- main providers content is still transitional
- this section is one of the clearest "backend mature / frontend not yet canonical" gaps

Required end state:

- providers section uses the canonical workspace providers contract for main content
- old explore-style rendering path stops being the primary providers implementation
- providers cards, sorting, summary, and decision state come from one coherent system

Exit criteria:

- providers content and rail are powered by the same canonical section architecture
- transitional providers rendering paths are deleted or reduced to thin wrappers

## Phase 3. Reviews section unification

Priority: `high`

Current problem:

- reviews rail is workspace-native
- reviews list is not yet fully workspace-native
- architecture is split

Required backend step:

- extend `GET /workspace/reviews` from rail/composer contract into a full section contract with list semantics

Required frontend step:

- migrate reviews main content to the unified workspace reviews contract
- remove the old parallel reviews-list path from workspace architecture

Exit criteria:

- reviews become one section, not two architectures

## Phase 4. Private workspace data cleanup

Priority: `high`

Current problem:

- private workspace still relies on `legacyPublicOverviewData` in transitional composition paths

Required end state:

- private workspace should depend on canonical workspace requests/public-summary contracts only where appropriate
- old overview-shaped compatibility data should be removable

Exit criteria:

- private workspace orchestration no longer depends on transitional public-overview compatibility data for canonical behavior

## Phase 5. Statistics compatibility reduction

Priority: `medium-high`

Current problem:

- stats direction is strong
- some compatibility shaping remains in frontend

Required end state:

- backend becomes complete source of truth for final section semantics
- frontend normalization boundary becomes thinner
- temporary compatibility builders are removed where canonical payloads exist

Exit criteria:

- stats no longer rely on avoidable client-side semantic reconstruction

## Phase 6. Route and alias cleanup

Priority: `medium`

Current problem:

- several compatibility routes and query aliases remain intentionally active

Required end state:

- canonical routes stay
- old route aliases redirect cleanly or are deleted
- old query alias support shrinks to the minimum needed for safe migration

Exit criteria:

- route model is simple enough to explain without historical context

## Phase 7. Visual and system consolidation

Priority: `after canonical section convergence`

Important rule:

- do not do final style polishing before canonical section architecture is in place

Required end state:

- remaining duplicate panels and style ownership issues are removed
- surface helpers and design tokens become the default path everywhere
- public and private sections feel like one product family

Exit criteria:

- final UI pass improves consistency instead of polishing transitional components

## Phase 8. Final cleanup and merge readiness

Priority: `final`

Required end state:

- dead code removed
- compatibility helpers removed where no longer needed
- docs updated
- release and regression checks aligned with final architecture
- branch is ready for controlled merge strategy

Exit criteria:

- the refactor branch represents a simpler system than `main`, not a larger one

## Sequencing Rule

Recommended order:

1. docs and rules
2. providers convergence
3. reviews unification
4. private workspace cleanup
5. statistics compatibility reduction
6. route/alias cleanup
7. final visual/system consolidation
8. merge readiness

## What Not To Do

Do not:

- start a broad redesign before section contracts converge
- reintroduce legacy home patterns into workspace surfaces
- add new compatibility helpers without a clear exit path
- polish transitional UI and then rewrite it again later

## Practical Next Step

The next best execution target is:

- `providers-first convergence`

Reason:

- it has strong backend support already
- it closes a visible architectural gap
- it improves both technical shape and user-facing consistency

## Final Roadmap Goal

At the end of this roadmap, De'ciZhen should be:

- one workspace-first SaaS platform
- one consistent contract-driven frontend
- one backend-owned business engine
- one reduced and controlled legacy surface
