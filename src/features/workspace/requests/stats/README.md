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
  - target shape for backend-driven `decisionContext`, `filterOptions`, `sectionMeta`, `exportMeta`, and personalized section payloads
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
- `workspaceStatisticsViewModel.user.ts`
  - personalized `user vs market` mapping
  - resolves position, risks, opportunities, pricing gap, and action steps from backend-shaped `userIntelligence`
- `statisticsUserIntelligence.utils.ts`
  - temporary compatibility builder for legacy personalized payloads
  - derives formula metrics, benchmark gaps, canonical `decisionLayer`, decision signals, and prioritized actions from one dashboard payload
  - now reuses canonical `personalizedPricing`, `risks`, `opportunities`, and `nextSteps` when backend already sends them
  - must disappear once backend ships `userIntelligence` natively
- `WorkspaceStatisticsView.tsx`
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
- when `userIntelligence` is missing, compatibility fallback may still exist, but it should preferentially reuse canonical section payloads instead of re-deriving semantics from raw payload fields
- in focus mode, `opportunityRadar` is not a generic leaderboard
- rank `1` is the selected city, ranks `2..3` are comparison cities
- each opportunity item should carry its own `priceIntelligence` so price panels and KI can switch by selection without recomputing analytics in UI
- personalized mode is now `Market × User = Decision Engine`
- authenticated stats should answer: market, user, gap, action
- client-side derivation exists only as temporary compatibility support for older payloads
- any client-side derivation for `decisionLayer` is temporary compatibility only
- any client-side derivation for `personalizedPricing`, `categoryFit`, or `cityComparison` is temporary compatibility only
- any client-side derivation for `userIntelligence` is temporary compatibility only
- remaining transitional builders are `buildCompatibilityUserIntelligence` and `buildCompatibilityFunnelComparison`
- the third activity line for authenticated stats is currently a temporary context-aligned compatibility overlay
- it is derived from personalized totals under the current market timeline until backend ships `activity.userSeries`

## Do Not Reintroduce

- block-specific API fetching inside section components
- frontend scoring for opportunity / pricing / AI recommendations in the main path
- frontend-only user benchmarking logic inside presentational sections
- local widget filters that drift away from the dashboard context
- local recalculation of city competitors or price corridors inside React components
- presentation components importing hook files for types when the shared model file is enough
