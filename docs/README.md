# De'ciZhen Documentation Map

## Purpose

This directory is the canonical documentation set for the De'ciZhen platform.

It should answer five questions:

1. What the platform is today
2. What the platform must become
3. Which architectural rules are non-negotiable
4. How frontend and backend responsibilities are split
5. What remains to finish before the workspace-first SaaS refactor is truly complete

## Canonical Documents

### Core platform

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

1. `architecture/platform-engineering-standard.md`
2. `architecture/project-current-state.md`
3. `architecture/project-target-state.md`
4. `architecture/frontend-backend-boundary.md`
5. `architecture/workspace-refactor-roadmap.md`

## Documentation Rules

- Platform-wide rules belong in the canonical documents above.
- Module-specific behavior belongs in local module docs.
- Audits must not silently become architecture rules.
- When a rule changes, update the canonical document, not only an audit or PR note.
- If two documents disagree, the canonical documents win.
