# Decision Dashboard Stats

This feature is the frontend shell for the workspace decision dashboard at `/workspace?section=stats`.

## Architecture

- `useDecisionDashboardModel.ts`
  - feature orchestrator
  - combines query state with UI mapping
- `useWorkspaceStatsQuery.ts`
  - fetches one aggregated dashboard payload
  - validates the backend dashboard payload
- `statisticsDecisionDashboard.contract.ts`
  - shared stats contract type for the validated dashboard payload
- `workspaceStatisticsDecisionDashboard.schema.ts`
  - runtime validation for the backend dashboard contract
- `useWorkspaceStatsViewModel.ts`
  - mapping layer only
  - formats labels, currency, dates, and view props
  - must not become a second analytics engine
- `statisticsViewModel.index.ts`
  - barrel for pure builders used by the stats hook
  - keeps orchestration imports stable while implementation stays split by domain
- `statisticsViewModel.activity.ts`
  - activity signals and KPI builders
- `statisticsViewModel.market.ts`
  - city demand and opportunity radar mapping
- `statisticsViewModel.pricing.ts`
  - pricing recommendation mapping
- `statisticsViewModel.funnel.ts`
  - funnel stage mapping
- `statisticsViewModel.user.ts`
  - personalized `user vs market` mapping
  - resolves position, risks, opportunities, pricing gap, and action steps from backend-shaped `userIntelligence`
- `statisticsViewModel.user.ts`
  - temporary compatibility builder for legacy personalized payloads
  - kept only as a transitional utility while old payloads are removed from the codebase
  - main stats normalization path must not depend on these builders once backend ships canonical sections
- `StatisticsView.tsx`
  - presentation shell for the stats page
- `sections/*`
  - presentational modules for dashboard blocks

## Contract Rules

- backend owns analytical meaning
- frontend renders one coherent dashboard response
- if backend sends `decisionContext`, `filterOptions`, `sectionMeta`, or `exportMeta`, frontend should use them directly
- if backend sends `decisionLayer`, frontend should treat it as the canonical first section for authenticated stats
- if backend sends `personalizedPricing`, frontend should treat it as the canonical personalized pricing section
- if backend sends `categoryFit` or `cityComparison`, frontend should treat them as the canonical personalized market-fit sections
- if backend sends `risks`, `opportunities`, or `nextSteps`, frontend should treat them as the canonical right-rail recommendation sections
- if backend sends `userIntelligence`, frontend should render it directly for authenticated users
- if backend sends section-level personalized payloads such as `funnelComparison`, frontend should render them directly and avoid rebuilding the section meaning in React
- `decisionLayer` is the canonical KPI comparison section for authenticated stats
- `decisionLayer.metrics` should already contain `market + user + gap + status + action`
- `decisionLayer.primaryInsight` and `decisionLayer.primaryAction` should drive the top recommendation surface instead of legacy market-only summaries
- `personalizedPricing` is the canonical pricing section for authenticated stats
- `categoryFit` is the canonical category-market-fit section for authenticated stats
- `cityComparison` is the canonical city-fit section for authenticated stats
- `risks`, `opportunities`, and `nextSteps` are the canonical recommendation sections for the authenticated right rail
- the personalized top KI/decision plan should prefer canonical `risks`, `opportunities`, `nextSteps`, and `personalizedPricing` sections over direct `userIntelligence` derivation
- `activityComparison` is the canonical authenticated overlay contract for `Aktivität der Plattform`; frontend should prefer it over client-side overlay reconstruction
- when `activityComparison` is present, personalized chart header/meta (`title`, `subtitle`, `summary`, `peakTimestamp`, `bestWindowTimestamp`, `updatedAt`) must also come from this section instead of mixed `activity.totals` / top-level `updatedAt`
- `userIntelligence.formulaMetrics` is the canonical KPI formula layer for authenticated stats
- `userIntelligence.signals` is the canonical rule-engine output for risks, opportunities, performance, and growth
- `funnelComparison` is the canonical profile-funnel comparison layer for authenticated stats
- when `funnelComparison` exists, frontend should not backfill its summary or drop-off diagnosis from `userIntelligence.profileGap` or legacy `profileFunnel`
- in personalized mode, funnel summary and conversion should prefer canonical `funnelComparison.stages` over legacy `profileFunnel.summaryText` or `profileFunnel.totalConversionPercent`
- in personalized mode, the funnel shape itself should also prefer canonical `funnelComparison.stages`; `profileFunnel.stages` should remain a compatibility fallback only
- when `userIntelligence` is missing, compatibility fallback may still exist outside the main normalized dashboard path, but production normalization should prefer backend sections without rebuilding their semantics in React
- in focus mode, `opportunityRadar` is not a generic leaderboard
- rank `1` is the selected city, ranks `2..3` are comparison cities
- each opportunity item should carry its own `priceIntelligence` so price panels and KI can switch by selection without recomputing analytics in UI
- personalized mode is now `Market × User = Decision Engine`
- authenticated stats should answer: market, user, gap, action
- production stats query path must not client-build `decisionContext`, `filterOptions`, `sectionMeta`, `exportMeta`, `opportunityRadar`, `priceIntelligence`, `decisionLayer`, `personalizedPricing`, `categoryFit`, `cityComparison`, `funnelComparison`, or `userIntelligence`
- any UI fallback that still exists belongs in render/view-model code, not in the fetch/contract layer

## Do Not Reintroduce

- block-specific API fetching inside section components
- frontend scoring for opportunity / pricing / AI recommendations in the main path
- frontend-only user benchmarking logic inside presentational sections
- local widget filters that drift away from the dashboard context
- local recalculation of city competitors or price corridors inside React components
- presentation components importing hook files for types when the shared model file is enough
