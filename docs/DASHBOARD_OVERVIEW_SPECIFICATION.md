# De'ciZhen Dashboard Overview Specification

**Document status:** Approved target contract  
**Version:** 1.0  
**Date:** 2026-07-19  
**Parent specification:** `DECIZHEN_PROJECT_SPECIFICATION.md`  
**Workspace standard:** `WORKSPACE_LAYOUT_STANDARD.md`  
**Canonical route:** `/workspace?section=overview`

Any dashboard drill-down or deep-link parameters must follow the shared workspace query-parameter registry in `DECIZHEN_PROJECT_SPECIFICATION.md`.

Frontend delivery sequencing, cleanup, and completion gates for this section are governed by `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

## 1. Purpose

Dashboard is the workspace entry point and an operational overview of the current market and user context. It provides bounded previews of important product areas, immediate next steps, and stable routes into the corresponding full sections.

Dashboard is not a second Statistics section. It answers *what is happening and where should I go next*; Statistics answers *why it is happening and what decision the evidence supports*.

## 2. Canonical visual references

1. `decizhen-dashboard-overview-canonical-expanded-v1.png` — overview with expanded sidebar and AI rail;
2. `decizhen-dashboard-overview-canonical-focus-v1.png` — overview with icon sidebar and collapsed AI rail;
3. `decizhen-dashboard-market-detail-canonical-expanded-v1.png` — full Market Overview drill-down with expanded shell;
4. `decizhen-dashboard-market-detail-canonical-focus-v1.png` — full Market Overview drill-down in focus mode.

The references define composition, hierarchy, density, and shell behavior. Production values, rankings, market signals, permissions, and recommendations remain backend-owned.

## 3. Workspace behavior

- Dashboard occupies the central canvas of the canonical fixed-height workspace.
- The top bar, global context filters, sidebar, and AI rail follow `WORKSPACE_LAYOUT_STANDARD.md`.
- The semantic page title and description remain in the document structure but may be visually hidden in dense desktop mode.
- The overview fits within the available desktop viewport without an unbounded document feed.
- A preview may use internal bounded scrolling only when accessibility and content integrity require it; the default overview uses no internal scroll.
- Shell expansion state, filters, selected preview, drill-down state, and safe navigation context must persist.

## 4. Overview composition

The canonical overview contains:

1. **Market Overview** — map, active demand, active providers, and market balance;
2. **Demand by Category** — a bounded ranked category summary;
3. **Active Offers** — compact canonical Request mini-cards;
4. **Top Providers Today** — a bounded provider summary based on backend-owned evidence;
5. **My Next Steps** — role-aware operational actions;
6. **Open Decisions** — items that require user attention;
7. **Market Movement** — a compact period trend;
8. **Quick Actions** — direct routes to primary workflows;
9. **Market Opportunities Preview** — a bounded set of evidence-backed opportunities.

The module order may recompose with available width, but its decision hierarchy must remain stable.

## 5. Active Offers mini-cards

`Active Offers` contains compact versions of the canonical public Request card, not notification rows and not a second independent request model.

Each mini-card includes:

- category;
- short request title;
- city or privacy-safe location;
- relevant time or date context;
- price or budget context when available;
- one restrained semantic signal;
- a small service image when available.

The whole mini-card opens the public Request Detail. `All Offers` routes to the Requests market collection while preserving compatible filters. The data source, identity, favorite state, and request interaction contract must remain the same as in Requests.

## 6. Preview interaction model

Each overview module is one of two types:

- **Dashboard drill-down:** opens a full presentation of that module inside the same central canvas and exposes `Back to Overview`;
- **Specialized route:** opens Requests, Providers, Statistics, Actions, or another owning section when that section provides the authoritative workflow.

The following default ownership applies:

| Preview | Default destination |
|---|---|
| Market Overview | Dashboard Market Overview drill-down |
| Demand by Category | Dashboard category drill-down or Statistics when analytical depth is requested |
| Active Offers | Public Request Detail or Requests market collection |
| Top Providers Today | Provider Detail or Providers collection |
| My Next Steps | Owning workflow identified by the action |
| Open Decisions | Action target or Actions Growth Center |
| Market Movement | Statistics |
| Market Opportunities | Statistics or relevant market collection |

Drill-down changes only the central canvas. The persistent shell and current context remain mounted.

## 7. Market Overview drill-down

The full Market Overview is an operational market state, not an analytical dashboard duplicate. It contains:

- a primary interactive market map;
- demand and provider totals;
- market balance;
- ranked regional opportunities;
- demand-versus-supply comparison by category;
- bounded market movement;
- response rate, response time, and demand trend;
- routes to Requests, Providers, and deeper Statistics analysis.

`Back to Overview` restores the previous overview state and focus. Filters remain visible and continue to govern every market module.

## 8. Responsive and shell-state rules

Layout derives from actual central-container width after shell allocation, not only from viewport width.

### 8.1 Expanded shell

- Sidebar: `232px`; AI rail: `320px`.
- Overview uses a dense two-column primary row, a three-column secondary row, and a three-column compact lower row where safe.
- Market Overview drill-down uses a large map plus one supporting column.

### 8.2 Focus mode

- Sidebar: `72px`; AI rail column removed; fixed Decision Indicator remains.
- Recovered space creates useful additional columns; cards do not stretch beyond readable bounds.
- Overview may use a four-column internal grid.
- Market Overview drill-down enlarges the map and may split supporting content into two controlled columns.

### 8.3 Large and ultrawide displays

- Internal content remains bounded by readable card maxima.
- Additional width adds columns, map area, comparison context, or visible rows; it does not create oversized empty cards.
- Additional height may increase map height or reveal one additional bounded preview row.
- The main document remains fixed-height; collection-like modules use drill-down and pagination instead of infinite vertical growth.

### 8.4 Tablet and mobile

- Tablet uses a compact shell and a one- or two-column central grid based on actual width.
- Mobile uses a single content column, compact filters, and bottom navigation where defined by the workspace standard.
- The expanded AI rail becomes an accessible overlay or sheet; its collapsed Decision Indicator must not cover controls.
- Complex map and chart modules provide accessible list or table alternatives.

## 9. AI rail context

The invariant rail structure remains:

1. Decision Panel;
2. Action Queue or Market Opportunities, according to the approved rail adapter;
3. Recommendations.

Dashboard rail content summarizes the current market and next decisions. A collapsed rail retains the current decision value, semantic ring, AI provenance, pending count where present, and expand action.

AI Violet marks system provenance only. Opportunity remains Sage, demand Info Blue, supply Sand, risk Danger, and action-required Warning/Action.

## 10. Data and integrity requirements

- Every metric declares its period and filter context.
- Rankings and opportunity signals are backend-owned.
- Missing evidence renders an explicit neutral state, never a fabricated score.
- Dashboard previews use canonical Requests and Providers contracts.
- The frontend must not independently recompute market balance, opportunity, priority, or recommendation truth.
- Empty, loading, error, partial-data, authorization, and stale-data states preserve module geometry.

## 11. Accessibility

- Preview cards and independent controls have distinct focus targets.
- Color is never the only carrier of meaning.
- Maps and charts expose textual summaries and accessible alternatives.
- Returning from drill-down restores focus to the originating preview.
- Collapsing or expanding shell tools does not lose keyboard position or active context.

## 12. Acceptance criteria

Dashboard is complete when:

- the overview fits the supported desktop viewport without document scrolling;
- every preview has clear ownership and a deterministic destination;
- `Active Offers` uses canonical Request mini-cards;
- full drill-downs replace only the central canvas;
- filters and shell state survive overview, drill-down, and specialized-section navigation;
- expanded and focus states recompose rather than preserve empty columns;
- wide and tall displays add useful density without uncontrolled stretching;
- AI rail structure remains invariant and context-aware;
- all semantic indicators follow the Decision Intelligence Language;
- production data and derived decisions remain backend-owned.

## 13. Implementation boundary

This document is an approved target contract for the preview refactor line.

The current preview branch already treats `/workspace?section=overview` as the entry route in navigation and shell tests, but the full dashboard module composition, preview drill-down routing, and final bounded central-canvas implementation are still converging.
