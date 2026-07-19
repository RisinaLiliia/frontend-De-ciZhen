# De'ciZhen Providers Section Layout Specification

**Document status:** Approved target contract  
**Version:** 1.0  
**Date:** 2026-07-19  
**Parent specification:** `DECIZHEN_PROJECT_SPECIFICATION.md`  
**Workspace standard:** `WORKSPACE_LAYOUT_STANDARD.md`  
**Canonical routes:** `/workspace?section=providers` and `/workspace?section=providers&providerId={id}`

All provider-specific deep-link state, including `providerId` and shared role-context parameters, is governed by the workspace query-parameter registry in `DECIZHEN_PROJECT_SPECIFICATION.md`.

Frontend delivery sequencing, cleanup, and completion gates for this section are governed by `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

## 1. Purpose

This document defines the Providers collection and Provider Detail inside the canonical De'ciZhen workspace. It governs provider-card geometry, responsive density, comparison, pagination, detail navigation, trust presentation, viewer-aware actions, portfolio behavior, and AI decision context.

Providers is a decision surface. It must help users evaluate real service capability and trust without fabricating reviews, verification, availability, or performance claims.

## 2. Canonical visual references

1. `decizhen-providers-list-canonical-expanded-v1.png` — expanded sidebar and AI rail;
2. `decizhen-providers-list-canonical-focus-v1.png` — icon sidebar and Decision Indicator;
3. `decizhen-provider-detail-canonical-expanded-v1.png` — expanded Provider Detail;
4. `decizhen-provider-detail-canonical-focus-v1.png` — Provider Detail focus mode.

The images define approved composition and density. Backend data, eligibility, verification, and permissions govern production content.

## 3. Providers collection

### 3.1 Fixed workspace state

- The application occupies `100dvh` on supported desktop layouts.
- Sidebar, top bar, and expanded AI rail follow `WORKSPACE_LAYOUT_STANDARD.md`.
- The semantic page heading remains available but may be visually hidden in dense desktop mode.
- Filters begin immediately below the top bar.
- Provider grid and fixed pagination consume the remaining central canvas.
- The document does not become an unbounded vertical provider feed.

### 3.2 Context controls

The collection supports:

- city or service area;
- category;
- service;
- time or availability context where meaningful;
- backend-owned sorting;
- grid/list mode where both are implemented accessibly;
- reset;
- provider comparison.

Filter, sort, comparison, page, view mode, and shell state survive navigation to detail and back.

## 4. Provider Card contract

### 4.1 Geometry

- Minimum width: `360px`.
- Preferred width: `400–460px`.
- Maximum width: `500px`.
- Preferred height: `265–300px`.
- Grid gap: `16–20px`.
- Cards use equal height within the current grid page.

Cards must not stretch beyond the maximum on wide screens. Safe columns are added when possible; otherwise residual space becomes bounded gaps or outer space.

### 4.2 Required information

Each summary card contains:

- favorite control;
- compare control;
- portrait or neutral avatar;
- service/category eyebrow;
- provider name;
- verification indicator only when backed by real verification state;
- location or service area and useful distance context;
- response time and response rate when available;
- concise two-line provider description;
- rating and review count, or an explicit no-reviews state;
- price context with correct unit;
- next availability when supported;
- at most two restrained trust or service chips;
- Profile action.

The whole card navigates to detail except favorite, comparison, and other independent controls.

### 4.3 Integrity rules

- Never render a fabricated quote when no review exists.
- Do not show decorative empty stars as if they were evidence.
- `No reviews yet` is a valid neutral state.
- Verification, Top Rated, Fast Response, Available Now, references, and similar claims require backend-owned evidence.
- References and portfolio are not reviews.
- Price must state the unit and whether it is starting, hourly, fixed, or estimated.

## 5. Responsive provider grid

Column count derives from the actual central-container width after shell allocation.

| Central grid width | Columns |
|---:|---:|
| `< 760px` | 1 |
| `760–1159px` | 2 |
| `1160–1599px` | 3 |
| `1600–2039px` | 4 |
| `>= 2040px` | 5 |

Row count derives from available grid height while preserving the provider-card minimum height and fixed pagination.

At the approved `1440 × 900` references:

- expanded sidebar and AI rail: `2 × 2 = 4`;
- icon sidebar and collapsed AI rail: `3 × 2 = 6`.

Collapsing only the sidebar does not force a third column unless the resulting cards meet the documented minimum. Collapsing the AI rail typically releases enough space for the third column at the reference viewport.

Page size equals safe columns multiplied by safe visible rows. The first visible provider remains in context when capacity changes, using the ordinal-preservation algorithm defined by the Requests specification.

## 6. Comparison

- Comparison is an explicit selectable state, not an automatic ranking claim.
- The compare control remains independent from card navigation.
- The compare action shows selected count and remains disabled when comparison is not meaningful.
- The platform must define a maximum comparable-provider count, typically three or four.
- Comparison uses the same market filters and must distinguish missing data from poor performance.
- Compared attributes may include services, service area, availability, price basis, response behavior, verified trust evidence, and reviews.
- AI recommendations may explain differences but cannot silently choose a winner.

## 7. Provider Detail

### 7.1 Detail context navigation

The collection filters are replaced by a detail-navigation surface containing:

- Back to Providers with preserved result count;
- ordinal position in the current result set;
- Previous and Next;
- Favorite, Share, and Compare where permitted;
- a quiet summary of preserved filters.

Back restores filters, sort, page, comparison selection where safe, shell state, and focus to the originating provider card. Previous and Next traverse only the preserved filtered/sorted result set.

### 7.2 Primary detail content

The fixed central canvas presents:

- provider identity and service category;
- privacy-safe service area;
- response metrics;
- honest price context;
- concise About content;
- services;
- next availability;
- languages where supplied;
- portfolio and references;
- trust evidence;
- review summary or honest no-reviews state;
- viewer-aware actions;
- one bounded Similar Providers row.

The detail must not become a long biography followed by an unbounded review feed.

### 7.3 Portfolio and trust

- Expanded detail uses one primary portfolio image and compact thumbnails.
- Focus mode may enlarge the gallery and show additional thumbnails.
- Media uses safe crops, alt text, loading states, and a full-view action when available.
- Verification appears only when a real verification process and successful status exist.
- Reliability, communication, and quality claims require evidence or must be presented as provider-authored description rather than platform fact.
- Zero reviews renders a neutral explanation, not a meaningless rating distribution.

### 7.4 Viewer-aware CTA

- Guest: `Sign in & Contact Provider`, with `Create Request` as a safe secondary path.
- Authenticated customer: contact, invite, or create/send a request when permitted.
- Provider viewing another provider: no customer-only invitation action unless dual-role context is active.
- Owner: manage or edit their own profile; never contact themselves as a customer by default.
- Blocked, unavailable, moderated, or ineligible provider: show the backend-owned reason and safe alternatives.

`Submit Offer` is not a valid Provider Detail CTA. Offers belong to a provider responding to a specific request.

### 7.5 Provider-specific AI context

The expanded Decision Panel uses provider fit or relevance for the user's current need, not the total provider-market count. It may summarize response time, response rate, distance, service match, availability, and verified trust evidence.

When collapsed, the canonical Decision Indicator retains provider-specific score, semantic ring, AI provenance, pending count, and expand action.

## 8. Focus and large-screen behavior

- Focus mode centers the detail and limits it to approximately `1280px`.
- Information/services occupy approximately `46%`; portfolio/trust/actions approximately `54%`.
- Additional width improves portfolio, reference visibility, comparison, and contextual decisions rather than paragraph length.
- Similar Providers expands from two compact previews in expanded shell to three in focus mode.
- On ultrawide monitors, the detail maximum remains bounded; large empty expanses are handled with balanced centering and contextual modules, not stretched text.

## 9. Similar Providers

- Similar Providers is bounded and separate from collection pagination.
- It inherits Provider Card integrity rules.
- Expanded shell shows two previews; focus mode shows three.
- Similarity method and explanation are backend-owned.
- Empty, loading, and error states do not resize the primary profile panel.

## 10. Semantic language

- Supply and availability use Sand where meaningful.
- Opportunity uses Sage.
- Demand context uses Info Blue.
- Risk uses Danger only for actual problems.
- Action Required uses Warning/Action.
- AI Violet marks provenance only.
- Verification and trust are expressed through explicit labels/icons and evidence, not color alone.

## 11. Acceptance criteria

The Providers section is complete when:

- provider cards remain within documented bounds in every shell state;
- expanded and focus grids fit without document scrolling;
- pagination remains visible and bounded;
- comparison controls are independent, accessible, and stateful;
- review, verification, availability, response, and price claims use real data;
- detail restores exact collection context and card focus;
- Previous and Next remain inside the current result set;
- viewer-aware CTAs prevent invalid provider/customer actions;
- portfolio and trust evidence remain distinct from reviews;
- request-specific/provider-specific AI context replaces generic market repetition;
- keyboard, screen-reader, focus, reduced-motion, loading, empty, error, light-theme, and dark-theme states are verified.

## 12. Implementation boundary

This document is an approved target contract for the preview refactor line.

The current preview branch already has a canonical providers backend contract and workspace-owned provider rail/state convergence. Remaining gaps are provider-detail routing, full central-canvas layout adoption, comparison-state hardening, and final responsive/visual verification.
