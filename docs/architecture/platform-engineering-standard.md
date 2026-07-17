# De'ciZhen Platform Engineering Standard

## Status

- Version: `v1`
- Scope: `frontend-de-cizhen` + `Backend-De-ciZhen`
- Audience: product, design, frontend, backend, QA
- Purpose: define the target state, engineering rules, and delivery standards for a modern SaaS marketplace/workspace platform

## 1. Why This Document Exists

This document is the shared engineering contract for the De'ciZhen platform.

It defines:

- what the final platform must become
- how we design and build it
- what is allowed and what is forbidden
- how we decide whether a refactor is actually complete

The document exists to prevent:

- fragmented UI and duplicated screens
- backend logic leaking into the frontend
- dead code, temporary compatibility layers, and endless legacy support
- uncontrolled growth of styles, components, and view-specific hacks
- "works for now" solutions that make the platform slower, harder to change, and less professional

## 2. Product Target

De'ciZhen must become a clean, fast, modern SaaS platform with one coherent workspace experience.

Target characteristics:

- one unified product shell
- one coherent navigation model
- one reusable design system
- one backend-owned business contract per workspace section
- one frontend rendering layer that consumes those contracts directly
- zero dead screens
- zero duplicated product logic across modules
- minimal legacy compatibility surface

The final product should feel:

- operationally clear
- visually consistent
- technically predictable
- easy to extend without rewriting existing parts

## 3. Final Platform Outcome

The desired final state is:

- the user works inside one workspace, not inside disconnected pages
- every major section has a clear contract, route, state model, and UI surface
- backend computes meaning, status, metrics, actions, priorities, and workflow permissions
- frontend renders, composes, animates, and guides user interaction
- shared components are reused across the platform instead of cloned and restyled
- all legacy routes either redirect cleanly or are removed
- styling is token-driven and systemized, not page-by-page improvised
- every new feature enters the platform through established patterns, not through exceptions

Core formula:

`backend counts, decides, and validates`

`frontend renders, arranges, and interacts`

## 4. Non-Negotiable Engineering Principles

### 4.1 Single source of truth

- backend owns business truth
- frontend must not invent workflow semantics from raw fields when a canonical contract exists
- UI state may exist in frontend only for presentation concerns

### 4.2 One pattern per problem

- if a reusable solution already exists, reuse it
- if the same UI or logic appears more than once, extract it
- duplicated code is a defect unless there is a documented reason

### 4.3 No dead code

- unused components, hooks, styles, DTOs, routes, and compatibility helpers must be removed
- commented-out code is not allowed
- feature flags must have an owner and a removal plan

### 4.4 No silent legacy

- every compatibility layer must be explicit
- every legacy alias must have a removal target
- no indefinite support for old route params, old payload shapes, or old visual blocks

### 4.5 Clean boundaries

- backend modules own domain logic
- frontend features own presentation and interaction
- transport contracts are explicit and typed
- no hidden cross-module behavior through "smart" side effects

### 4.6 Refactor means deletion

- a refactor is incomplete if the old path still exists without purpose
- new architecture plus old architecture in parallel is transition, not completion

## 5. Target Architecture

### 5.1 Platform shape

The platform should be organized around:

- workspace shell
- section contracts
- domain modules
- shared design system
- typed API boundaries

### 5.2 Workspace model

The workspace is the main product surface.

Every major section must follow the same structure:

- canonical route
- canonical query model
- canonical backend endpoint or endpoint family
- section view model
- reusable content layout
- reusable right rail / decision rail pattern

Recommended canonical sections:

- overview
- requests
- providers
- statistics
- chat
- profile
- actions
- reviews
- legal/support sections as shell-owned informational surfaces

### 5.3 Backend-owned contracts

Workspace sections should be served through aggregated contracts, not assembled in the browser from many unrelated endpoints.

The backend contract should already contain:

- labels that are business-owned
- summaries
- KPI semantics
- action availability
- workflow statuses
- empty-state meaning
- priority queues
- pagination meaning
- confidence or low-data states

The frontend may format and present this data, but must not reinterpret its business meaning.

### 5.4 Frontend-owned responsibilities

Frontend owns:

- composition
- layout
- state transitions for UI controls
- optimistic interaction where appropriate
- loading / error / empty rendering
- accessibility
- responsiveness
- animation and motion
- URL synchronization for user-visible filters

Frontend does not own:

- decision logic
- authorization rules
- workflow legality
- KPI formulas
- ranking semantics
- backend fallback policies

## 6. Frontend Standards

### 6.1 Routing

- one canonical route per product surface
- legacy routes must redirect, not fork behavior
- route params and query params must use canonical naming
- alias handling must be temporary and isolated

Target:

- the user can understand the product map from the route map alone

### 6.2 Feature structure

Frontend features should be organized by product surface, not by random technical fragments.

Preferred structure:

- `feature shell`
- `data`
- `presentation`
- `state`
- `orchestration`
- `shared`
- `tests`

Rules:

- presentational components must stay mostly pure
- hooks may orchestrate data and UI composition
- mapping layers must not turn into hidden business engines

### 6.3 Component system

- one component should solve one recurring UI pattern
- components must be reusable through props, slots, variants, and composition
- no copy-paste variants of the same card, filter bar, badge, modal, or panel
- shared components belong in platform-level shared areas
- section-specific wrappers are allowed only when they add real section semantics

Component design standard:

- composable
- typed
- accessible
- variant-driven
- styling-token-based
- free of embedded business rules

### 6.4 Styling

The platform must not contain thousands of disconnected styles.

Rules:

- design tokens first
- shared utility and shell classes second
- section-specific styles only where real layout differences exist
- no one-off color logic inside random files
- no styling by copy-pasting old CSS blocks
- no legacy page styles kept "just in case"

Preferred style model:

- global tokens
- shared surface primitives
- feature-level style modules only for meaningful layout needs

Every style must answer one of these:

- token
- shared primitive
- section layout
- intentional exception

If it answers none, it should not exist.

### 6.5 State management

- URL state for user-visible navigation/filter context
- server state in query/cache tools
- local state for local interaction only
- no duplicated storage of the same meaning across URL, component state, and cache

Rules:

- server state must have stable query keys
- view state must be derivable where possible
- avoid parallel states describing the same screen

### 6.6 Performance

Frontend must feel fast by design, not by luck.

Rules:

- lazy-load heavy sections when appropriate
- avoid duplicate requests
- avoid recomputing large derived models in render loops
- prefer backend aggregation over client-side waterfall fetching
- keep render trees shallow and purposeful
- remove hidden compatibility work from hot paths

Target:

- fast first meaningful render
- stable navigation
- low unnecessary re-render pressure

### 6.7 Accessibility

Every new surface must support:

- keyboard navigation
- focus visibility
- screen-reader friendly labels
- semantic headings
- status communication for loading, empty, error, and success states

Accessibility is not a post-release add-on.

## 7. Backend Standards

### 7.1 Domain ownership

Backend modules must own:

- validation
- authorization
- workflow transitions
- business invariants
- persistence behavior
- integration boundaries

No frontend should need to reconstruct domain rules from raw entities.

### 7.2 API contract design

Contracts must be:

- explicit
- typed
- documented
- stable
- versionable through evolution, not through breaking silent drift

Rules:

- DTOs are required
- response shapes must express meaning, not only transport raw database fields
- section endpoints should prefer view-model contracts over under-shaped entity dumps
- backend should expose canonical actions instead of forcing frontend heuristics

### 7.3 Aggregation pattern

For workspace surfaces, backend should provide BFF-style aggregation endpoints when the frontend would otherwise assemble several domain calls into one screen.

This is the preferred pattern for:

- workspace overview
- requests board
- providers board
- statistics dashboard
- reviews workspace
- actions rail
- chat workspace

### 7.4 Persistence and schema discipline

- schemas must model domain truth, not UI accidents
- indexes must support actual query patterns
- compatibility fields must be tracked and removable
- derived snapshots should exist only when they reduce real system complexity or cost

### 7.5 Observability and resilience

Backend must be production-shaped.

Required qualities:

- structured error handling
- predictable validation failures
- secure auth/session handling
- logging for meaningful operational events
- safe fallbacks for optional external services

## 8. Design System Standard

The platform must look like one product.

Design system rules:

- one visual language
- one spacing system
- one typography system
- one semantic color system
- one interaction model for buttons, panels, badges, forms, filters, and overlays

UI consistency means:

- same component behaves the same way across sections
- same status uses the same tone and wording
- same interaction pattern does not get reinvented per page

We do not want:

- page-local UI dialects
- random badge colors
- multiple button systems
- many panel types that differ only because they were built at different times

## 9. Testing and Quality Gates

### 9.1 Required test philosophy

We test contracts, workflows, and critical presentation logic.

Minimum expectations:

- backend unit tests for business rules
- backend e2e tests for critical endpoints
- frontend tests for state models, routing rules, and contract normalization
- frontend component tests for critical orchestration paths

### 9.2 What must be verified before merge

- types pass
- lint passes
- relevant tests pass
- no broken canonical routes
- no orphan styles or imports
- no duplicate implementation introduced
- no legacy path expanded without explicit reason

## 10. Definition of Done

A task is done only if:

- the new path works
- the old conflicting path is removed or redirected
- contracts are typed
- tests cover the new critical behavior
- naming is coherent
- styles are aligned with the design system
- documentation is updated where architecture changed
- there is no hidden TODO that is required for correctness

A refactor is done only if:

- the target architecture is clearer after the change
- duplicate paths were reduced
- dead code was deleted
- compatibility surface became smaller, not larger

## 11. Forbidden Patterns

The following are considered engineering defects:

- frontend deriving workflow permissions from ad hoc field combinations when backend can own them
- multiple screens solving the same product problem with separate implementations
- duplicated components with renamed props and copied markup
- CSS growth through page-local overrides and copied legacy blocks
- keeping old modules "for safety" after canonical migration
- mixing presentation logic and business rules in the same component
- adding temporary compatibility without an exit path
- calling several low-level endpoints to rebuild one section that should be a backend contract
- exposing raw entity structures when the UI needs business-ready meaning
- allowing route aliases and old query params to become permanent platform behavior

## 12. Migration Policy

When migrating a feature:

1. define the canonical target
2. introduce the new contract and rendering path
3. verify behavior with tests
4. redirect or delete the old path
5. remove legacy compatibility helpers
6. remove dead styles and unused shared pieces
7. update documentation

Migration is not complete if step 4 or step 5 is missing.

## 13. Current Strategic Direction

The current platform refactor must continue toward:

- one workspace-first SaaS experience
- backend-owned section contracts
- frontend as a consistent rendering layer
- systematic removal of legacy home, duplicated flows, and compatibility data shaping

The short practical priorities are:

- finish canonical workspace section implementation
- replace transitional legacy panels with contract-driven workspace surfaces
- remove old route and data aliases after canonical paths are stable
- reduce CSS and component duplication into shared primitives

## 14. Decision Rule for Future Work

For every new feature or refactor, ask:

1. Does this move us closer to one canonical workspace platform?
2. Does this reduce duplication?
3. Does this keep business logic on the backend?
4. Does this reuse existing shared primitives instead of creating another version?
5. Can we delete old code after this change?

If the answer to several of these is "no", the solution is probably wrong.

## 15. Short Team Motto

Build one platform, not many partial products.

Preferred operating rule:

- backend calculates
- frontend renders
- shared components repeat
- legacy shrinks
- dead code disappears
- every merge makes the system simpler
