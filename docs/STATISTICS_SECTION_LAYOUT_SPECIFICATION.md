# De'ciZhen Statistics Section Specification

## Document Status

- Status: Approved target contract
- Version: 1.0
- Last updated: 2026-07-19
- Canonical route: `/workspace?section=stats`
- Legacy alias: `statistics -> stats`
- Owner: Workspace / Statistics

All statistics route state, including `range`, `view`, and shared role-context parameters, is governed by the workspace query-parameter registry in `DECIZHEN_PROJECT_SPECIFICATION.md`.

Frontend delivery sequencing, cleanup, and completion gates for this section are governed by `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`.

## 1. Purpose

Statistics is the decision dashboard for market and profile performance. Its default screen provides a concise overview of all analytical areas in one working viewport. Selecting a summary card opens that area across the central canvas without replacing the workspace shell.

The section answers three questions:

1. What is happening in the selected market context?
2. How is the user's activity performing against that context?
3. Which evidence supports the next decision?

Statistics reports evidence and comparisons. Recommended execution belongs to Actions, and profile editing belongs to Profile.

## 2. Approved Visual References

| State | Reference |
| --- | --- |
| Sidebar and AI rail expanded | [`decizhen-statistics-overview-expanded-v1.png`](assets/workspace/statistics/decizhen-statistics-overview-expanded-v1.png) |
| Sidebar collapsed | [`decizhen-statistics-overview-sidebar-collapsed-v1.png`](assets/workspace/statistics/decizhen-statistics-overview-sidebar-collapsed-v1.png) |
| AI rail collapsed | [`decizhen-statistics-overview-ai-collapsed-v1.png`](assets/workspace/statistics/decizhen-statistics-overview-ai-collapsed-v1.png) |
| Both shell tools collapsed | [`decizhen-statistics-overview-focus-v1.png`](assets/workspace/statistics/decizhen-statistics-overview-focus-v1.png) |
| Mobile overview | [`decizhen-statistics-overview-mobile-v1.png`](assets/workspace/statistics/decizhen-statistics-overview-mobile-v1.png) |
| Market Health detail | [`decizhen-statistics-market-health-detail-v1.png`](assets/workspace/statistics/decizhen-statistics-market-health-detail-v1.png) |
| Profile Performance detail | [`decizhen-statistics-profile-performance-detail-v1.png`](assets/workspace/statistics/decizhen-statistics-profile-performance-detail-v1.png) |
| Demand by Category detail | [`decizhen-statistics-demand-categories-detail-v1.png`](assets/workspace/statistics/decizhen-statistics-demand-categories-detail-v1.png) |
| Platform Activity detail | [`decizhen-statistics-platform-activity-detail-v1.png`](assets/workspace/statistics/decizhen-statistics-platform-activity-detail-v1.png) |
| Opportunity Radar detail | [`decizhen-statistics-opportunity-radar-detail-v1.png`](assets/workspace/statistics/decizhen-statistics-opportunity-radar-detail-v1.png) |
| Cities & Regions detail | [`decizhen-statistics-cities-regions-detail-v1.png`](assets/workspace/statistics/decizhen-statistics-cities-regions-detail-v1.png) |
| Market Price Radar detail | [`decizhen-statistics-market-price-detail-v1.png`](assets/workspace/statistics/decizhen-statistics-market-price-detail-v1.png) |

The references are normative for composition, hierarchy, shell behavior, and semantic use of the existing project tokens. Production values and conclusions remain backend-owned.

## 3. Section Structure

### 3.1 Role context

The section preserves two role contexts:

- `Für Anbieter` — demand, competition, price, conversion, and provider performance;
- `Für Auftraggeber` — supply, response quality, price context, and customer workflow performance.

The selected role must be URL-addressable and must not be inferred only from presentation state.

### 3.2 Shared control bar

The persistent control row contains city or region, category, service, range, and reset. All overview cards, details, the Decision Panel, and AI recommendations use the same resolved filter context. Opening or closing shell tools must preserve it.

### 3.3 Overview cards

The canonical overview contains seven numbered areas:

1. Market Health;
2. Profile Performance;
3. Demand by Category;
4. Platform Activity;
5. Opportunity Radar;
6. Market Price Radar;
7. Cities & Regions.

Every summary card includes a title, a short purpose statement, enough evidence for comparison, and one `Open` action. Summary cards are not miniature full dashboards and must not duplicate the AI rail.

## 4. Detail Navigation

Selecting a summary opens a focused detail in the central canvas while retaining:

- the workspace top bar;
- the current sidebar state;
- the current AI rail state;
- role and filter context;
- a clear route back to the Statistics overview.

Canonical detail routing uses `section=stats&view=<typed-view>` as defined by the shared query-parameter registry. Browser back and forward navigation must restore the same view and filters.

## 5. Shell and Responsive Contract

The section follows `WORKSPACE_LAYOUT_STANDARD.md`.

| Sidebar | AI rail | Central canvas |
| --- | --- | --- |
| Expanded | Expanded | Uses the remaining fixed-shell width |
| Collapsed | Expanded | Consumes the released sidebar width |
| Expanded | Collapsed | Consumes the released rail width; Decision Indicator overlays content |
| Collapsed | Collapsed | Uses all available width; Decision Indicator remains an overlay |

The compact Decision Indicator is the same shared component used by every workspace section. It reserves zero grid width and must never produce an empty right column.

Grid decisions should use central-canvas width, preferably through container queries:

- wide desktop: up to four analytical cards in the first row;
- standard desktop: three primary cards plus a balanced second row;
- compact desktop or tablet: two columns where readable;
- mobile: one primary card at a time with ordered navigation between all seven areas.

Cards use bounded content widths and reorganize into additional columns or rows rather than stretching charts and labels into empty space. Height does not force card stretching; the central canvas owns section scrolling where required.

## 6. Detail Requirements

### Market Health

Shows operational rates, trends, definitions, data freshness, strengths, and conditions requiring attention. Every rate exposes its denominator or methodology.

### Profile Performance

Shows the lifecycle funnel from requests through completed work, market comparison, the largest evidence-backed bottleneck, trend, profile impact, and the next legitimate action.

### Demand by Category

Shows ranked categories, demand, change, available supply, fit, trend, geography, and evidence context. Ranking and fit are backend-derived.

### Platform Activity

Shows request and offer movement over time, comparison period, weekly rhythm, data quality, and the events included in the selected scope.

### Opportunity Radar

Shows opportunity dimensions, comparable regions or categories, score methodology, evidence period, and the route to act. Opportunity is a market conclusion, not an AI provenance color.

### Cities & Regions

Shows comparable regional demand, supply, balance, change, and detail context. Tables remain the accessible source of the plotted comparison.

### Market Price Radar

Shows the recommended range, market average, the user's position where available, sample size, confidence, period, methodology, and comparable cities or services.

## 7. Data and Ownership Rules

- The backend computes totals, rates, rankings, scores, ranges, comparisons, confidence, priorities, and data-quality states.
- The frontend validates the statistics payload at the boundary and renders it.
- Missing evidence renders an explicit unavailable or insufficient-data state; it is never replaced with a fabricated zero.
- Filter changes must request or select a coherent statistics snapshot rather than recompute business semantics independently in each card.
- The overview and detail views must derive from the same canonical snapshot and identifiers.
- AI recommendations are explicitly marked as system interpretation and remain distinct from market facts.

## 8. Semantic and Visual Rules

The section uses existing project tokens only:

- Info / muted blue for demand;
- Warning / sand for supply and market capacity;
- Success / sage for opportunity and positive outcome;
- Danger for substantiated risk;
- AI accent only for AI provenance;
- Warning / action for tasks requiring user action;
- neutral surfaces for controls, dates, labels, and passive values.

Semantic color is used in compact indicators, chart series, and status markers. Cards remain predominantly neutral. Meaning must also be available through text, icons, or patterns.

## 9. Accessibility and Validation

- Charts require accessible labels and a table or textual equivalent.
- Keyboard users can reach every filter, card, drill-down, and return action.
- Focus is restored predictably after opening or closing a detail.
- Dynamic updates are announced without moving focus unexpectedly.
- Numeric formatting follows locale and unit rules.
- Reduced-motion preferences are respected.
- Automated coverage includes route state, filters, loading, empty, error, insufficient-data, shell combinations, and all seven details.
- Manual QA covers wide desktop, standard desktop, tablet, and mobile with both shell tools expanded and collapsed where applicable.

## 10. Acceptance Criteria

The section is complete when:

1. the overview exposes all seven analytical areas without becoming an unbounded page;
2. every card opens a full central-canvas detail and browser navigation restores state;
3. collapsing either shell tool releases real layout width;
4. the shared compact Decision Indicator overlays the canvas when the AI rail is closed;
5. all views use one canonical statistics contract and filter context;
6. no frontend component reconstructs backend business metrics;
7. the implementation matches the approved palette, semantic language, density, and visual references;
8. responsive and accessibility validation passes.

## 11. Implementation boundary

This document is an approved target contract for the preview refactor line.

The backend statistics endpoint and canonical section contract already exist on the current branch. Remaining work is frontend convergence to the approved detail-routing model, broader state/error/insufficient-data coverage, and final UI polish against the approved visual references.
