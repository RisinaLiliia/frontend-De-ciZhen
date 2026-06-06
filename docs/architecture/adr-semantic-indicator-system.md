# ADR: Semantic Indicator System

## Status
Proposed

## Context
De'ciZhen already has a mature global color-token system, badge primitives, surface primitives, and workspace visual language.

The current problem is not the absence of colors. The problem is inconsistent semantic usage: the same color can communicate different business meanings in different modules. This creates cognitive friction across Dashboard, Requests, Providers, Analytics, Decision Panel, Action Queue, Recommendations, AI Rail, and future workspace modules.

The product needs a single semantic indicator language. Colors must communicate business meaning, not component type or visual preference.

## Decision
Use the existing design-system palette and primitives. Do not introduce new colors for this initiative.

Assign stable business meaning to existing tokens and variants:

| Semantic category | Business meaning | Primary existing tokens | Preferred badge/use |
| --- | --- | --- | --- |
| Demand | Market demand, requests, customers, leads, demand signals, market activity | `--color-info`, `--color-info-soft`, `--color-info-border`, `--dc-blue` | `WorkspaceBadge variant="info"` |
| Supply | Providers, availability, provider density, market capacity, competition context | `--color-primary`, `--color-primary-soft`, `--color-primary-border` | primary icon/accent; avoid risk red |
| Opportunity | Growth, revenue potential, good market chance, conversion upside | `--color-success`, `--color-success-soft`, `--color-success-border`, `--dc-sage` | `WorkspaceBadge variant="success"` |
| Risk | Threats, lost leads, high competition risk, negative trends, low conversion | `--color-danger`, `--color-danger-soft`, `--color-danger-border`, `--dc-danger` | `WorkspaceBadge variant="risk"` or `danger` |
| AI | System-generated intelligence, recommendations, predictions, AI scores | `--color-primary` with explicit AI icon/label; neutral surface | AI icon/stamp plus primary accent |
| Action | Required user action, pending decision, follow-up, next step, attention required | `--color-warning`, `--color-warning-soft`, `--color-warning-border`, `--dc-sand` | `WorkspaceBadge variant="warning"` |
| Neutral | Supporting information, filters, dates, labels, settings, informational metrics | `--color-text-muted`, `--color-border`, `--color-surface-muted` | `WorkspaceBadge variant="neutral"` |

`WorkspaceBadge variant="opportunity"` is deprecated and removed from the workspace badge primitive because it conflicted with the established semantic language. Semantic Opportunity uses `WorkspaceBadge variant="success"`.

## Usage Rules
- Color represents meaning, not component type.
- Cards and panels remain primarily neutral surfaces.
- Use semantic badges, icons, dots, metric accents, and compact labels for meaning.
- Avoid large colored surfaces unless the state is critical and explicitly semantic.
- Do not hardcode colors in feature CSS.
- Do not create feature-local color aliases that duplicate global tokens.
- Do not reuse Risk red for Demand, Supply, or Provider metrics.
- Do not present AI output as a market fact. AI indicators must include an AI icon, label, or stamp.

## Decision Panel Rules
- Demand metrics use Demand semantics.
- Provider and availability metrics use Supply semantics.
- Opportunity metrics use Opportunity semantics.
- Risk metrics use Risk semantics.
- AI insights use AI semantics and must be visibly distinct from market facts.
- Pending actions use Action semantics.

## Action Queue Rules
Action Queue uses Action semantics as the primary language.

Severity can be layered on top:

| Severity | Semantic treatment |
| --- | --- |
| Critical | Risk |
| Important | Action |
| Informational | Neutral |

Action is not Risk. A task can require action without representing a negative trend.

## Recommendation Rules
Recommendations inherit semantic meaning from the recommendation itself:

| Recommendation meaning | Semantic treatment |
| --- | --- |
| High Demand | Demand |
| Top Providers / Availability | Supply |
| Growth Opportunity | Opportunity |
| Risk Warning | Risk |
| AI Recommendation | AI |
| Action Required | Action |

## Market And Analytics Rules
- Activity from requests/customers uses Demand.
- Provider activity, availability, and provider density use Supply.
- Price upside, conversion improvement, and chance scores use Opportunity.
- Negative market movement, unanswered demand, lost leads, and weak conversion use Risk.
- Signals that require attention but are not negative use Action.
- Price values use the existing price token (`--color-price-text`) only for monetary value emphasis, not as a semantic status color.

## Current Primitive Audit
Existing global primitives to reuse:

| Primitive | Current role |
| --- | --- |
| `--color-info` / `--dc-blue` | Demand indicators and informational blue accents |
| `--color-primary` / `--dc-primary` | Primary product/action accent and AI identity accent |
| `--color-success` / `--dc-sage` | Opportunity, healthy state, positive outcome |
| `--color-warning` / `--dc-sand` | Action required, caution, pending decision, signal |
| `--color-danger` / `--dc-danger` | Risk, negative state, lost/critical issue |
| `WorkspaceBadge` | Canonical badge primitive for workspace semantic labels |
| `workspaceSurfaceShell` primitives | Canonical neutral surfaces for cards, panels, rails |

## Prohibited Usages
- Red must not represent Demand or Supply.
- Green must not represent generic decoration.
- Blue must not randomly switch between Demand, AI, and Opportunity without explicit semantic labeling.
- AI recommendations must not use the same naked dot or metric accent as market facts.
- Feature CSS must not define new hardcoded semantic colors.
- A component must not redefine a semantic color locally because it looks better in that context.

## Future Extension Rules
- New semantic concepts must first be documented in this ADR or a follow-up ADR.
- If a new semantic concept needs a visual treatment, prefer icon, label, shape, or tone before adding a new color.
- If an existing badge variant name conflicts with business meaning, refactor the primitive mapping rather than adding a duplicate feature-specific class.
- Semantic indicator changes must include a UI audit entry for affected components.

## Follow-up Audit Template
Use this table for the next "Semantic Indicator Audit" pass:

| Component | Current token / variant | Current meaning | Target semantic category | Action |
| --- | --- | --- | --- | --- |
| Request KPI | `info` / blue | Demand | Demand | Keep |
| Provider KPI | primary/supply accent | Supply | Supply | Verify |
| Opportunity badge | `success` / sage | Opportunity | Opportunity | Keep |
| Risk alert | `risk` / danger | Risk | Risk | Keep |
| AI recommendation | primary + AI label | AI | AI | Verify AI label/icon |
| Action queue item | `warning` / sand | Action | Action | Keep |

## Acceptance Criteria
- A user can recognize the same business concept from the same semantic indicator across product areas.
- No screen redefines the meaning of an existing semantic indicator.
- All semantic colors come from existing design-system tokens.
- All semantic badges use shared primitives.
- Feature CSS contains layout and component-specific structure only, not new hardcoded semantic colors.
- Violations are treated as design-system debt and captured in the audit table.

## Consequences
### Positive
- The platform gains a unified Decision Intelligence Language.
- Users can scan across modules faster.
- Existing visual tokens become more meaningful without redesigning the palette.
- Future modules have clear rules for indicators, badges, rails, and recommendations.

### Trade-offs
- Some existing components may need follow-up refactors where old color usage conflicts with semantic meaning.
- Domain models may still use `opportunity` as a business concept or rail tone, but conversion to badge color must resolve to `success`.
