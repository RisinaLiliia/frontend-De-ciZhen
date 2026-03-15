# Decision Dashboard Backend Handoff

This repository does not contain the production backend service for `/workspace/statistics`.
The frontend is now prepared for a backend-driven decision dashboard contract and expects the server to become the analytical source of truth.

## Required Server Behavior

The endpoint must aggregate the whole stats page from one shared context:

- `range`: `24h | 7d | 30d | 90d`
- `cityId`: optional
- `regionId`: optional
- `categoryKey`: optional

Every section must be computed from the same filter context and time window.

## Required Response Blocks

- `decisionContext`
- `filterOptions`
- `sectionMeta`
- `summary`
- `kpis`
- `activity`
- `demand`
- `opportunityRadar`
- `priceIntelligence`
- `profileFunnel`
- `insights`
- `growthCards`
- `exportMeta`

## What Backend Must Own

Backend must compute:

- focus/global mode
- selected filter labels
- low-data decision
- health summary (`demand / competition / activity`)
- opportunity ranking and scores
- price corridor, confidence, and recommendation
- AI / rule-based recommendations
- growth actions and recommended scope
- context-aware section titles and subtitles
- export filename if export conventions are product-controlled

Frontend should only:

- fetch the aggregated response
- validate and normalize it at the boundary
- format numbers, dates, currency, and render UI

## Current Temporary Compatibility Layer

Until backend returns the full contract, frontend still contains a compatibility normalizer:

- [statisticsDecisionDashboard.contract.ts](/Users/liliya/Desktop/frontend-de-cizhen/src/features/workspace/requests/stats/statisticsDecisionDashboard.contract.ts)

This file should become removable after backend rollout.

## Backend Acceptance Criteria

1. `decisionContext` is always present and reflects the exact selected context.
2. `filterOptions` are returned explicitly and do not depend on frontend inference.
3. `sectionMeta` is returned for context-sensitive headings where product wording matters.
4. `priceIntelligence` is either fully reliable or explicitly low-confidence; no pseudo-analytics.
5. `insights` and `growthCards` are already scoped to the chosen context.
6. No frontend scoring or ranking is required to render primary dashboard sections.
7. Response is compatible with:
   - [workspace-statistics-decision-dashboard.openapi.yaml](/Users/liliya/Desktop/frontend-de-cizhen/docs/openapi/workspace-statistics-decision-dashboard.openapi.yaml)
   - [workspace.ts](/Users/liliya/Desktop/frontend-de-cizhen/src/lib/api/dto/workspace.ts)

## Frontend Integration Check

Frontend query layer validates the normalized response through:

- [workspaceStatisticsDecisionDashboard.schema.ts](/Users/liliya/Desktop/frontend-de-cizhen/src/features/workspace/requests/stats/workspaceStatisticsDecisionDashboard.schema.ts)

If backend adds new required fields, update:

1. DTO in `src/lib/api/dto/workspace.ts`
2. OpenAPI doc in `docs/openapi/...`
3. runtime schema in `workspaceStatisticsDecisionDashboard.schema.ts`
4. focused tests in `src/features/workspace/requests/stats/*.test.ts`
