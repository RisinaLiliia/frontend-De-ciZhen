# De'ciZhen Workspace Profile Section Specification

## Document Status

- Status: Approved target contract
- Version: 1.0
- Last updated: 2026-07-19
- Canonical route: `/workspace?section=profile`
- Owner: Workspace / Profile

All profile route state, including `viewerMode` and `profileView`, is governed by the workspace query-parameter registry in `DECIZHEN_PROJECT_SPECIFICATION.md`.

Frontend delivery sequencing, cleanup, and completion gates for this section are governed by `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

## 1. Purpose

The Profile section is the workspace management center for the user's marketplace identity. It must help a customer or provider understand what is public, what is incomplete, and which profile data can be changed without leaving the workspace.

The section is not a settings page and must not remain a single oversized onboarding form. Its default view is a scannable management overview; each summary card opens a focused editor in the same central canvas.

## 2. Product Principles

1. The workspace shell is invariant. The top bar, left navigation, and contextual AI rail use the same components and geometry as every other workspace section.
2. Only the central canvas changes when a Profile card is opened.
3. The expanded or collapsed state of the left sidebar and AI rail must never leave reserved empty columns.
4. A collapsed AI rail is a floating overlay above the central canvas and consumes zero grid width.
5. Provider and customer profiles are separate role contexts, not two unrelated screens.
6. The interface uses the existing De'ciZhen tokens and Decision Intelligence Language. It introduces no feature-local palette.
7. The backend owns readiness, completeness, verification, review eligibility, and other derived business states. The frontend validates and renders them.

## 3. Scope and Non-goals

### In scope

- provider and customer role switching;
- profile readiness and public visibility;
- identity and contact information;
- public profile presentation;
- services and pricing;
- service area and availability;
- trust, evidence, reviews, and verification status;
- responsive and shell-collapse behavior;
- focused detail editors inside the central workspace canvas.

### Out of scope

- password, privacy, cookies, theme, and account-security settings;
- request promotion and campaign management, which belong to the Growth Center;
- purchasing verification or reviews;
- duplicating marketplace analytics already owned by Statistics;
- frontend-calculated verification, readiness, or review scores.

## 4. Approved Visual References

The following assets are normative composition references. Product copy and data may evolve, but shell behavior, hierarchy, density, palette, and interaction ownership must remain consistent.

| State | Approved reference |
| --- | --- |
| Desktop: sidebar and AI rail expanded | [`profile-overview-expanded-v1.png`](assets/workspace/profile/profile-overview-expanded-v1.png) |
| Desktop: sidebar collapsed | [`profile-overview-sidebar-collapsed-v1.png`](assets/workspace/profile/profile-overview-sidebar-collapsed-v1.png) |
| Desktop: AI rail collapsed | [`profile-overview-ai-collapsed-v1.png`](assets/workspace/profile/profile-overview-ai-collapsed-v1.png) |
| Desktop focus: both collapsed | [`profile-overview-focus-v1.png`](assets/workspace/profile/profile-overview-focus-v1.png) |
| Tablet | [`profile-overview-tablet-v1.png`](assets/workspace/profile/profile-overview-tablet-v1.png) |
| Mobile | [`profile-overview-mobile-v1.png`](assets/workspace/profile/profile-overview-mobile-v1.png) |
| Identity and contact detail | [`profile-identity-contact-detail-v1.png`](assets/workspace/profile/profile-identity-contact-detail-v1.png) |
| Public presentation detail | [`profile-public-presentation-detail-v1.png`](assets/workspace/profile/profile-public-presentation-detail-v1.png) |
| Services and pricing detail | [`profile-services-pricing-detail-v1.png`](assets/workspace/profile/profile-services-pricing-detail-v1.png) |
| Availability and service area detail | [`profile-availability-service-area-detail-v1.png`](assets/workspace/profile/profile-availability-service-area-detail-v1.png) |
| Trust and verification detail | [`profile-trust-verification-detail-v1.png`](assets/workspace/profile/profile-trust-verification-detail-v1.png) |
| Customer role context | [`profile-customer-context-v1.png`](assets/workspace/profile/profile-customer-context-v1.png) |

## 5. Information Architecture

### 5.1 Role switch

The first control in the section is the role switch:

- `Für Anbieter` — provider marketplace identity and operating profile;
- `Für Auftraggeber` — customer identity and request-facing preferences.

The selected role is URL-addressable through `viewerMode` as defined in the shared query-parameter registry. Switching roles preserves the workspace section and shell state.

### 5.2 Provider navigation

The provider context uses a compact secondary navigation:

1. `Übersicht`
2. `Öffentliches Profil`
3. `Leistungen & Preise`
4. `Verfügbarkeit`
5. `Vertrauen & Nachweise`

The overview is the default route. Secondary items may be represented by `profileView` as defined in the shared query-parameter registry or an equivalent typed route state.

### 5.3 Overview composition

The provider overview contains:

- Profile status and readiness summary;
- public marketplace preview;
- Identity & Contact;
- Presentation;
- Services & Pricing;
- Service Area & Availability;
- Trust & Evidence;
- Profile Impact.

Each card communicates current state, one meaningful metric or progress indicator, and a clear action. It must not reproduce a full form.

### 5.4 Click map

| Overview surface | Opens in central canvas | Primary outcome |
| --- | --- | --- |
| Identity & Contact | Identity and contact editor | Maintain legal/display identity and communication data |
| Public marketplace preview / Presentation | Public presentation editor and preview | Control how the profile appears to customers |
| Services & Pricing | Service catalogue editor | Define offered services and valid price models |
| Service Area & Availability | Coverage and schedule editor | Define where and when the provider can work |
| Trust & Evidence | Trust and verification workspace | Manage evidence and understand verification state |
| Reviews summary | Reviews section or eligible review detail | Inspect verified marketplace feedback |
| Profile Impact | Statistics with matching profile context | Inspect performance without duplicating analytics |

## 6. Workspace Shell and Layout Contract

### 6.1 Desktop shell states

| Sidebar | AI rail | Central canvas behavior |
| --- | --- | --- |
| Expanded | Expanded | Uses remaining width between the two fixed tools |
| Collapsed | Expanded | Immediately consumes released sidebar width |
| Expanded | Collapsed | Immediately consumes released rail width; compact AI indicator floats above content |
| Collapsed | Collapsed | Uses all available workspace width; compact AI indicator remains an overlay |

The central canvas must not be artificially capped at a laptop-sized width on large monitors. Inner cards use bounded readable widths and an adaptive grid so they gain columns instead of stretching into empty panels.

### 6.2 Compact AI indicator

The compact AI control is a shared workspace primitive, not a Profile-specific component.

- approximate overlay footprint: `96 × 96 px`;
- decision ring: approximately `64 × 64 px`;
- includes score, explicit AI provenance, optional notification count, and a separate expand chevron;
- fixed to the canonical top-right workspace position;
- rendered above content;
- reserves zero layout width;
- identical dimensions and behavior across all sections.

### 6.3 Height behavior

On desktop, the top bar and workspace tools remain visible while the central canvas owns scrolling. The overview should place status, preview, and the first management actions in the initial viewport at common laptop heights. Large monitors may show an additional row, but cards must not grow vertically only to fill the viewport.

Detail editors may scroll inside the central workspace area. Destructive and save actions remain visible through a sticky action bar when the form exceeds the viewport.

## 7. Responsive Composition

### Wide desktop (`>= 1600 px`)

- use an adaptive 12-column central grid;
- allow four compact management cards in one row where minimum card width remains usable;
- status and public preview may span multiple columns;
- keep form/editor reading width bounded even when the canvas is wide;
- use released shell width for adjacent preview, evidence, or schedule panels.

### Standard desktop (`1200–1599 px`)

- use a two- or three-column overview according to actual central-canvas width;
- avoid viewport breakpoints that ignore whether shell tools are open;
- detail editors normally use a main editor plus contextual preview/summary column.

### Tablet (`769–1199 px`)

- left navigation becomes compact or drawer-based;
- AI rail becomes a compact overlay/drawer;
- role and secondary navigation remain horizontally scrollable without wrapping into multiple toolbars;
- overview becomes a two-column or single-column sequence based on usable canvas width;
- detail preview moves below the editor when two readable columns no longer fit.

### Mobile (`<= 768 px`)

- navigation and AI rail open as overlays or sheets;
- the central canvas occupies the full viewport width;
- cards stack in task order, not desktop visual order;
- role switch remains visible near the top;
- secondary navigation is horizontally scrollable;
- primary save action is sticky and full-width;
- controls have at least a `44 × 44 px` target;
- no horizontal page scroll.

Container queries or measured central-canvas width are preferred for card-grid decisions because the same viewport can expose different content widths depending on shell state.

## 8. Detail Screen Requirements

### 8.1 Identity & Contact

Includes avatar, full name, display name, email, telephone, city, and role-relevant identity fields. Verified and unverified states must be explicit. Sensitive values must not appear in the public preview unless their visibility is intentionally enabled by product policy.

### 8.2 Public Presentation

Includes headline/display name, biography, category presentation, media, and a live marketplace preview. Character counts and media constraints are visible before submission. The preview uses the same card primitives as the public Providers surface.

### 8.3 Services & Pricing

Supports a structured service catalogue rather than one ambiguous global price. Every service records category, subcategory/service key, price model, price value or range, unit, and active state. Unsupported combinations are rejected at the contract boundary.

### 8.4 Availability & Service Area

Combines service coverage and working availability. It supports home city, service radius or explicit regions, recurring availability, exceptions, and next available time. The backend remains the authority for normalized geography and availability state.

### 8.5 Trust & Verification

Shows verification state, evidence requirements, completed-job and review context, and the next legitimate action. Documents use secure upload flows and must never expose private object URLs. Verification cannot be purchased, self-asserted, or calculated by the frontend.

### 8.6 Customer context

The customer profile uses the same shell and management pattern with customer-relevant cards: identity, contact preferences, request defaults, location, privacy, and trust context. Provider-only concepts such as public service pricing and provider availability are not shown.

## 9. Semantic Visual Language

All surfaces use neutral backgrounds and borders. Semantic color is reserved for compact indicators:

| Meaning | Existing token family | Profile use |
| --- | --- | --- |
| Demand | Info / muted blue | customer demand and request-related context |
| Supply | Warning / sand | provider capacity, availability, services |
| Opportunity | Success / sage | readiness gains, healthy completion, positive impact |
| Risk | Danger | blocked, rejected, missing critical evidence |
| AI | Primary plus explicit AI mark | generated recommendations only |
| Action | Warning/action treatment | pending profile task or next step |
| Neutral | muted text and borders | labels, passive status, metadata |

Large decorative color fields are prohibited. AI is provenance, not opportunity. Action is not automatically risk.

## 10. Data and Contract Ownership

### Existing usable contract surface

- common profile identity: name, email, city/cityId, phone, avatar;
- customer biography;
- provider display name, biography, category/service selection, base price, status, blocked state, and profile-complete state;
- public provider availability, next availability, reviews, completed-job context;
- availability-slot APIs.

### Required contract extensions

| Capability | Required backend ownership |
| --- | --- |
| Profile readiness breakdown | authoritative weighted criteria and missing requirements |
| Public media / portfolio | ordered media records, validation, moderation, secure upload lifecycle |
| Multi-service pricing | structured services, price models, units, ranges, activation state |
| Service areas | normalized regions/radius, geospatial validation, coverage state |
| Verification evidence | evidence type, review state, secure storage, rejection reason, audit metadata |
| Customer preferences | typed contact, location, request-default, and privacy preferences |
| Profile impact | backend-computed metrics linked to Statistics contracts |

The frontend must not fabricate production metrics when these contracts are absent. Empty, unavailable, loading, and permission-denied states must be deliberate.

## 11. State, Routing, and Persistence

- `section=profile` remains canonical.
- `viewerMode=provider|customer` selects role context.
- focused detail state must be deep-linkable and browser-history safe;
- returning from a detail restores role, scroll, and shell state;
- unsaved changes trigger a confirmation boundary;
- save mutations invalidate the profile overview, public provider card, rail, and readiness queries that depend on changed data;
- server responses remain the source of truth after mutation.

## 12. Accessibility

- role and secondary navigation expose correct tab/navigation semantics;
- progress is never color-only and includes text or numeric state;
- validation errors are associated with inputs and summarized at submission;
- status badges include readable labels;
- focus is moved to the detail title after navigation and restored to the originating card on return;
- keyboard users can reach every card action, compact AI control, preview, and sticky action;
- reduced-motion preferences disable non-essential layout animation.

## 13. Implementation Boundary

This document is an approved target contract. The current implementation still renders the onboarding form through `WorkspaceProfileSection` and `WorkspaceProfileOnboardingForm`. Migrating to this design requires incremental component and contract work; it is not achieved by CSS-only restyling.

Recommended frontend decomposition:

- `WorkspaceProfileOverview`
- `WorkspaceProfileRoleSwitch`
- `WorkspaceProfileSectionNav`
- shared `ProfileManagementCard`
- `ProfileReadinessSummary`
- `PublicProfilePreview`
- one route-owned editor per detail surface
- shared sticky `WorkspaceEditorActions`

All components must reuse workspace surface, control, badge, typography, and shell primitives.

## 14. Acceptance Criteria

- The default Profile screen is a management overview, not a full-page form.
- Provider and customer role contexts are distinct and URL-addressable.
- Every overview card has a documented destination and business outcome.
- Opening a card replaces only the central canvas.
- The four desktop shell states use all released width without blank reserved columns.
- The collapsed AI indicator is the same shared overlay used by other workspace sections.
- Tablet and mobile layouts preserve task priority and avoid horizontal page scroll.
- Cards add columns or rows according to usable canvas width; they do not stretch indefinitely on large monitors.
- All colors resolve through existing global tokens and follow the semantic indicator ADR.
- Backend-derived states are never recomputed or invented in the frontend.
- Loading, empty, error, unauthorized, and incomplete-profile states are covered.
- Keyboard, focus, contrast, labeling, and reduced-motion requirements pass accessibility review.
- Automated component tests and manual responsive QA cover every shell state and detail route.
