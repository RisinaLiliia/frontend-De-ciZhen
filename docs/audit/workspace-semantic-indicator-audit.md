# Workspace Semantic Indicator Audit

## Scope
This audit follows `docs/architecture/adr-semantic-indicator-system.md`.

The goal is to verify places where color, badge variant, dot tone, or metric accent communicates business meaning inside Workspace.

This pass focuses on:

- Dashboard / Overview rail
- Requests Decision Panel
- Statistics Decision Panel
- Market Opportunities / Action Queue
- Recommendations / AI Rail
- Shared Workspace badge and rail primitives

## Semantic Baseline
| Semantic category | Expected primitive |
| --- | --- |
| Demand | `info` / blue |
| Supply | warning/sand provider accent |
| Opportunity | `success` / green |
| Risk | `risk` or `danger` / red |
| AI | primary accent + explicit AI label/icon |
| Action | `warning` / orange action treatment |
| Neutral | `neutral` / muted |

## Findings
| Component | Current token / variant | Current meaning | Target semantic category | Action |
| --- | --- | --- | --- | --- |
| `WorkspaceBadge` primitive | removed `opportunity` variant | Legacy opportunity badge mapped to blue/info | Opportunity | Fixed in previous PR: Opportunity uses `success` |
| Guest request status badge | `success` | Market opportunity / request chance | Opportunity | Keep |
| Provider fast reply badge | `success` | Fast provider response creates opportunity | Opportunity | Keep |
| Provider legacy badge boundary | normalizes legacy `opportunity` to `success` | API/adapter compatibility | Opportunity | Keep |
| Overview Market Opportunities rail | `priorityBadgeVariant: success` | Market chance | Opportunity | Keep |
| Stats Market Opportunities rail, chance | `success` | Market chance | Opportunity | Keep |
| Stats Market Opportunities rail, risk | `risk` | Risk signal | Risk | Keep |
| Stats Market Opportunities rail, action | `warning` | Required action | Action | Fixed in this PR |
| Stats Market Opportunities rail, signal | `warning` | Attention signal | Action | Keep until signals are split into Action vs Neutral |
| Stats recommendations, risk group | `risk` | Risk recommendation | Risk | Keep |
| Stats recommendations, opportunity group | `success` | Opportunity recommendation | Opportunity | Keep |
| Unified Rail recommendation tone `positive` | maps to `success` | Positive / opportunity-like recommendation | Opportunity | Keep |
| Unified Rail recommendation tone `attention` | maps to `warning` | Attention / user action | Action | Keep |
| Unified Rail recommendation tone `opportunity` | maps to `success` | Domain opportunity tone | Opportunity | Keep |
| Decision Panel metric icon `requests` | semantic `demand` tone | Demand/request metric | Demand | Fixed in this PR |
| Decision Panel metric icon `providers` | semantic `supply` tone using warning/sand | Supply/provider metric | Supply | Fixed in this PR |
| Decision Panel metric icon `completed` | semantic `opportunity` tone | Completion / positive outcome | Opportunity | Fixed in this PR |
| Decision Panel metric icon `response time` | semantic `action` tone | Required attention / response timing | Action | Fixed in this PR |
| Workspace activity chart requests | blue/info activity tone | Demand | Demand | Keep |
| Workspace activity chart offers | warning/sand supply tone | Provider/offer activity | Supply | Keep |
| City signal high | `success` | Strong market chance | Opportunity | Keep |
| City signal medium | `info` | Informational city signal | Neutral or Demand | Follow-up: decide if medium means Demand or Neutral |

## Changes In This PR
- `WorkspaceUnifiedRail`: render Decision Panel donut and metric dots from semantic metric tones instead of metric index order.
- `WorkspaceUnifiedRail`: keep Attention recommendation indicators on Action semantics, not Risk.
- `statisticsRail.mapper.ts`: emit semantic metric tones (`demand`, `supply`, `opportunity`, `risk`, `action`) for rail metrics.
- `WorkspaceDecisionPanel`: tag request/provider/completed metrics with explicit semantic tones.
- `useWorkspaceOverviewRail`: tag overview Decision Panel metrics with explicit semantic tones.
- `statisticsRail.mapper.ts`: map Market Opportunity `action` items to `warning` instead of `info`.

## Follow-up Work
1. Audit `WorkspaceDecisionPanel` recommendation tones:
   - `focus` uses domain tone `opportunity`
   - `in-progress` uses domain tone `opportunity`
   - verify whether each should remain Opportunity or become Supply/Action.
2. Split generic `signal` into explicit `action`, `risk`, `demand`, or `neutral` when backend can provide stronger semantic metadata.
3. Add a test around `mapOpportunityBadgeVariant` to prevent `action -> info` regressions.

## Acceptance Criteria For This Pass
- No workspace badge uses deprecated `variant="opportunity"`.
- Market chance badges resolve to `success`.
- Required action badges resolve to `warning`.
- Risk badges resolve to `risk`.
- Decision Panel chart segments and metric dots resolve from semantic metric tones, not array index.
- No hardcoded colors are introduced.
