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
| Supply | primary/provider accent |
| Opportunity | `success` / green |
| Risk | `risk` or `danger` / red |
| AI | primary accent + explicit AI label/icon |
| Action | `warning` / sand |
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
| Decision Panel metric icon `requests` | chart tone currently index-based | Demand/request metric | Demand | Follow-up: move donut tones to semantic keys instead of index order |
| Decision Panel metric icon `providers` | chart tone currently index-based | Supply/provider metric | Supply | Follow-up: move donut tones to semantic keys instead of index order |
| Workspace activity chart requests | blue/info activity tone | Demand | Demand | Keep |
| Workspace activity chart offers | warning/sand activity tone | Action / pending offer activity | Action | Keep |
| City signal high | `success` | Strong market chance | Opportunity | Keep |
| City signal medium | `info` | Informational city signal | Neutral or Demand | Follow-up: decide if medium means Demand or Neutral |

## Changes In This PR
- `statisticsRail.mapper.ts`: map Market Opportunity `action` items to `warning` instead of `info`.

## Follow-up Work
1. Replace index-based Decision Panel donut color assignment with semantic-key assignment.
2. Audit `WorkspaceDecisionPanel` recommendation tones:
   - `focus` uses domain tone `opportunity`
   - `in-progress` uses domain tone `opportunity`
   - verify whether each should remain Opportunity or become Supply/Action.
3. Split generic `signal` into explicit `action`, `risk`, `demand`, or `neutral` when backend can provide stronger semantic metadata.
4. Add a test around `mapOpportunityBadgeVariant` to prevent `action -> info` regressions.

## Acceptance Criteria For This Pass
- No workspace badge uses deprecated `variant="opportunity"`.
- Market chance badges resolve to `success`.
- Required action badges resolve to `warning`.
- Risk badges resolve to `risk`.
- No hardcoded colors are introduced.
