# De'ciZhen Requests Section Layout Specification

**Document status:** Approved target contract  
**Version:** 1.2  
**Date:** 2026-07-19  
**Parent specification:** `DECIZHEN_PROJECT_SPECIFICATION.md`  
**Workspace standard:** `WORKSPACE_LAYOUT_STANDARD.md`  
**Canonical route:** `/workspace?section=requests`

All additional request route state, workflow parameters, and deep-link keys are governed by the shared workspace query-parameter registry in `DECIZHEN_PROJECT_SPECIFICATION.md`.

Frontend delivery sequencing, cleanup, and completion gates for this section are governed by `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

## 1. Purpose

This document defines how the Requests marketplace collection is presented inside the canonical De'ciZhen workspace. It governs shell combinations, card geometry, two-dimensional responsive density, pagination, state preservation, and approved desktop references.

Requests must remain a readable marketplace, not become a stretched gallery or an unbounded scrolling feed.

## 2. Canonical visual references

The following references are normative for the Requests section:

1. `decizhen-requests-canonical-expanded-v1.png` — expanded `232px` sidebar and expanded `320px` AI rail;
2. `decizhen-requests-canonical-sidebar-collapsed-v1.png` — `72px` icon sidebar and expanded AI rail;
3. `decizhen-requests-canonical-ai-collapsed-v1.png` — expanded sidebar and collapsed AI rail;
4. `decizhen-requests-canonical-focus-v1.png` — icon sidebar and collapsed AI rail;
5. `decizhen-requests-canonical-ultrawide-v1.png` — expanded shell on a `2560 × 1080` monitor using five columns and three rows.
6. `decizhen-my-work-canonical-expanded-v1.png` — My Work with expanded sidebar and AI rail;
7. `decizhen-my-work-canonical-focus-v1.png` — My Work with icon sidebar and Decision Indicator;
8. `decizhen-request-editor-canonical-expanded-v1.png` — step-based request editor with expanded shell;
9. `decizhen-request-editor-canonical-focus-v1.png` — request editor focus mode with live preview.
10. `decizhen-public-request-detail-canonical-expanded-v1.png` — public market request detail with expanded shell;
11. `decizhen-public-request-detail-canonical-focus-v1.png` — public market request detail in focus mode.

The images define composition and density, not hard-coded demo data. Production content, permissions, and backend results govern the rendered requests.

## 3. Persistent Requests workspace

- The application occupies `100dvh` and does not use document-level vertical scrolling on supported desktop layouts.
- The top bar remains fixed.
- A large visible section title and subtitle are omitted in dense desktop mode; the semantic heading and description remain visually hidden for accessibility and indexing.
- Market / My Work tabs and request filters begin immediately below the top bar.
- The request grid owns the remaining central area above pagination.
- Pagination remains visible at the bottom of the central canvas.
- Expanded and collapsed shell states must not reset route, filters, sorting, view mode, current entity, or user position.

## 4. Shell-state matrix

At a reference `1440 × 900` viewport:

| Sidebar | AI rail | Central behavior | Reference density |
|---|---|---|---:|
| `232px` expanded | `320px` expanded | narrowest standard central canvas | `2 × 2 = 4` |
| `72px` collapsed | `320px` expanded | released sidebar width adds a column when card minimum permits | `3 × 2 = 6` |
| `232px` expanded | collapsed to Decision Indicator | released rail width adds a column | `3 × 2 = 6` |
| `72px` collapsed | collapsed to Decision Indicator | cards become wider while retaining three readable columns | `3 × 2 = 6` |

The state matrix is illustrative. Actual column and row counts are calculated from central-container dimensions, not directly from shell-state names.

## 5. Request card contract

### 5.1 Geometry

- Minimum width: `320px`.
- Preferred width: `360–400px`.
- Maximum width: `420px`.
- Minimum height: `220px`.
- Preferred height: `240–270px`.
- Maximum height: `300px`.
- Grid gap: `16px`, with a permitted comfortable increase up to `20px` on large canvases.

Cards must not expand beyond their maximum simply to consume an ultrawide monitor. When another safe column cannot be added, residual space becomes consistent outer space or bounded gaps.

### 5.2 Content hierarchy

Every market request card contains:

- category eyebrow;
- request title, clamped to two lines;
- concise description, clamped to two lines;
- location and date metadata;
- price or budget context;
- recurrence or request-type context when applicable;
- at most one primary semantic signal in the default summary;
- favorite control;
- meaningful image when available.

The whole card is an accessible navigation target. Favorite remains a separate control with its own accessible name and state.

### 5.3 Image composition

- At comfortable widths, the image occupies approximately `28–35%` of card width.
- Near the minimum card width, it may occupy `36–40%` while descriptions remain clamped.
- Images use `object-fit: cover`, meaningful crops, and the same card height.
- Missing imagery uses an approved neutral fallback without changing card geometry.

## 6. Two-dimensional adaptive grid

Requests derives column count from the available width of the central grid container, after sidebar and AI-rail allocation.

| Central grid width | Columns |
|---:|---:|
| `< 720px` | 1 |
| `720–1055px` | 2 |
| `1056–1439px` | 3 |
| `1440–1799px` | 4 |
| `1800–2199px` | 5 |
| `>= 2200px` | 6 |

Rows derive from the height available after the fixed top bar, contextual controls, pagination, padding, and grid gaps.

| Available grid height | Rows |
|---:|---:|
| `< 470px` | 1 |
| `470–719px` | 2 |
| `720–969px` | 3 |
| `970–1219px` | 4 |
| `>= 1220px` | 5 |

The implementation must validate the calculated result against the card minimum width and height. A transition occurs only when every card remains readable and the fixed pagination remains visible.

Reference calculation:

```ts
const gridHeight =
  viewportHeight -
  topbarHeight -
  contextBarHeight -
  paginationHeight -
  verticalInsets;

const pageSize = columnCount * rowCount;
```

Container queries or an equivalent observed central-container measurement must be used. Viewport breakpoints alone are insufficient because sidebar and rail states change the usable canvas without changing the viewport.

## 7. Pagination

- Page size is derived from the current safe grid capacity: `columns × rows`.
- The UI displays the visible item range, total result count, current page, bounded adjacent pages, previous/next controls, and derived page size.
- The page-size label may be read-only when density is automatically managed.
- Backend requests must remain bounded and must not fetch an unbounded collection.
- Filter and sort changes reset to the first valid page unless a documented restoration rule applies.

When layout capacity changes, preserve the first visible item's ordinal position:

```ts
const firstVisibleIndex = (oldPage - 1) * oldPageSize;
const newPage = Math.floor(firstVisibleIndex / newPageSize) + 1;
```

If the new page exceeds the new page count, clamp it to the last valid page. URL state should contain the canonical page value; derived page size may be represented when required for shareable restoration.

## 8. Wide and tall monitors

Large displays increase information density by adding safe columns and rows. They must not create a small number of oversized cards.

The approved `2560 × 1080` expanded-shell reference uses:

- expanded `232px` sidebar;
- expanded `320px` AI rail;
- five columns;
- three rows;
- fifteen requests per page;
- card dimensions within the canonical bounds;
- persistent filters and pagination.

On larger canvases, the same calculation may produce additional columns or rows up to the approved card bounds. Product and performance testing may impose a maximum page size, but that limit must be explicit and must not cause cards to stretch beyond their maximum.

## 9. Semantic language

- Demand / requests use Info Blue.
- Supply or price context uses Sand.
- Opportunity uses Sage.
- Risk uses Danger only for real negative impact or urgency.
- Action Required uses the action/warning family.
- AI Violet marks only AI provenance.
- Neutral metadata remains neutral.

A request card should normally expose no more than one prominent semantic chip. Color is never the only signal.

## 10. My Work collection

The canonical My Work state is represented by:

```text
/workspace?section=requests&period=90d&range=90d&scope=my
```

It is a workflow-management collection, not a public marketplace grid. Its cards require more width because they combine request identity, lifecycle state, decision context, and available actions.

### 10.1 Context controls

- `Markt` and `Meine Arbeit` remain the primary scope switch; `Meine Arbeit` is selected.
- Customer/provider context and lifecycle filters remain visible in the compact contextual-control area.
- Large visible page title and subtitle are omitted in dense desktop mode while accessible semantic content remains available.
- Filters, status, role context, sorting, page, and shell state survive navigation to a request and back.

### 10.2 Workflow card

Every My Work card contains:

- request and attention-status chips;
- a compact lifecycle path: Request, Offers, Selection, Contract, Completion;
- category, title, clamped description, location, date, and budget;
- a meaningful image or neutral fallback;
- one concise Current State summary;
- one primary next action, one secondary action, and an overflow menu when required.

The same warning must not be repeated in multiple card panels. Backend-owned workflow state determines the current stage and legal actions.

### 10.3 Geometry and density

- Minimum card width: `480px`.
- Preferred card width: `560–620px`.
- Maximum card width: `680px`.
- Preferred height: `260–300px`.
- Cards use equal height within a grid page.

| Central collection width | Columns |
|---:|---:|
| `< 960px` | 1 |
| `960–1439px` | 2 |
| `1440–1919px` | 3 |
| `>= 1920px` | 4 |

Visible rows derive from available height using the same bounded calculation as the market grid, but My Work applies its larger minimum card height. Page size remains `columns × rows`.

At `1440 × 900`:

- expanded sidebar and rail use one column and two rows;
- collapsed sidebar and rail use two columns;
- an incomplete final row does not stretch its last card across unused columns;
- a quiet empty-cell state may explain that new workflows will appear there, but must not compete with active work.

### 10.4 Pagination and position

My Work uses bounded pagination and the same first-visible-item preservation algorithm as the market collection. Returning from details or edit mode restores the originating filters, page, and focused card.

## 11. Request editor

The canonical edit state is represented by:

```text
/workspace?section=requests&period=90d&range=90d&scope=my&mode=edit&requestId={id}
```

Editing occurs inside the existing workspace shell. It must not render as a long page containing every field.

### 11.1 Step model

The canonical editor uses five steps:

1. Basics;
2. Description;
3. Location & Schedule;
4. Photos;
5. Review.

Only the current step occupies the main form region. Completed, current, unavailable, valid, and error states must be programmatically exposed. Step state should be restorable through validated URL or local workflow state.

Navigation to another step must validate only the fields required to leave the current step. Users may save a valid draft without completing publication requirements.

### 11.2 Fixed editor canvas

- The editor header contains Back to My Work, ownership/status context, save state, and safe secondary actions.
- Step navigation remains visible beneath the header.
- The current step fits the central canvas without document scrolling on supported desktop viewports.
- A local scroll region may be used only for an intrinsically complex step and must not move the top bar, step navigation, or sticky action bar.
- The bottom action bar remains fixed inside the central canvas and contains cancel/back, draft save when relevant, save state, and the primary next action.
- Destructive actions require confirmation and must not visually compete with the primary progression action.

### 11.3 Width adaptation

Form fields must not stretch indefinitely when shell controls collapse or the monitor becomes wider.

- Comfortable text measure and field groups govern the form width.
- Expanded-shell layouts may use a narrow live summary/quality column when space permits.
- Focus mode uses a centered editor workspace with a maximum width of approximately `1220px`.
- In focus mode, the editing form occupies approximately `68%` and live preview approximately `32%`.
- Additional width improves preview, comparison, photo management, or contextual help; it does not add unrelated fields or create excessively long text lines.

### 11.4 Live preview

The preview may show category, title, clamped description, location, budget, frequency, imagery, and request-quality summary. It represents marketplace presentation and must not duplicate the AI decision rail.

When the AI rail is collapsed, the Decision Indicator retains the current quality score, provenance, pending count, and expand action. The live preview remains part of the editor.

### 11.5 Save and navigation safety

- Save state must distinguish Saving, Saved, Offline, Validation Error, and Save Failed.
- Navigation with unsaved changes requires safe persistence or explicit confirmation.
- Autosave must be debounced and must not overwrite a newer server version silently.
- Conflict responses require a recovery path rather than discarding edits.
- Cancel returns to the originating My Work state when safe.
- Successful completion returns to the request detail or My Work state defined by the workflow contract.

## 12. Public market request detail

The canonical public detail state is represented by:

```text
/workspace?section=requests&period=90d&range=90d&scope=market&requestId={id}
```

The request opens inside the existing workspace shell. It must not create a separate page architecture or append an unbounded recommendation feed beneath the detail.

### 12.1 Detail context navigation

The marketplace filter bar is replaced by a compact detail-navigation surface containing:

- Back to Results with the preserved result count;
- ordinal position inside the current filtered result set;
- Previous and Next request actions;
- Favorite and Share controls where permitted;
- a quiet indication that market filters are preserved.

The originating market state must preserve canonical filters, sort, view mode, page, shell state, and focused card. Back returns to the originating page and restores focus to the selected request card.

Previous and Next traverse the current filtered and sorted result set. They must not silently switch to an unrelated global collection. Boundary states disable the unavailable direction.

### 12.2 Primary detail composition

The fixed central canvas contains:

1. one primary request-detail panel;
2. one bounded Similar Requests row;
3. no document-level vertical feed.

The primary panel presents:

- moderation/publication status when relevant;
- category and request title;
- readable, bounded description;
- location, date, budget, frequency, and relevant service tags;
- concise requirements or customer priorities;
- privacy-safe requester summary;
- meaningful image gallery with count and thumbnails where available;
- one primary CTA and one secondary CTA appropriate to the viewer;
- a single concise contextual information message.

Sensitive or unnecessary requester information must not be exposed. Ratings, verification, and identity claims appear only when backed by real platform state.

### 12.3 Viewer-aware actions

CTA availability is derived from authentication, role, ownership, eligibility, moderation, and request state.

- Guest: primary `Sign in & Submit Offer`; chat or question actions visibly require sign-in.
- Eligible provider: submit or manage an offer and use permitted communication actions.
- Customer who is not the owner: no provider-only offer CTA.
- Owner: manage the request through My Work; never submit an offer to their own request.
- Ineligible, closed, paused, expired, or moderated request: show the backend-owned blocking reason and safe alternatives.

The UI must never display an enabled authenticated action while simultaneously presenting the viewer as a guest.

### 12.4 AI decision context

The expanded AI rail becomes request-specific. Decision Panel uses a fit or relevance summary for the selected request rather than repeating the total market count. Action Queue and Recommendations use viewer-safe actions related to this request.

When the rail collapses, the Decision Indicator retains the request-specific score, semantic ring, AI provenance, pending count, and expand action.

### 12.5 Responsive detail width

With the expanded shell, the detail uses the available central width without exceeding readable text measures. Media and action content form the secondary internal column.

In focus mode:

- the detail workspace is centered and capped at approximately `1280px`;
- content occupies approximately `58–62%`;
- media and actions occupy approximately `38–42%`;
- additional width improves gallery visibility and comparison, not paragraph length;
- all primary content remains visible within the supported desktop viewport.

### 12.6 Similar requests

- Similar Requests is a secondary bounded row, not part of the main market pagination.
- Expanded-shell reference shows two compact previews.
- Focus-mode reference shows three compact previews.
- Cards inherit the public request-card contract and semantic language.
- A route to all similar requests may apply a documented similarity filter.
- Similarity ranking and explanation are backend-owned.
- Loading, empty, and failure states do not resize the primary detail panel.

## 13. Loading, empty, and error states

- Loading skeletons preserve the calculated grid and card geometry.
- An empty result occupies the central grid area without removing shell controls or pagination context.
- Errors provide retry and preserve current filters.
- Partial image failure does not resize a card.
- A page that becomes empty after mutation returns to the nearest valid page.

## 14. Acceptance criteria

The Requests layout is complete when:

- all four shell combinations recompose without empty former columns;
- ultrawide and tall screens add safe columns or rows instead of stretching cards;
- card dimensions remain within documented bounds;
- pagination is always visible on supported desktop heights;
- page size equals current safe grid capacity;
- the first visible item remains in context after shell or viewport changes;
- filters, sorting, view mode, and shell state persist;
- no request text, AI recommendation, or rail control is clipped;
- keyboard, focus, screen-reader, reduced-motion, light-theme, and dark-theme behavior are verified.
- My Work cards retain readable workflow structure in every shell state;
- incomplete My Work rows do not stretch cards beyond their maximum;
- edit mode uses the canonical step model and fixed action bar;
- collapsing the shell adds preview/context capacity without producing oversized form fields;
- draft, autosave, conflict, validation, and unsaved-navigation states are covered.
- public detail restores the exact originating market context and card focus;
- Previous and Next remain inside the preserved filtered result set;
- guest, provider, customer, and owner CTAs follow authorization and ownership rules;
- request-specific AI context replaces generic whole-market repetition;
- Similar Requests remains bounded and does not create page scrolling;
- collapsed-shell detail improves gallery/context without producing overlong text measures.
