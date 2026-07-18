# Workspace Refactor Roadmap

## Purpose

This roadmap translates the project from mixed workspace state into a controlled professional SaaS platform.

It is not a vague wishlist.
It is the ordered path from transitional architecture to merge-ready workspace-first product delivery.

## Baseline

As of `2026-07-18`:

- workspace-first direction is established
- backend BFF layer is substantially expanded
- major canonical section convergence steps are complete on the frontend refactor line
- the remaining work is mainly cleanup, verification, and merge readiness

## Completion Strategy

Main rule:

- finish canonical section adoption
- remove compatibility where safe
- perform final UI/system cleanup only on canonical surfaces
- then prepare merge as an operational release exercise

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

- completed on the refactor line

## Phase 2. Providers section convergence

Priority: `highest practical frontend/backend convergence win`

Required end state:

- providers section uses the canonical workspace providers contract for main content
- old explore-style rendering path stops being the primary providers implementation
- providers cards, sorting, summary, and decision state come from one coherent system

Status:

- completed on the refactor line

Exit criteria:

- providers content and rail are powered by the same canonical section architecture
- transitional providers rendering paths are deleted or reduced to thin wrappers

## Phase 3. Reviews section unification

Priority: `high`

Required end state:

- backend `GET /workspace/reviews` supports section semantics needed by the main reviews surface
- frontend reviews main content is migrated to the unified workspace reviews contract
- the old parallel reviews-list path stops being the active workspace architecture

Status:

- completed on the refactor line

Exit criteria:

- reviews become one section, not two architectures

## Phase 4. Private workspace data cleanup

Priority: `high`

Required end state:

- private workspace depends on canonical workspace contracts
- old public-overview compatibility composition is removable

Status:

- completed on the refactor line

Exit criteria:

- private workspace orchestration no longer depends on transitional public-overview compatibility data for canonical behavior

## Phase 5. Statistics compatibility reduction

Priority: `medium-high`

Required end state:

- backend becomes the complete source of truth for final section semantics
- frontend normalization boundary becomes thinner
- temporary compatibility builders are removed where canonical payloads exist

Status:

- completed on the refactor line for the main runtime query path

Exit criteria:

- stats no longer rely on avoidable client-side semantic reconstruction in production hot paths

## Phase 6. Route and alias cleanup

Priority: `medium`

Required end state:

- canonical routes stay
- old route aliases redirect cleanly or are deleted
- old query alias support shrinks to the minimum needed for safe migration

Status:

- completed for the main workspace route model, with a small explicit compatibility surface still tracked

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

Status:

- completed for canonical providers/reviews surfaces and shared workspace primitives

Exit criteria:

- final UI pass improves consistency instead of polishing transitional components

## Phase 8. Final cleanup and merge readiness

Priority: `final`

Required end state:

- dead code removed where safe
- compatibility helpers removed where no longer needed
- docs updated
- release and regression checks aligned with final architecture
- branch is ready for controlled merge strategy

Status:

- active

Exit criteria:

- the refactor branch represents a simpler system than `main`, not a larger one
- remaining risk is operationally explicit
- merge gate is documented and reviewable

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

- restart a broad redesign after canonical convergence is already in place
- reintroduce legacy home patterns into workspace surfaces
- add new compatibility helpers without a clear exit path
- expand merge scope without documenting risk and ownership

## Practical Next Step

The next best execution target is:

- `final cleanup and merge readiness`

Meaning:

- consolidate evidence
- verify the remaining operational gate
- document the controlled merge path

## Final Roadmap Goal

At the end of this roadmap, De'ciZhen should be:

- one workspace-first SaaS platform
- one consistent contract-driven frontend
- one backend-owned business engine
- one reduced and controlled legacy surface
- one branch that is realistically ready to merge
