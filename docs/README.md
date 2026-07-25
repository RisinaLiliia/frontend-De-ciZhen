# De'ciZhen Documentation Map

## Purpose

This directory is the canonical documentation set for the De'ciZhen platform.

It should answer five questions:

1. What the platform is today
2. What the platform must become
3. Which architectural rules are non-negotiable
4. How frontend and backend responsibilities are split
5. What remains to finish before the workspace-first SaaS refactor is truly complete

## Normative Status Model

This documentation set uses two normative levels:

- `Canonical current contract`
  - already binding for the current preview implementation baseline
  - documents the active canonical rules even when convergence work is still incomplete

- `Approved target contract`
  - approved future-facing contract for the preview refactor line
  - normative for implementation direction, but not a claim that the current branch already satisfies it in full

Target contracts must not be described as current implementation truth. Current-state documents and implementation-boundary sections must explicitly call out remaining gaps.

## Conflict Priority

When documents disagree, use this order:

1. `DECIZHEN_PROJECT_SPECIFICATION.md`
2. `WORKSPACE_LAYOUT_STANDARD.md`
3. the owning section contract
4. `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`
5. `WORKSPACE_VISUAL_REFERENCE_INDEX.md`
6. ADRs
7. current-state, roadmap, audits, handoff notes, and QA matrices
8. release and operational checklists

## Canonical Documents

### Core platform

- [`DECIZHEN_PROJECT_SPECIFICATION.md`](DECIZHEN_PROJECT_SPECIFICATION.md)
  - status: `Canonical current contract`
  - principal product and engineering requirements document
  - platform purpose, users, canonical workspace, routing, contracts, security, quality, and definition of done

- [`WORKSPACE_LAYOUT_STANDARD.md`](WORKSPACE_LAYOUT_STANDARD.md)
  - status: `Approved target contract`
  - invariant shell geometry and behavior
  - expanded/collapsed sidebar and AI rail rules, responsive recomposition, height, density, and pagination

- [`WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`](WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md)
  - status: `Approved target contract`
  - section-by-section frontend convergence strategy for workspace
  - required delivery workflow, cleanup rules, visual alignment gates, and definition of section completion

- [`WORKSPACE_VISUAL_REFERENCE_INDEX.md`](WORKSPACE_VISUAL_REFERENCE_INDEX.md)
  - the only approved catalogue of target-state workspace mockups
  - exploratory images not listed there are non-normative

- `architecture/platform-engineering-standard.md`
  - platform-wide engineering standard
  - shared rules for architecture, UI system, ownership boundaries, anti-legacy policy, and definition of done

- `architecture/project-current-state.md`
  - current-state snapshot as of `2026-07-17`
  - what is already unified
  - where compatibility layers and technical debt still exist

- `architecture/project-target-state.md`
  - target end-state for the product, UX, architecture, and codebase
  - the professional SaaS outcome we are building toward

- `architecture/frontend-backend-boundary.md`
  - exact ownership split between frontend and backend
  - canonical rule: backend computes, frontend renders

- `architecture/workspace-refactor-roadmap.md`
  - ordered migration path from the current mixed state to the target platform
  - practical next-step sequencing

- `architecture/workspace-merge-readiness.md`
  - final merge gate for the workspace-first refactor
  - explicit remaining blockers, residual compatibility surface, and merge sequence

## Supporting Documents

### Workspace product specifications

- [`DASHBOARD_OVERVIEW_SPECIFICATION.md`](DASHBOARD_OVERVIEW_SPECIFICATION.md)
  - status: `Approved target contract`
  - overview summaries, Active Offers request mini-cards, and full Market Overview drill-downs

- [`REQUESTS_SECTION_LAYOUT_SPECIFICATION.md`](REQUESTS_SECTION_LAYOUT_SPECIFICATION.md)
  - status: `Approved target contract`
  - market collection, My Work, editor and public detail, adaptive card grids, pagination, and shell states

- [`PROVIDERS_SECTION_LAYOUT_SPECIFICATION.md`](PROVIDERS_SECTION_LAYOUT_SPECIFICATION.md)
  - status: `Approved target contract`
  - provider collection and detail, comparison, actions, responsive behavior, and shell states

- [`STATISTICS_SECTION_LAYOUT_SPECIFICATION.md`](STATISTICS_SECTION_LAYOUT_SPECIFICATION.md)
  - status: `Approved target contract`
  - seven analytical summaries and their full central-canvas details
  - shared filters, backend ownership, responsive behavior, and shell states

- [`ACTIONS_GROWTH_CENTER_SPECIFICATION.md`](ACTIONS_GROWTH_CENTER_SPECIFICATION.md)
  - status: `Approved target contract`
  - canonical role-aware Growth Center
  - profile improvement, request promotion, expert services, campaigns, and click-through details

- [`PROFILE_SECTION_SPECIFICATION.md`](PROFILE_SECTION_SPECIFICATION.md)
  - status: `Approved target contract`
  - role contexts, management overview, detail editors, shell states, responsive behavior, contracts, and visual references
  - approved image catalogue: [`assets/workspace/profile/README.md`](assets/workspace/profile/README.md)

### Execution and audit aids

- [`WORKSPACE_FRONTEND_AUDIT_TEMPLATE.md`](WORKSPACE_FRONTEND_AUDIT_TEMPLATE.md)
  - status: `Supporting execution template`
  - working matrix for the current frontend audit pass
  - uses the verdicts `already compliant`, `partially compliant`, `missing`, `legacy`, and `conflict`
  - feeds the next implementation block: routes, tokens, typography, shared primitives, shell, and unified AI rail

### Decision records

- `adr/2026-03-10-workspace-routing-and-reviews-flow.md`
- `architecture/adr-semantic-indicator-system.md`

Use ADRs for irreversible or high-impact architectural choices.

### Audits and handoff material

- `workspace-final-audit.md`
- `workspace-ui-regression-check.md`
- `decision-dashboard-backend-handoff.md`
- `audit/*`

These files are supporting evidence and transitional analysis.
They are not the primary source for project rules.

### Operational gates

- `release-dod.md`

This is the release gate and delivery checklist.
It complements the engineering standard, but does not replace it.

### Contract reference

- `openapi/workspace-statistics-decision-dashboard.openapi.yaml`

Use this for contract-specific work, not for general product architecture.

## Reading Order

For a new engineer or reviewer, recommended order:

1. `DECIZHEN_PROJECT_SPECIFICATION.md`
2. `WORKSPACE_LAYOUT_STANDARD.md`
3. the owning section specification
4. `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`
5. `WORKSPACE_VISUAL_REFERENCE_INDEX.md`
6. `architecture/platform-engineering-standard.md`
7. `architecture/project-current-state.md`
8. `architecture/project-target-state.md`
9. `architecture/frontend-backend-boundary.md`
10. `architecture/workspace-refactor-roadmap.md`

## Documentation Rules

- Platform-wide rules belong in the canonical documents above.
- Module-specific behavior belongs in local module docs.
- Audits must not silently become architecture rules.
- When a rule changes, update the canonical document, not only an audit or PR note.
- If two documents disagree, resolve the conflict using the priority order above.
