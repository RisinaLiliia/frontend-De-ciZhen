# De'ciZhen Project Target State

## Goal

De'ciZhen must end as a professional, modern SaaS marketplace/workspace platform.

The final product must feel:

- clean
- fast
- coherent
- scalable
- operationally clear
- maintainable by a disciplined engineering team

## Product-Level End State

The user should experience De'ciZhen as one product, not a collection of legacy pages.

The final product model is:

- one canonical workspace shell
- one coherent navigation system
- one shared design language
- one consistent action and status vocabulary
- one platform-wide set of reusable components

## User Experience Target

### Workspace

The workspace should be the main control surface for the product.

It should feel like:

- a command center
- a decision surface
- a workflow manager
- a unified system for requests, providers, reviews, stats, profile, and chat

The user should not need to mentally switch between unrelated micro-products.

### Cross-section consistency

Every major section should share:

- the same shell
- the same top-level layout grammar
- the same surface patterns
- the same filter logic patterns
- the same state handling expectations

### Visual quality

The interface should look intentionally designed, not incrementally accumulated.

Target qualities:

- consistent spacing and rhythm
- strong typography hierarchy
- stable component language
- restrained, meaningful color semantics
- minimal visual noise
- clear empty/loading/error behavior

## Engineering End State

### 1. Backend computes, frontend renders

This is the core system rule.

Final state:

- backend owns business meaning
- backend owns workflow legality
- backend owns KPI semantics
- backend owns action availability
- frontend owns presentation and interaction

The frontend should not need to infer product truth from scattered raw fields.

### 2. One canonical contract per workspace section

Each major workspace section should have a clear backend-owned contract.

Expected sections:

- overview
- requests
- providers
- reviews
- actions
- chat
- statistics
- profile

Each contract should be:

- typed
- documented
- stable
- section-shaped
- ready to render

### 3. One reusable design system

The final system should rely on:

- tokens
- shared shell/surface helpers
- shared input and control patterns
- shared card and rail patterns
- shared status semantics

We do not want:

- repeated one-off CSS blocks
- multiple competing panel systems
- inconsistent badges, cards, and filter bars

### 4. Near-zero legacy surface

At the end of the refactor:

- old routes should be removed or reduced to clean redirects
- compatibility mappers should be deleted where canonical contracts exist
- duplicate rendering paths should be gone
- dead styles and dead components should be gone

### 5. Predictable codebase growth

Adding a new section or upgrading an old one should not require inventing a new architecture.

Future work should extend:

- documented patterns
- shared primitives
- canonical contracts

not create exceptions.

## Desired Frontend State

The frontend should end with:

- route clarity
- feature-based organization
- strong shared primitives
- minimal duplication
- server-state discipline
- intentional UI state
- stable responsiveness
- strong test coverage around routing, orchestration, and contract mapping

The frontend should not contain:

- fallback business engines
- parallel list systems solving the same problem
- silent compatibility helpers without removal plans
- page-specific UI dialects

## Desired Backend State

The backend should end with:

- strong domain ownership
- explicit DTO contracts
- workspace-first aggregation endpoints
- server-owned workflow decisions
- stable validation and authorization boundaries
- minimal entity leakage into UI-facing responses

The backend should not rely on:

- frontend heuristics for workflow logic
- raw entity dumps when the UI needs business-ready contracts
- long-lived compatibility fields without removal planning

## Team Operating Model Target

The team should be able to answer these quickly:

- which route is canonical
- which contract is canonical
- which component is canonical
- which styles are canonical
- which compatibility layer is temporary
- what must be removed after migration

If those answers are unclear, the platform is not yet in its target state.

## Definition of Professional Final Result

The project should be considered professionally complete when:

- users experience one polished SaaS platform
- engineers work from one clear set of patterns
- backend and frontend responsibilities are cleanly separated
- duplicate paths are rare and justified
- dead code does not accumulate
- new work tends to simplify the system rather than fragment it

## Short Final Vision

De'ciZhen should become:

- one workspace-first SaaS platform
- one design system
- one architectural language
- one backend-owned business engine
- one frontend-owned rendering system

That is the target.
