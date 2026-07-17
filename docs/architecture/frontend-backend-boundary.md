# Frontend / Backend Boundary

## Purpose

This document defines the working contract between frontend and backend for the De'ciZhen platform.

The core rule is simple:

- backend computes product truth
- frontend renders product truth

## Boundary Principle

The boundary must prevent two common failure modes:

1. backend exposes too little meaning, forcing frontend to rebuild business logic
2. frontend becomes a second decision engine with duplicated rules

Both are architectural defects.

## Backend Owns

Backend owns:

- authentication and authorization
- workflow legality
- domain validation
- status transitions
- KPI formulas
- action availability
- decision and prioritization logic
- empty-state meaning when it depends on business context
- confidence and low-data logic
- ranking semantics
- paginated list meaning
- section-level aggregated contracts

Examples:

- whether a request can be published, archived, duplicated, or deleted
- whether a provider should appear as high-priority or not
- whether a reviews queue item needs attention
- what a statistics recommendation actually means

## Frontend Owns

Frontend owns:

- route composition
- shell composition
- layout and spacing
- visual hierarchy
- component interaction
- local UI state
- transitions and motion
- accessibility behavior
- user-visible filter state in URL
- optimistic UX where safe
- formatting of dates, currency, and locale-sensitive display values

Examples:

- how a decision panel is arranged visually
- how a filter bar expands on mobile
- how a dialog opens, closes, and returns focus
- how a loading skeleton is presented

## What Frontend Must Not Do

Frontend must not:

- infer business permissions from raw field combinations if backend can provide an action contract
- build workflow truth from many unrelated partial fields
- compute KPI meaning when backend can return semantic fields
- rank opportunities or providers locally when backend already owns the ranking model
- maintain a permanent compatibility layer after canonical backend support exists

## What Backend Must Not Do

Backend should not:

- offload product-critical semantics to the UI without reason
- expose raw persistence structures when the UI needs business-ready sections
- make frontend guess labels, tones, priorities, or action rules from incidental fields
- create several overlapping contracts for the same workspace section without a migration plan

## Workspace Section Contract Rule

Every major workspace section should converge to one section-shaped backend contract.

A healthy contract usually contains:

- header
- filters
- summary
- list or content payload
- decision rail payload if relevant
- actions and states already resolved
- empty/loading/error semantics where business-owned meaning matters

## Transitional Compatibility Rule

Compatibility is allowed only when:

- there is an active migration in progress
- the compatibility layer is isolated
- the final canonical contract is already known
- the compatibility layer can be deleted later

Compatibility is not allowed as a permanent architectural style.

## Examples of Correct Split

### Requests

Correct:

- backend returns legal owner actions
- frontend renders cards, menus, dialogs, and transitions

Incorrect:

- frontend decides whether owner can delete, publish, or archive based on ad hoc request status logic

### Providers

Correct:

- backend returns provider list, business-ready badges, summary metrics, and queue semantics
- frontend renders grid/list/detail surfaces

Incorrect:

- frontend recomputes which providers are "top", "trusted", or "needs action"

### Statistics

Correct:

- backend returns decision sections, market/user comparison meaning, and recommendations
- frontend validates, formats, and presents them

Incorrect:

- frontend turns raw metrics into its own competing analytics engine

### Reviews

Correct:

- backend returns summary, queue semantics, composer permissions, and eventually the section list contract
- frontend handles controls, pagination UI, and visual composition

Incorrect:

- frontend maintains two permanent review architectures because the contract was never unified

## Review Rule for New Work

Before implementing a new feature, ask:

1. Is this business meaning or presentation?
2. If it is business meaning, can backend own it?
3. If frontend is computing it temporarily, where is the removal plan?
4. Is there already a canonical section contract that should be extended instead?

## Final Boundary Formula

Use this formula for the project:

- backend validates
- backend decides
- backend aggregates
- frontend composes
- frontend formats
- frontend interacts

If a change breaks this split, the architecture is drifting.
