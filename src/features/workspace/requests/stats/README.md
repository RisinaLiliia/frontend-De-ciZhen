# Decision Dashboard Stats

This feature is the frontend shell for the workspace decision dashboard at `/workspace?section=stats`.

## Architecture

- `useDecisionDashboardModel.ts`
  - feature orchestrator
  - combines query state with UI mapping
- `useWorkspaceStatsQuery.ts`
  - fetches one aggregated dashboard payload
  - normalizes legacy payloads into the decision-dashboard contract
- `statisticsDecisionDashboard.contract.ts`
  - compatibility normalizer
  - target shape for backend-driven `decisionContext`, `filterOptions`, `sectionMeta`, and `exportMeta`
- `statisticsOpportunityContract.utils.ts`
  - compatibility layer for opportunity cluster and pricing context
  - derives `focus city + nearby competitors + per-item priceIntelligence` until backend owns it natively
- `workspaceStatisticsDecisionDashboard.schema.ts`
  - runtime validation for the normalized dashboard contract
- `useWorkspaceStatsViewModel.ts`
  - mapping layer only
  - formats labels, currency, dates, and view props
  - must not become a second analytics engine
- `workspaceStatisticsViewModel.helpers.ts`
  - barrel for pure builders used by the stats hook
  - keeps orchestration imports stable while implementation stays split by domain
- `workspaceStatisticsViewModel.activity.ts`
  - activity signals and KPI builders
- `workspaceStatisticsViewModel.market.ts`
  - city demand and opportunity radar mapping
- `workspaceStatisticsViewModel.pricing.ts`
  - pricing recommendation mapping
- `workspaceStatisticsViewModel.funnel.ts`
  - funnel stage mapping
- `WorkspaceStatisticsView.tsx`
  - presentation shell for the stats page
- `sections/*`
  - presentational modules for dashboard blocks

## Contract Rules

- backend owns analytical meaning
- frontend renders one coherent dashboard response
- if backend sends `decisionContext`, `filterOptions`, `sectionMeta`, or `exportMeta`, frontend should use them directly
- in focus mode, `opportunityRadar` is not a generic leaderboard
- rank `1` is the selected city, ranks `2..3` are comparison cities
- each opportunity item should carry its own `priceIntelligence` so price panels and KI can switch by selection without recomputing analytics in UI
- client-side derivation exists only as temporary compatibility support for older payloads

## Do Not Reintroduce

- block-specific API fetching inside section components
- frontend scoring for opportunity / pricing / AI recommendations in the main path
- local widget filters that drift away from the dashboard context
- local recalculation of city competitors or price corridors inside React components
- presentation components importing hook files for types when the shared model file is enough
