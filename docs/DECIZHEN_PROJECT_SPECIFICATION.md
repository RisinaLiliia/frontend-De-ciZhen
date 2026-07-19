# De'ciZhen Project Specification

**Document status:** Canonical current contract  
**Version:** 1.5  
**Date:** 2026-07-18  
**Applies to:** `frontend-De-ciZhen` and `Backend-De-ciZhen`  
**Primary frontend baseline:** `preview/v0.4.0-workspace-platform`

---

## 1. Purpose

This document is the primary product and engineering specification for the De'ciZhen platform.

It defines:

- the product purpose and user roles;
- the canonical workspace model;
- functional requirements for each product section;
- frontend and backend ownership boundaries;
- routing and API contract rules;
- design-system and semantic-language requirements;
- security, accessibility, observability, testing, and release requirements;
- the current implementation status and remaining delivery gates.

This specification is normative. Audits, implementation plans, ADRs, handoff notes, and QA matrices provide supporting detail but must not silently override this document. When a platform-wide rule changes, this specification and the relevant ADR or contract must be updated in the same change.

### 1.1 Out of scope

This document does not define:

- financial forecasts;
- pricing or monetization;
- investor materials;
- go-to-market strategy;
- market-size estimates;
- commercial expansion planning.

---

## 2. Product Definition

De'ciZhen is a workspace-first service marketplace for household and local services. It connects customers who need a task completed with providers who can perform the work.

The platform must support the complete service workflow inside one coherent product environment:

1. discover market activity;
2. create or find a service request;
3. evaluate requests or providers;
4. submit and manage offers;
5. communicate through workspace chat;
6. manage active and completed work;
7. save relevant requests or providers as favorites;
8. leave and review feedback;
9. use statistics and system recommendations to make informed decisions.

The product must behave as one platform rather than a collection of unrelated pages.

### 2.1 Product promise

De'ciZhen should reduce the time and effort required to solve a household-service need. The experience must be simple, trustworthy, and action-oriented.

Marketing claims such as “in two minutes” must not be treated as guaranteed product behavior until validated by measured user-flow data.

Claims such as “verified provider” may be displayed only when a real, documented verification process exists and the provider has successfully completed it.

### 2.2 Core product principles

- One workspace shell.
- One canonical route model.
- One backend-owned contract per workspace section.
- One shared design language.
- One semantic action and status vocabulary.
- No duplicated business logic between frontend and backend.
- No permanent, undocumented legacy paths.
- New work must extend canonical patterns rather than create exceptions.

---

## 3. Users and Roles

### 3.1 Guest

A guest may access public marketplace information, including public requests, provider discovery, reviews, and permitted statistics.

Private actions must redirect to authentication while preserving a safe return path.

### 3.2 Customer

A customer must be able to:

- create and manage service requests;
- review received offers;
- select and communicate with a provider;
- manage the service workflow;
- save providers or requests where applicable;
- complete a service flow;
- submit a review for eligible completed work.

### 3.3 Provider

A provider must be able to:

- discover relevant requests;
- filter and evaluate market demand;
- submit and manage offers;
- communicate with customers;
- manage current and completed work;
- maintain a provider profile;
- view reviews and applicable statistics;
- receive clear next-step and action-required signals.

### 3.4 Administrative and moderation roles

Administrative, support, moderation, and dispute-management capabilities are platform requirements where real users and transactions are involved. Their detailed permission model must be defined in backend authorization policy before production use.

---

## 4. Canonical Workspace Model

`/workspace` is the main product shell for both public and authenticated experiences.

All primary product surfaces must be rendered as workspace sections or workspace-owned private states. The user must not need to switch mentally between unrelated micro-products.

### 4.1 Canonical sections

The workspace owns the following product areas:

| Section | Purpose | Current status |
|---|---|---|
| Overview | Public and private summaries, relevant request cards, user workflow state | Canonical route and ownership are current; final dashboard drill-down implementation and route-state convergence remain in progress |
| Requests | Public market requests and authenticated request workflows | Current branch uses canonical workspace routing and filters; final visual and release hardening remain open |
| Providers | Provider discovery, comparison, summaries, and decision support | Backend section contract and workspace convergence exist; final provider-detail route and layout convergence remain in progress |
| Reviews | Review summaries, lists, queues, and review composer | Canonical backend contract and unified workspace architecture exist; final shell and visual verification remain required |
| Chat | Workspace communication and related context | Backend contract exists; workspace-shell parity and guarded-route behavior must remain verified |
| Statistics | Decision dashboard for demand, supply, opportunity, risk, price, and recommendations | Backend contract and endpoint already exist; remaining gap is frontend convergence, state coverage, and UI polish |
| Profile | User or provider profile and related settings | Backend contract exists; current branch still relies on transitional profile/onboarding UI rather than the approved management overview |
| Actions | Role-aware Growth Center for recommended actions, promotion tools, expert services, and campaign results | Approved target contract; current branch still contains transitional profile-oriented rendering paths in some frontend flows |
| Help / Privacy / Cookies | Shell-owned informational and legal surfaces | Shell ownership exists; production completeness and legal review remain required |

### 4.2 Workspace layout

Workspace sections should use a coherent layout grammar:

- one persistent application shell;
- a left workspace sidebar that can be expanded or collapsed;
- a persistent top control bar;
- one invariant right AI decision rail;
- a central section canvas as the only major region whose product content changes between sections;
- an accessible section heading and description in the document structure, visually hidden in dense workspace modes when the same context is already clear from navigation and controls;
- filters, sorting, view controls, and other section controls inside the persistent top-control system;
- explicit loading, empty, error, and authorization states;
- stable responsive behavior.

### 4.2.1 Persistent workspace frame

The workspace frame is a product invariant:

1. **Left sidebar** — global workspace navigation. In expanded mode it shows icon, label, and an unread/change count where applicable. In collapsed mode it shows icons and compact count indicators only. A count represents relevant changes since the user last visited or cleared that section; it must not be a decorative total.
2. **Top control bar** — persistent section-control surface. It keeps search, filters, sorting, period, layout, and other relevant controls in view. The control set changes by section, but the bar geometry, hierarchy, and behavior remain stable.
3. **Right AI decision rail** — permanent decision context. Its structure is identical across sections; only its data, copy, actions, and semantic context change.
4. **Central canvas** — the primary variable region. Section-specific cards, lists, forms, tabs, maps, and content are rendered here.

The desktop workspace is a single fixed-height working window. The application shell occupies the available viewport height; the document itself must not become an unbounded vertical dashboard. The top bar, sidebar, and open AI rail remain fixed. The central canvas receives all remaining space and owns section-local view changes.

The canonical desktop geometry is:

| Region | Expanded | Collapsed |
|---|---:|---:|
| Workspace sidebar | `232px` | `72px` |
| AI decision rail | `320px` | no reserved column |
| Floating Decision Indicator | not shown | `64px` fixed control |
| Central canvas | `minmax(0, 1fr)` | expands into all released space |

Collapsing a shell tool must cause a real grid recomposition. The central canvas must not retain empty columns or a fixed width matching the expanded state. Wider available space may add columns, widen data visualizations, or reduce rows while preserving readable card density.

When the AI rail is collapsed, its column is removed from layout. A fixed circular Decision Indicator remains in the rail's upper-right decision position. It preserves the current decision score, semantic ring, AI provenance marker, pending-item count when present, and an accessible expand action. It must not cover filters or essential content.

Canonical shell behavior, dimensions, viewport rules, card-grid behavior, and visual references are defined in `WORKSPACE_LAYOUT_STANDARD.md`.

The Requests collection layout, adaptive card grid, shell-state matrix, pagination behavior, and approved visual references are defined in `REQUESTS_SECTION_LAYOUT_SPECIFICATION.md`.

The Providers collection, comparison behavior, provider-detail composition, viewer-aware actions, and approved visual references are defined in `PROVIDERS_SECTION_LAYOUT_SPECIFICATION.md`.

The Dashboard overview, preview ownership, full central-canvas drill-downs, Active Offers mini-cards, responsive recomposition, and approved visual references are defined in `DASHBOARD_OVERVIEW_SPECIFICATION.md`.

The Statistics overview, seven metric drill-downs, role context, shell-state matrix, and approved visual references are defined in `STATISTICS_SECTION_LAYOUT_SPECIFICATION.md`.

The Actions Growth Center, role-aware management tools, promotion workflows, expert services, campaign controls, and approved visual references are defined in `ACTIONS_GROWTH_CENTER_SPECIFICATION.md`.

The Profile management overview, role contexts, focused editors, responsive behavior, and approved visual references are defined in `PROFILE_SECTION_SPECIFICATION.md`.

The approved section-by-section frontend delivery strategy, cleanup rules, verification gates, and definition of completion are defined in `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

### 4.2.2 Canonical AI decision rail

Every workspace section uses the same ordered rail structure:

1. **Decision Panel** — primary number or decision summary, restrained visualization, context rows, primary contextual CTA, and a secondary route to analysis when relevant;
2. **Action Queue** — a limited list of the highest-priority items requiring attention plus a route to the complete list;
3. **Recommendations** — a limited list of contextual system or AI recommendations plus a route to all recommendations.

The rail must not be redesigned independently for each section. Section adapters provide data and actions to one canonical rail presentation.

The expanded rail is the default desktop state. Sidebar and rail expansion preferences should persist per user where storage and privacy policy permit. Collapsing either control must not reset filters, selected entities, pagination, drill-down state, or unsaved safe local presentation state.

### 4.3 Public and private behavior

Public and authenticated behavior must share the same shell and canonical route language.

Authentication must change data access and permitted actions, not create a parallel product architecture.

---

## 5. Routing and URL Requirements

### 5.1 Canonical route

The canonical workspace route is:

```text
/workspace
```

Public sections use the `section` query parameter. Only canonical values may be generated by current UI code.

Canonical public section values include:

```text
overview
requests
providers
reviews
stats
profile
actions
chat
settings
help
privacy
cookies
```

Private workspace modes may use a validated `tab` value. Invalid or missing `tab` values must not suppress a valid public `section`.

### 5.2 Legacy section compatibility

The following aliases are supported as a narrow migration layer:

| Legacy value | Canonical value |
|---|---|
| `statistics` | `stats` |
| `orders` | `requests` |

Legacy values must be normalized to canonical values. New links must never generate legacy values.

Every compatibility alias must remain isolated and must have an explicit future removal condition.

### 5.3 Canonical routes vs temporary implementation state

The canonical route model is normative even when the current preview branch is still converging to it.

Canonical current route truth:

- `/workspace?section=overview` is the canonical workspace entry surface;
- `/workspace?section=actions` is a first-class canonical section, not a profile alias;
- section-specific deep-link state must be expressed through the shared workspace query-parameter registry below;
- current implementation limitations must not redefine the canonical route model.

Temporary implementation notes for `preview/v0.4.0-workspace-platform`:

- some frontend route parsers and rendering paths still treat `actions` and `profile` through older transitional logic;
- navigation already emits `section=overview`, but full typed route-state convergence is still in progress;
- section-local deep-link behavior remains uneven across sections and must converge to the registry defined below.

### 5.4 Workspace query-parameter registry

This registry is the only canonical description of workspace query-surface behavior. Section documents may explain semantic usage, but they must not invent a separate route model.

| Parameter | Scope / owner | Allowed values or validation source | Default behavior | Canonical serialization | Invalid-value behavior | Cleanup rule |
|---|---|---|---|---|---|---|
| `section` | global workspace shell | `overview`, `requests`, `providers`, `reviews`, `stats`, `profile`, `actions`, `chat`, `settings`, `help`, `privacy`, `cookies` | Missing values use the shell-owned default route policy | lowercase canonical section key | Normalize supported legacy aliases; otherwise fall back to the shell default route policy | Preserved only when the destination remains a workspace section; replaced explicitly on section navigation |
| `tab` | private workspace state | validated private-workspace tab values only | Ignored when missing | lowercase canonical tab key | Ignore invalid values; must not suppress a valid canonical `section` | Cleared when entering a canonical public section that does not use private tab state |
| `scope` | requests | `market`, `my` | `market` for public browsing; authenticated request workflows may validate `my` | lowercase enum value | Fall back to the Requests default scope | Cleared when leaving `requests` |
| `role` | requests | `all`, `customer`, `provider` | `all` when omitted | lowercase enum value | Fall back to `all` | Cleared when leaving `requests` |
| `state` | requests | `all`, `attention`, `execution`, `completed` | `all` when omitted | lowercase enum value | Fall back to `all` | Cleared when leaving `requests` |
| `period` | requests | `24h`, `7d`, `30d`, `90d` | `30d` when omitted | lowercase enum value | Fall back to `30d` | Cleared when leaving `requests` unless another section explicitly owns it |
| `cityId` | requests | backend-valid city identifier from filter options | No city filter when omitted | opaque city identifier | Ignore legacy `city` when `cityId` is present; otherwise normalize legacy `city` to `cityId`; drop invalid values | Cleared when leaving `requests` unless the destination section explicitly reuses the same location context |
| `categoryKey` | requests | backend-valid category key from filter options | No category filter when omitted | lowercase canonical category key | Ignore legacy `category` when `categoryKey` is present; otherwise normalize legacy `category` to `categoryKey`; drop invalid values | Cleared when leaving `requests` unless the destination section explicitly reuses the same category context |
| `subcategoryKey` | requests | backend-valid subcategory/service key from filter options | No subcategory filter when omitted | lowercase canonical subcategory key | Ignore legacy `service` and `serviceKey` when `subcategoryKey` is present; otherwise normalize `service`, then `serviceKey`, to `subcategoryKey`; drop invalid values | Cleared when leaving `requests` unless the destination section explicitly reuses the same service context |
| `sort` | requests | backend-documented request sort keys | Section-defined default sort when omitted | lowercase canonical sort key | Fall back to the Requests default sort | Cleared when leaving `requests` |
| `page` | requests | positive integer | `1` when omitted | positive integer string | Fall back to `1` | Reset to `1` when filters or section change invalidate the current page; cleared when leaving `requests` |
| `limit` | requests | positive integer within backend bounds | Section-defined bounded default when omitted | positive integer string | Fall back to the section-defined bounded default | Cleared when leaving `requests` unless the destination section explicitly supports it |
| `range` | stats | `24h`, `7d`, `30d`, `90d` | `30d` when omitted | lowercase enum value | Fall back to `30d` | Cleared when leaving `stats`; older non-stats reuse is transitional and not canonical |
| `view` | stats | typed statistics view values documented by the Statistics section contract | Absent means the Statistics overview | lowercase canonical view key | Reset to the Statistics overview when invalid | Cleared when leaving `stats` |
| `viewerMode` | providers | viewer contexts documented by the Providers specification | Providers section default when omitted | lowercase canonical viewer-mode key | Fall back to the Providers default viewer context | Cleared when the destination section does not expose Providers role-context switching |
| `viewerMode` | stats | viewer contexts documented by the Statistics specification | Statistics section default when omitted | lowercase canonical viewer-mode key | Fall back to the Statistics default viewer context | Cleared when the destination section does not expose Statistics role-context switching |
| `viewerMode` | profile | viewer contexts documented by the Profile specification | Profile section default when omitted | lowercase canonical viewer-mode key | Fall back to the Profile default viewer context | Cleared when the destination section does not expose Profile role-context switching |
| `viewerMode` | actions | viewer contexts documented by the Actions specification | Actions section default when omitted | lowercase canonical viewer-mode key | Fall back to the Actions default viewer context | Cleared when the destination section does not expose Actions role-context switching |
| `profileView` | profile | `overview`, `identity-contact`, `public-presentation`, `services-pricing`, `availability-service-area`, `trust-verification` | `overview` when omitted | lowercase canonical profile-view key | Fall back to `overview` | Cleared when leaving `profile` |
| `focus` | destination section that explicitly documents it | section-owned typed deep-link or transient focus value only | Absent means the section default view | lowercase section-local token | Remove unsupported values; destination sections should prefer dedicated keys such as `view` or `profileView` where available | Cleared on cross-section navigation unless the destination section explicitly sets a new focus |
| `providerId` | providers | backend-valid provider identifier | Absent means the Providers collection view | opaque provider identifier | Invalid values fall back to the collection view | Cleared when leaving `providers` |
| `requestId` | requests | backend-valid request identifier | Absent means the Requests collection view | opaque request identifier | Invalid values fall back to the owning collection state | Cleared when leaving `requests` |
| `mode` | requests | section-owned typed Requests mode values only | Absent means the Requests default mode | lowercase canonical mode key | Fall back to the Requests default mode | Cleared when leaving `requests` |
| `mode` | actions | `recommended`, `promote`, `expert-services`, `campaigns` | `recommended` when omitted | lowercase canonical mode key | Fall back to `recommended` | Cleared when leaving `actions` |

Legacy request-filter aliases remain valid only as a narrow migration layer:

| Legacy parameter | Canonical parameter |
|---|---|
| `city` | `cityId` |
| `category` | `categoryKey` |
| `service` | `subcategoryKey` |
| `serviceKey` | `subcategoryKey` |

Precedence rules:

1. `cityId` before `city`;
2. `categoryKey` before `category`;
3. `subcategoryKey` before `service` before `serviceKey`.

Generated URLs must remove legacy filter parameters and write canonical keys only.

### 5.5 URL state

Canonical request filters are:

```text
cityId
categoryKey
subcategoryKey
sort
page
limit
```

User-visible filter state should be represented in the URL when a view needs to be shareable or restorable.

Generated URLs must be deterministic, must omit default values where appropriate, and must not retain conflicting canonical and legacy parameters.

---

## 6. Functional Requirements by Section

### 6.1 Overview

The overview must:

- provide a bounded operational summary of the current market and user context inside the fixed-height workspace;
- distinguish overview previews from the deeper analytical purpose of Statistics;
- open approved preview drill-downs in the full central canvas while keeping the shell, filters, and AI context mounted;
- route specialized workflows to their owning Requests, Providers, Statistics, Actions, or other canonical section;
- render Active Offers as compact canonical Request cards rather than notification rows;
- use canonical workspace contracts;
- render request cards from the same request source used by request lookup and request interactions;
- keep `requestById`, favorite request state, cards, and related actions synchronized;
- avoid legacy public-overview composition for private canonical behavior;
- recompose preview columns and rows from actual central-container width and available height when sidebar or AI rail state changes;
- keep preview cards within readable maximum widths on large and ultrawide displays;
- present appropriate loading, empty, error, and partial-data states.

The normative Dashboard composition, Market Overview drill-down, shell-state behavior, and visual references are defined in `DASHBOARD_OVERVIEW_SPECIFICATION.md`.

### 6.2 Requests

The requests section must:

- support public market browsing;
- support authenticated “my requests” workflows;
- support role, state, period, sorting, city, category, and subcategory context where applicable;
- paginate server-backed lists;
- preserve filters through canonical URL parameters;
- expose only backend-authorized actions;
- support favorites without relying on inconsistent request snapshots;
- prevent race conditions and stale mutation state.

The backend must determine whether actions such as publish, archive, duplicate, cancel, or delete are legal.

### 6.3 Providers

The providers section must:

- use the canonical workspace provider contract for both main content and contextual rail;
- support provider discovery and relevant filters;
- display business-ready badges and summary information returned by the backend;
- expose favorite-provider behavior consistently;
- avoid recomputing trust, priority, ranking, or business classification in the frontend.

### 6.4 Reviews

The reviews section must:

- use one canonical reviews architecture;
- present review summaries, lists, queues, and composer permissions from backend-owned contracts;
- load all reviewable completed bookings through paginated aggregation where required;
- not maintain a separate `reviewRole` route branch;
- preserve accessibility and clear success/error behavior for review submission.

### 6.5 Chat

The chat section must:

- use a dedicated workspace chat contract;
- require authentication for private conversations;
- preserve a safe login return path;
- expose conversation and action context without leaking unauthorized information;
- handle loading, empty, disconnected, and error states;
- maintain frontend/backend DTO parity.

Shared or generated contract types should replace manually mirrored DTOs when feasible.

### 6.6 Statistics and Decision Dashboard

Statistics must be a decision surface rather than a collection of decorative charts.

The backend must aggregate the entire section from one shared filter context:

```text
range: 24h | 7d | 30d | 90d
cityId: optional
regionId: optional
categoryKey: optional
```

The canonical response should include:

- `decisionContext`;
- `filterOptions`;
- `sectionMeta`;
- `summary`;
- `kpis`;
- `activity`;
- `demand`;
- `opportunityRadar`;
- `priceIntelligence`;
- `profileFunnel`;
- `insights`;
- `growthCards`;
- `exportMeta`.

The backend owns:

- focus/global mode;
- selected filter labels;
- low-data decisions;
- demand, competition, and activity health;
- opportunity ranking and scores;
- peer comparison context;
- price corridor, confidence, and recommendation;
- rule-based or AI recommendations;
- context-sensitive section labels;
- action recommendations and export conventions where product-controlled.

The frontend must only validate, format, compose, and render this information.

In focus mode:

- the selected city must be rank 1;
- ranks 2–3 must be direct nearby competitors in the same analytical context;
- each opportunity item must contain its own peer and price context;
- switching between opportunities must not trigger frontend ranking or price recomputation.

Low-confidence analytics must be explicitly marked. The platform must not display pseudo-precision when data is insufficient.

### 6.7 Profile

The profile section must:

- expose only authorized data and actions;
- clearly separate editable user state from public profile representation;
- support provider trust information where applicable;
- use backend validation for all persisted changes;
- provide explicit success, validation, and error feedback.

### 6.8 Actions Growth Center

`Actions` is a canonical user-facing workspace section. It must answer:

> What should I do now to achieve a better result?

The section must be role-aware and must combine four clearly separated capabilities:

1. **Recommended actions** — prioritized workflow, profile, quality, and opportunity actions;
2. **Promotion tools** — transparent paid or controlled visibility products for profiles, services, offers, or requests;
3. **Expert services** — profile review, content, campaign, and marketplace-support services;
4. **Campaigns and results** — active, scheduled, paused, completed, and draft promotion activity with outcome metrics.

Profile editing must remain owned by the Profile section. An action may deep-link to the exact Profile field or workflow state that requires attention; Actions must not duplicate the full profile editor.

Organic ranking, paid placement, AI recommendations, verification, and workflow urgency must remain distinct concepts:

- paid placements are always labelled `Sponsored`;
- promotion must not silently modify organic ranking;
- verification and trust badges cannot be purchased;
- AI origin does not mean positive opportunity;
- action-required does not automatically mean risk;
- normal non-promoted participation remains available;
- eligibility, relevance, geography, category, budget, duration, and expected placement must be explicit before activation;
- predicted reach is an estimate, never a guarantee;
- campaigns must support appropriate pause, resume, end, budget-limit, and audit behavior;
- organic and paid metrics must be reported separately.

The canonical route is:

```text
/workspace?section=actions
```

The detailed functional, contract, responsive, accessibility, and acceptance requirements are defined in:

```text
docs/ACTIONS_GROWTH_CENTER_SPECIFICATION.md
```

### 6.9 Favorites

Favorites must:

- support request and provider targets;
- use valid backend identifiers;
- remain synchronized with canonical collection state;
- avoid deriving an identifier from incomplete or unrelated presentation data;
- preserve a defensive target-ID fallback until all dependent flows are verified and migrated.

---

## 7. Interactive Activity Map

The activity map is an analytical product surface and must be implemented as an isolated feature module.

### 7.1 Separation of concerns

The feature must separate:

- presentation: map, markers, legend, tooltips, controls;
- orchestration: queries, cache, filter and selection coordination;
- domain helpers: mapping, aggregation, clustering, and formatting.

Map UI state such as zoom, bounds, selected city, and open tooltip must be separated from server/data state.

### 7.2 Data contract

The map must use strict types for city points, heat points, activity statistics, time range, and map bounds.

API responses must be validated at the frontend boundary. Backend bounds and filter inputs must be constrained, including maximum range, bounding-box size, page size, and result count.

### 7.3 Performance

- Large point sets must use clustering.
- The browser must not render thousands of DOM markers directly.
- Canvas, WebGL, clustering, or viewport-based loading should be used where volume requires it.
- Heavy transformations must be memoized or moved off the main thread when justified.
- Map movement and zoom requests must be throttled or debounced.
- Request cancellation and deduplication must prevent stale results and race conditions.

### 7.4 UX and accessibility

The map must provide:

- loading, empty, error, and retry states;
- stable tooltips or popups;
- a clear legend;
- mobile-safe drag, zoom, and touch targets;
- keyboard-accessible controls;
- text or icon reinforcement for color-coded meaning;
- an accessible list or table alternative for key map information.

Exact private user coordinates must not be logged or unnecessarily exposed.

---

## 8. Frontend and Backend Boundary

The platform rule is:

> Backend computes product truth. Frontend renders product truth.

### 8.1 Backend responsibilities

The backend owns:

- authentication and authorization;
- domain validation;
- workflow legality and state transitions;
- KPI formulas and analytics semantics;
- ranking and prioritization;
- action availability;
- confidence and low-data decisions;
- section-level aggregation;
- database constraints;
- cache policy;
- security enforcement.

### 8.2 Frontend responsibilities

The frontend owns:

- route and shell composition;
- layout and visual hierarchy;
- accessible interaction;
- local presentation state;
- safe optimistic UI where appropriate;
- loading, empty, and error presentation;
- responsive behavior;
- date, number, currency, and locale formatting;
- user-visible URL filter synchronization.

### 8.3 Prohibited frontend behavior

The frontend must not:

- infer permissions from incidental raw fields;
- act as a second workflow engine;
- recompute backend-owned KPI or ranking meaning;
- build permanent fallback business logic;
- maintain parallel rendering systems for one section;
- silently accept incompatible payloads.

### 8.4 Contract rules

Each major section must converge to one typed, documented, stable, section-shaped contract.

When a required contract field changes, update together:

1. backend DTO and validation;
2. OpenAPI or canonical contract documentation;
3. frontend DTO;
4. frontend runtime schema;
5. focused contract and feature tests.

---

## 9. Technical Architecture

### 9.1 Stack

The current platform stack is:

- frontend: Next.js, React, TypeScript, Tailwind;
- backend/BFF: NestJS and TypeScript;
- primary database: MongoDB;
- cache and supporting state: Redis;
- API documentation and contract reference: OpenAPI;
- end-to-end testing: Playwright where applicable.

### 9.2 Frontend structure

Frontend features should be organized by product surface with clear internal layers:

```text
feature/
  data/
  presentation/
  state/
  orchestration/
  shared/
  tests/
```

Presentational components should remain mostly pure. Hooks and orchestration modules may coordinate queries and UI state but must not become hidden business engines.

### 9.2.1 Workspace frontend convergence

Workspace frontend convergence is governed by `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

That strategy is an approved target contract for finishing the preview refactor line. It defines:

- section-by-section convergence sequencing;
- backend-contract reuse rules;
- no-fake-production-data policy;
- visual and UX completion criteria;
- dead-code removal, professional renaming, and file relocation requirements;
- the required delivery workflow for every workspace section.

### 9.3 Backend structure

Backend modules should preserve clear boundaries:

```text
controller -> service/use case -> repository/integration
```

Controllers must not contain business logic. Persistence entities must not be exposed directly when the workspace needs a business-ready DTO.

### 9.4 Server state

Server-state access must support:

- deterministic cache keys;
- cancellation and deduplication;
- explicit stale/invalidation behavior;
- bounded retries;
- safe mutation reconciliation;
- no duplicate requests caused by competing orchestration paths.

---

## 10. Brand and UX Requirements

### 10.1 Brand core

The name De'ciZhen derives from “decision.” The platform should help users make a correct service decision quickly and with less effort.

The internal product test is:

> Does this simplify the decision or make it harder?

Unnecessary complexity should be removed.

### 10.2 Tone of voice

Product communication must be:

- confident;
- friendly;
- simple;
- direct;
- free of unnecessary corporate language.

Preferred language emphasizes “fast,” “convenient,” “near you,” and “verified” only when factually supported.

Avoid unsupported claims such as “revolutionary,” “unique platform,” or “innovative solution.”

### 10.3 Interaction principles

- One primary task per screen or state.
- The primary action remains visible and understandable.
- Text is concise but not ambiguous.
- Controls provide clear feedback.
- Empty states explain the next useful action.
- Destructive or irreversible actions require appropriate confirmation.
- Status and priority must not depend on color alone.

---

## 11. Design System

### 11.1 Design character: Calm Intelligence

De'ciZhen must feel like a calm, intelligent, premium, and tactile control system.

Required qualities:

- low visual noise;
- clear information hierarchy;
- subtle depth;
- restrained use of accent colors;
- soft, physical interaction feedback;
- analytical precision without a cold or machine-like character.

The interface must not use neon, gaming, loud sci-fi, excessive glow, decorative glassmorphism, or a collection of differently colored cards.

### 11.1.1 Premium minimal color discipline

The base UI is intentionally restrained:

- warm off-white workspace background;
- white or near-white surfaces;
- near-black primary text;
- muted cool-gray secondary text and icons;
- low-contrast neutral borders;
- one deep navy primary color for selected navigation, primary buttons, and key focus states.

Semantic families such as demand, supply, opportunity, risk, AI, and action are not a decorative page palette. They may appear only as small indicators, chart segments, dots, thin rings, restrained badges, or local state emphasis when their business meaning is necessary.

Large card backgrounds, navigation surfaces, entire content blocks, and primary controls must not be assigned different semantic colors merely to create variety.

### 11.2 Light and dark themes

Both themes must represent the same product under different ambient-light conditions:

- light theme: soft daylight intelligence;
- dark theme: calm night intelligence.

The following must remain consistent across themes:

- spacing;
- radii;
- density;
- layer structure;
- typography hierarchy;
- control behavior;
- semantic meaning.

Themes may vary color, luminance, transparency, shadow depth, and surface contrast.

Pure black backgrounds, pure white-on-black as the dominant treatment, bright neon accents, and heavy glow are prohibited.

### 11.3 Surface hierarchy

The system uses three surface levels:

1. **Background field** — page-level environment.
2. **Card surface** — primary content panels.
3. **Control surface** — navigation, tabs, filters, segmented controls, and floating controls.

Glass and blur may support navigation and control surfaces but must not be applied indiscriminately.

### 11.4 Motion

Motion must be short, calm, and functional.

Permitted patterns include:

- active capsule movement;
- subtle elevation;
- controlled contrast response;
- short fade or soften transitions.

Motion must support `prefers-reduced-motion` where appropriate.

Pulse, shimmer, aggressive spring, neon flash, or decorative continuous animation are prohibited unless required by a documented interaction need.

---

## 12. Decision Intelligence Language

Semantic color is a business language, not decoration.

| Semantic family | Meaning | Typical use |
|---|---|---|
| Blue / Info | Demand | Small demand indicators, chart segments, request and market signals |
| Sand | Supply | Small provider, availability, capacity, and competition indicators |
| Sage | Opportunity | Small opportunity and positive-potential indicators |
| Danger | Risk | Lost leads, falling demand, weak conversion, critical issues |
| AI Accent | AI Intelligence | AI recommendations, insights, predictions, and scores |
| Warning / Action | Action required | To-do, next step, pending decision, follow-up, needs review |
| Neutral | Information | Filters, dates, labels, settings, passive statistics |

### 12.1 Semantic rules

- `AI` is not the same as `Opportunity`.
- AI color indicates that information was generated or interpreted by the system; it does not indicate that the result is positive.
- `Action required` is not the same as `Risk`.
- A new message or pending reply may require action without indicating danger.
- The same business meaning must use the same hue family throughout the platform.
- Light and dark themes may adjust luminance, transparency, and saturation but must preserve meaning.
- Color must always be reinforced with text, iconography, shape, or labeling.
- Semantic colors must occupy a small visual area and must never turn the workspace into a multicolored dashboard.

---

## 13. Tailwind and Style-Layer Rules

Tailwind is the primary styling mechanism for layout, spacing, and typography.

CSS variables must provide centralized semantic design tokens for:

- backgrounds;
- surfaces;
- borders;
- primary and secondary text;
- accents;
- semantic states;
- shadows;
- glass and transparency.

Custom CSS or SCSS may be used only when it provides a clearer solution for:

- complex keyframes;
- isolated advanced layout cases;
- theme maps;
- controlled decorative effects;
- feature-specific styling not reasonably expressed with Tailwind.

### 13.1 Style constraints

- Global CSS must remain minimal.
- Feature-specific rules must not leak into global selectors.
- `!important` must not be used as a routine conflict-resolution mechanism.
- Deep selector nesting is prohibited.
- `@apply` must be limited to stable, repeated patterns.
- Repeated cards, panels, badges, overlays, and controls must converge to shared primitives or variants.
- New CSS/SCSS must not duplicate an existing Tailwind or token-based solution without documented justification.
- Large style files must be split by ownership and responsibility.

---

## 14. Accessibility Requirements

The platform must target WCAG-aligned accessible interaction.

Required baseline:

- semantic HTML and appropriate landmarks;
- complete keyboard access;
- visible focus states;
- accessible names for interactive controls;
- focus management for dialogs, sheets, and route transitions where needed;
- sufficient text and control contrast in both themes;
- meaning not communicated by color alone;
- reduced-motion support;
- accessible loading, error, and validation feedback;
- usable mobile touch targets;
- accessible alternatives for map- or chart-only information.

Critical accessibility smoke tests must be part of the release gate.

---

## 15. Security and Privacy Requirements

### 15.1 Configuration and secrets

- Secrets must exist only in environment variables or an approved secret store.
- Secrets, tokens, passwords, OAuth credentials, SMTP credentials, database URIs, and API keys must never be committed to source control or documentation.
- `.env.example` must contain names and safe examples only.
- Logs must redact authorization headers, cookies, tokens, and personal data.
- Exposed credentials must be revoked and rotated immediately.

### 15.2 Authentication and authorization

- Authorization must be enforced on the server.
- Frontend visibility is not a security boundary.
- Sensitive actions require explicit permission checks.
- Session or authentication cookies must use appropriate `HttpOnly`, `Secure`, and `SameSite` settings.
- Login, registration, reset, and sensitive public endpoints require rate limiting.

### 15.3 Input and data protection

- NestJS DTOs and a global validation mechanism must validate incoming data.
- Query fields must be allowlisted and bounded.
- MongoDB/NoSQL injection vectors must be rejected.
- Payload size and pagination limits must be enforced.
- User-generated content displayed in rich surfaces must be safely escaped or sanitized.
- CORS must be explicit in production and must not use an unrestricted wildcard for authenticated APIs.

### 15.4 Legal and consent surfaces

Privacy, cookies, consent, and legal links must be accessible from the runtime UI. Their final content and behavior require jurisdiction-appropriate legal review before production launch.

---

## 16. Data, MongoDB, and Redis Requirements

### 16.1 MongoDB

- Indexes must match real filter, search, sort, and lookup patterns.
- Unique constraints must be enforced at database level for fields such as email or canonical slug where applicable.
- Lists must use bounded pagination.
- Data ownership and deletion behavior must be explicit.
- Database entities must not leak directly into UI contracts when business-ready DTOs are required.

### 16.2 Redis

Every Redis use must define:

- key format;
- TTL;
- invalidation behavior;
- ownership;
- stale-data tolerance;
- fallback behavior.

Redis failure must degrade safely and must not crash the application unless the affected capability is explicitly defined as Redis-critical.

Indefinite cache entries without a documented lifecycle are prohibited.

---

## 17. Error Handling and Observability

### 17.1 Error contract

Backend errors should use one safe contract, for example:

```json
{
  "code": "REQUEST_VALIDATION_FAILED",
  "message": "The request could not be processed.",
  "details": {},
  "requestId": "..."
}
```

HTTP status codes must be semantically correct, including 400, 401, 403, 404, 409, 422, and 500 where applicable.

Frontend error surfaces must not display stack traces, internal service details, or secrets.

### 17.2 Request correlation

The frontend must send or propagate `x-request-id`. Backend services must preserve the identifier in structured logs and downstream calls where applicable.

### 17.3 Logging and health

Production logging must include:

- level;
- timestamp;
- request ID;
- route or operation;
- response status;
- latency;
- safe error classification.

The backend must expose `/health` and support graceful shutdown.

Minimum operational metrics should include error rate and request latency. Centralized logs, tracing, and alerts should be added according to deployment maturity.

---

## 18. Performance Requirements

- Avoid duplicate requests and unnecessary refetching.
- Bound external requests with timeouts.
- Limit payload and list sizes.
- Use responsive images and prevent avoidable layout shift.
- Keep key route transitions and controls responsive under expected load.
- Use clustering or non-DOM rendering for large map datasets.
- Avoid expensive decorative effects on maps, charts, tables, or long lists.
- Ensure cache behavior is observable and does not conceal stale business state.

Performance budgets should be formalized once production traffic and deployment targets are known.

---

## 19. Testing Requirements

### 19.1 Unit tests

Unit tests must cover:

- domain and mapping functions;
- routing and alias normalization;
- filter parsing and precedence;
- workflow-relevant helpers;
- contract transformation;
- analytics, map aggregation, and clustering helpers;
- ID resolution and favorites behavior.

### 19.2 Component and integration tests

Tests must verify critical state transitions, including:

- loading to success;
- loading to empty;
- loading to error and retry;
- filter change to request update;
- mutation pending, success, rollback, and invalidation;
- authentication redirect behavior;
- canonical and legacy URL normalization;
- private overview card and collection convergence.

### 19.3 End-to-end tests

Critical E2E coverage must include the platform’s primary user flow. Additional smoke coverage should include:

- authentication;
- canonical workspace navigation;
- request filtering;
- favorites;
- reviews composer eligibility;
- statistics rendering;
- map load, filter, and tooltip behavior where the feature is active.

### 19.4 Accessibility testing

Automated accessibility smoke checks are required. Manual keyboard and screen-state verification remains necessary for complex controls, maps, dialogs, and responsive navigation.

---

## 20. Production Definition of Done

A change or release is not production-ready until all applicable mandatory gates pass.

### 20.1 Build and code quality

- Frontend production build passes.
- Backend production build passes and starts without manual fixes.
- Lint passes.
- Typecheck passes.
- No unresolved critical warnings remain.
- No dead, commented-out, or knowingly duplicated implementation is introduced.

### 20.2 Configuration

- Required environment variables are documented.
- Runtime environment validation passes.
- Production API base configuration is present.
- No development-only unsafe defaults remain active.
- No secret exists in code, logs, fixtures, screenshots, or documentation.

### 20.3 API and security

- Inputs are validated.
- Errors use the shared contract.
- Server-side authorization is verified.
- CORS, session, rate-limit, and payload policies are configured.
- MongoDB indexes and unique constraints are verified.
- Redis TTL, invalidation, and fallback behavior are verified.
- `/health`, structured logs, request correlation, and graceful shutdown work.

### 20.4 UX and resilience

- Critical surfaces have loading, empty, and error states.
- Errors are safe and actionable.
- Core mobile and desktop breakpoints do not overflow or clip.
- Dialogs, sheets, navigation, filters, maps, and rails behave correctly.
- Light and dark themes preserve the same hierarchy and semantics.

### 20.5 Required validation commands

The repository’s canonical scripts take precedence, but the release gate must cover the equivalent of:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e:critical
npm run test:e2e:a11y
```

Where provided, the preferred aggregate command is:

```bash
npm run release:check
```

### 20.6 Manual release evidence

Manual QA must verify canonical workspace routes and required states at agreed mobile and desktop breakpoints.

The release record should identify:

- tested branch and commit;
- frontend and backend contract versions;
- commands executed and results;
- tested browsers and viewport sizes;
- known accepted limitations;
- deployment and rollback sequence.

---

## 21. Current Platform State

As of 2026-07-18:

- `/workspace` is the canonical product shell;
- providers and reviews use canonical workspace-oriented architectures;
- private workspace no longer depends on legacy public-overview data for canonical behavior;
- private overview request cards and request-side collections use one canonical source;
- the main statistics query path no longer reconstructs avoidable backend business semantics;
- canonical request filters and section routes are active;
- a narrow compatibility layer remains for documented legacy URLs;
- canonical shared workspace primitives own the main active surfaces;
- `Actions` is approved as a canonical Growth Center; its target contract and UI are specified, while implementation convergence remains pending;
- the frontend architecture is largely converged;
- final merge confidence still depends on complete release validation, manual browser QA, and frontend/backend sequencing;
- complete backend ownership of the statistics decision-dashboard contract remains a major cross-repository gate.

The platform must not be described as fully production-complete until those gates are closed with evidence.

---

## 22. Compatibility and Legacy Policy

Compatibility is allowed only when:

- an active migration exists;
- the canonical replacement is known;
- the compatibility code is isolated;
- current code generates only canonical values;
- a removal condition is documented.

A refactor is not complete when old and new architectures remain active without a justified migration need.

Legacy wrappers may temporarily delegate to canonical workspace primitives. They must not evolve into a second permanent implementation.

`section=actions` is canonical and must not redirect to `profile`. Profile-related actions may deep-link to Profile while preserving Actions as the originating section.

---

## 23. Change Management

### 23.1 Architectural decisions

Create or update an ADR when a change affects:

- canonical routing;
- section ownership;
- backend/frontend responsibility;
- workflow semantics;
- the semantic indicator language;
- cross-repository API contracts;
- persistent compatibility policy;
- security or data-retention policy.

### 23.2 Contract changes

Breaking contract changes require:

- explicit migration impact;
- synchronized frontend/backend work;
- compatibility or rollout decision;
- tests for old and new behavior where migration support remains;
- updated OpenAPI and runtime schemas;
- release sequencing.

### 23.3 Documentation hierarchy

Use the following order when documents disagree:

1. approved ADR for the specific decision;
2. this project specification;
3. canonical API contract or OpenAPI for payload details;
4. architecture current-state and target-state documents;
5. release DoD and QA matrices;
6. audits, handoff notes, and implementation plans.

Conflicts must be resolved explicitly; teams must not choose the most convenient interpretation silently.

---

## 24. Acceptance Summary

De'ciZhen meets this specification when:

- users experience one coherent workspace-first platform;
- public and private behavior share one route and design language;
- each section has one canonical contract and rendering path;
- backend services own business truth and authorization;
- frontend code owns accessible presentation and interaction;
- the semantic Decision Intelligence Language is consistent across sections and themes;
- the product remains usable on mobile and desktop;
- critical workflows are test-covered;
- security, privacy, observability, and data requirements are satisfied;
- compatibility is narrow, documented, and removable;
- release evidence proves the frontend and backend work together in the intended production configuration.
