# De'ciZhen Workspace Frontend Audit Template

**Document status:** Supporting execution template  
**Date:** 2026-07-25  
**Primary sources:** `DECIZHEN_PROJECT_SPECIFICATION.md`, `WORKSPACE_LAYOUT_STANDARD.md`, the owning section specification, `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`

## Purpose

This document is the working template for the next practical frontend task:

- audit the current workspace implementation against the canonical docs-pack;
- classify each area as `already compliant`, `partially compliant`, `missing`, `legacy`, or `conflict`;
- produce a concrete implementation queue before additional section work continues.

This file does not replace the canonical specification.
It turns the approved requirements into a reviewable execution artifact.

## Classification model

Use exactly one primary verdict per audited item:

| Verdict | Meaning |
|---|---|
| `already compliant` | behavior, ownership, and presentation materially match the approved contract |
| `partially compliant` | the core direction is correct, but important contract, state, responsive, or cleanup gaps remain |
| `missing` | the approved behavior or structure is not implemented yet |
| `legacy` | transitional behavior still exists for compatibility and must be tracked with an explicit removal path |
| `conflict` | current implementation or documentation contradicts the canonical rules and requires explicit resolution |

## Required audit inputs

Read in this order:

1. `DECIZHEN_PROJECT_SPECIFICATION.md`
2. `WORKSPACE_LAYOUT_STANDARD.md`
3. the owning section specification
4. `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`
5. `WORKSPACE_VISUAL_REFERENCE_INDEX.md`
6. relevant ADRs

## Required audit dimensions

Every audited area should be checked for:

- route and query behavior;
- section ownership and shell integration;
- shared primitive usage;
- token, typography, and spacing alignment;
- loading, empty, error, partial, and permission states;
- responsive behavior at desktop, tablet, and mobile breakpoints;
- AI rail contract usage where applicable;
- backend ownership vs frontend-owned semantics;
- accessibility and keyboard behavior;
- dead code, duplicate code, and compatibility residue;
- documentation drift.

## Summary matrix

Use this table for the high-level cross-workspace summary.

| Area | Verdict | Current state | Code evidence | Main gap | Action | Priority | Linked PR |
|---|---|---|---|---|---|---|---|
| Documentation consolidation | `already compliant` | canonical docs-pack, priority order, and execution guide are present | `docs/README.md`, `docs/DECIZHEN_PROJECT_SPECIFICATION.md`, `docs/WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md` | audit results were not yet written back into this template | `keep` | `P3` | `PR-00` |
| Routes and section registry | `conflict` | route truth is split and section normalization still contains product-level contradictions | `src/features/workspace/navigation/resolveActiveWorkspaceSection.ts`, `workspaceSection.contract.ts`, `workspaceNavigation.config.ts` | `actions` resolves to `profile`; `overview` is special-cased outside the public section union; one canonical registry is missing | `replace` | `P0` | `PR-01` |
| Design tokens and semantic colors | `partially compliant` | workspace tokens, surfaces, shadows, radius, and shell geometry exist | `src/styles/tokens.css`, `src/styles/tokens/radius.css`, `src/styles/tokens/shadows.css` | compatibility aliases remain broad; AI token family required by the layout standard is not expressed as a clean canonical family | `refactor` | `P1` | `PR-04` |
| Typography scale | `partially compliant` | a shared type scale exists and is used in parts of the workspace | `src/styles/themes-tokens-scale.css`, `src/styles/tokens.css` | sections still mix legacy text hierarchies and local classes instead of one fully canonical typography system | `refactor` | `P1` | `PR-05` |
| Shared UI primitives | `partially compliant` | core workspace primitives already exist for button, badge, filters, pagination, surfaces, and unified rail | `src/features/workspace/shared/index.ts`, `WorkspaceButton.tsx`, `WorkspaceBadge.tsx`, `WorkspaceFilterBar.tsx`, `WorkspacePaginatedPanel.tsx` | canonical primitives for `Card`, `Skeleton`, `EmptyState`, `ErrorState`, `Modal`, `Drawer`, and `DetailHeader` are still incomplete or section-specific | `refactor` | `P1` | `PR-06`, `PR-07` |
| Workspace shell | `partially compliant` | one workspace shell, sidebar, top bar, frame, and contextual layout exist | `src/features/workspace/shell/WorkspaceShell.tsx`, `WorkspacePageLayout.tsx`, `WorkspaceSidebar.tsx`, `src/styles/features/workspace/workspace-layout.css` | full canonical shell state model is incomplete: collapsed rail, focus mode, persisted preferences, and explicit Decision Indicator behavior are not yet systematized | `refactor` | `P1` | `PR-08` |
| Unified AI rail | `partially compliant` | a shared rail model and renderer already exist | `src/features/workspace/shared/workspaceUnifiedRail.model.ts`, `WorkspaceUnifiedRail.tsx` | multiple sections still use section-specific rail implementations or `railPolicy: none` instead of one canonical contract path | `refactor` | `P1` | `PR-09` |
| Dashboard / Overview | `partially compliant` | overview section exists and already uses workspace-oriented presentation | `src/features/workspace/overview/WorkspaceOverviewMain.tsx`, `useWorkspaceOverviewRail.tsx` | it still needs to become the first fully canonical consumer of the stabilized shell, primitives, and unified rail | `refactor` | `P2` | `PR-10` |
| Requests | `partially compliant` | requests remain the strongest implemented workspace flow and already use many canonical primitives | `src/features/workspace/requests/*`, `src/components/requests/*`, `src/features/workspace/market/*` | requests still leak historical ownership into shell/state/overlay layers and continue to anchor some shared behavior | `refactor` | `P2` | `PR-11`, `PR-12` |
| Providers | `partially compliant` | providers are materially converged onto workspace-owned surfaces | `src/features/workspace/providers/*`, `src/components/providers/*` | provider collection/detail still need final consistency cleanup around rails, comparison, and shared detail patterns | `refactor` | `P2` | `PR-13` |
| Statistics | `partially compliant` | backend-driven statistics contract and major frontend foundation already exist | `src/features/workspace/stats/*`, `src/lib/api/workspace.ts`, `src/lib/api/dto/workspace.ts` | final detail-routing, state coverage, and full alignment with the approved statistics section spec remain open | `refactor` | `P2` | `PR-14` |
| Actions | `missing` | an actions model exists, but not a real canonical Actions section | `src/features/workspace/actions/workspaceActions.model.ts`, `resolveActiveWorkspaceSection.ts` | `section=actions` is not implemented as a first-class section and is still normalized away from its approved target contract | `replace` | `P0` | `PR-15` |
| Profile | `conflict` | profile route exists, but the main surface is still onboarding-led | `src/features/workspace/profile/WorkspaceProfileSection.tsx`, `src/features/workspace/requests/components/WorkspaceProfileTabPanel.tsx` | approved management-center profile overview is not the primary implementation; onboarding still owns the route | `replace` | `P0` | `PR-16`, `PR-17` |
| Chat | `partially compliant` | chat already exists as a workspace feature with request/business context support | `src/features/workspace/chat/ChatWorkspacePage.tsx`, `chat/model/chat.model.ts` | list/detail and mobile navigation still need final canonical shell and rail alignment | `refactor` | `P2` | `PR-18` |
| Reviews | `partially compliant` | reviews are converged architecturally and use workspace-owned sections | `src/features/workspace/reviews/*`, `src/components/reviews/*` | review UI still carries public-profile/request-era styling and component patterns | `refactor` | `P2` | `PR-19` |
| Settings / Help / legal surfaces | `partially compliant` | routes and shell-owned pages exist for settings/help/legal | `src/features/workspace/profile/WorkspaceSettingsPage.tsx`, `src/features/workspace/help/*`, `src/features/workspace/legal/*` | settings are not yet a full overview/detail management surface; help/legal still need final shared type and width consistency | `refactor` | `P2` | `PR-20` |
| Legacy cleanup readiness | `legacy` | compatibility layers and wrappers still intentionally exist | `src/features/workspace/shell/useWorkspaceShellLegacyRouting.tsx`, `src/features/workspace/state/workspaceRequestsScope.model.ts`, request-side wrapper surfaces | cleanup cannot happen safely until canonical replacements are fully live section by section | `remove` | `P3` | `PR-21`, `PR-22` |

## Detailed audit table

Use one row per concrete area, route, or implementation cluster.

| Scope | Canonical source | Verdict | Current state | Code evidence | Main mismatch | Action | Priority | Linked PR | Removal or fix path |
|---|---|---|---|---|---|---|---|---|---|
| Documentation map and conflict priority | `DECIZHEN_PROJECT_SPECIFICATION.md`, `docs/README.md` | `already compliant` | one canonical docs-pack and conflict order already exist | `docs/README.md`, `docs/DECIZHEN_PROJECT_SPECIFICATION.md` | this template had remained unfilled, so implementation planning was not reflected back into the audit artifact | `keep` | `P3` | `PR-00` | populate this template, then keep docs synchronized after each convergence phase |
| `section=actions` route ownership | `DECIZHEN_PROJECT_SPECIFICATION.md`, `ACTIONS_GROWTH_CENTER_SPECIFICATION.md` | `conflict` | current UI still delegates Actions away from a first-class section | `src/features/workspace/navigation/resolveActiveWorkspaceSection.ts` maps `actions` to `profile` | Actions is approved as canonical, not a profile alias | `replace` | `P0` | `PR-01`, `PR-15` | introduce `actions` into the canonical section union and adapters, then remove aliasing |
| Canonical public section union | `DECIZHEN_PROJECT_SPECIFICATION.md` section 5 | `conflict` | route model splits `overview` from the public section union and handles it indirectly | `src/features/workspace/navigation/resolveActiveWorkspaceSection.ts`, `workspaceSection.contract.ts`, `WorkspacePageLayout.tsx` | one canonical section registry is missing | `replace` | `P0` | `PR-01` | define one section registry and derive unions, nav, adapters, and shell policies from it |
| Legacy route normalization | `DECIZHEN_PROJECT_SPECIFICATION.md` section 5, routing ADR | `legacy` | shell still performs runtime redirects and tab-era compatibility handling | `src/features/workspace/shell/useWorkspaceShellLegacyRouting.tsx`, `src/features/workspace/state/workspaceRequestsScope.model.ts` | compatibility rules are broader and more runtime-coupled than the target isolated layer | `refactor` | `P0` | `PR-02` | centralize precedence and normalization, then remove redundant route parsing branches |
| Shell ownership vs Requests ownership | `DECIZHEN_PROJECT_SPECIFICATION.md` sections 4 and 9, Requests spec | `conflict` | shell orchestration still reflects historical Requests-central ownership | `src/features/workspace/shell/WorkspacePageLayout.tsx`, `src/features/workspace/orchestration/sections/workspaceSectionAdapters.tsx`, `src/features/workspace/requests/*` | Requests is still too close to being the architecture root of workspace behavior | `replace` | `P0` | `PR-03` | move shell to section-driven ownership and reduce request-owned shared logic to plain feature code |
| Semantic token system | `DECIZHEN_PROJECT_SPECIFICATION.md` sections 10-13, `WORKSPACE_LAYOUT_STANDARD.md` | `partially compliant` | color, surface, border, radius, spacing, and shell geometry tokens are already present | `src/styles/tokens.css`, `src/styles/tokens/radius.css`, `src/styles/tokens/shadows.css` | compatibility aliases are still broad and the explicit AI family required by the layout standard is not yet a clean canonical token family | `refactor` | `P1` | `PR-04` | consolidate to one semantic layer and narrow compatibility aliases to documented exceptions |
| Typography system | `DECIZHEN_PROJECT_SPECIFICATION.md` section 11 | `partially compliant` | a scale exists and workspace uses some semantic text tokens | `src/styles/themes-tokens-scale.css`, `src/styles/tokens.css` | sections still rely on mixed legacy classes and inconsistent hierarchy application | `refactor` | `P1` | `PR-05` | align page, section, card, KPI, label, and button text to one shared scale |
| Shared primitive coverage | `DECIZHEN_PROJECT_SPECIFICATION.md` section 8 | `partially compliant` | button, badge, filter bar, pagination, and rail primitives already exist | `src/features/workspace/shared/index.ts`, `WorkspaceButton.tsx`, `WorkspaceBadge.tsx`, `WorkspaceFilterBar.tsx`, `WorkspacePaginatedPanel.tsx` | canonical `Card`, `Skeleton`, `EmptyState`, `ErrorState`, `Modal`, `Drawer`, and `DetailHeader` are incomplete or still section-owned | `refactor` | `P1` | `PR-06`, `PR-07` | add missing primitives, then migrate section-owned duplicates to them |
| Desktop shell states | `WORKSPACE_LAYOUT_STANDARD.md`, Requests spec | `partially compliant` | one shell, one sidebar, and one frame are present | `src/features/workspace/shell/WorkspaceShell.tsx`, `WorkspaceSidebar.tsx`, `WorkspacePageFrame.tsx`, `src/styles/features/workspace/workspace-layout.css` | explicit expanded/collapsed rail behavior, focus mode, persisted preferences, and Decision Indicator contract are not yet fully implemented as one state model | `refactor` | `P1` | `PR-08` | stabilize the shell state system before more section convergence |
| Unified AI rail adoption | `DECIZHEN_PROJECT_SPECIFICATION.md` section 9, `WORKSPACE_LAYOUT_STANDARD.md` | `partially compliant` | rail contract and renderer exist | `src/features/workspace/shared/workspaceUnifiedRail.model.ts`, `WorkspaceUnifiedRail.tsx` | sections still mix contextual rails, custom asides, and `railPolicy: none` instead of one canonical contract path | `refactor` | `P1` | `PR-09` | keep the shared rail renderer and convert sections into data adapters |
| Overview / Dashboard | `DASHBOARD_OVERVIEW_SPECIFICATION.md` | `partially compliant` | overview content and rail already exist inside workspace | `src/features/workspace/overview/WorkspaceOverviewMain.tsx`, `useWorkspaceOverviewRail.tsx` | dashboard must become the first fully canonical consumer of the finalized shell/primitives/rail system | `refactor` | `P2` | `PR-10` | migrate after foundation work and use it as the first proof surface |
| Requests collection | `REQUESTS_SECTION_LAYOUT_SPECIFICATION.md` | `partially compliant` | requests collection and private workflow views are strong and already canonical in many places | `src/features/workspace/requests/*`, `src/components/requests/*`, `src/features/workspace/market/*` | requests still own too much shared behavior, overlays, and presentation glue | `refactor` | `P2` | `PR-11` | move shared ownership out, then keep requests as a normal feature section |
| Requests detail and overlays | Requests spec, `WORKSPACE_LAYOUT_STANDARD.md` | `partially compliant` | public/private request detail and overlay flows already exist | `src/features/workspace/requests/details/*`, `src/features/workspace/overlays/*`, `src/components/requests/details/*` | detail flow is not yet uniformly expressed through canonical shared detail and overlay primitives | `refactor` | `P2` | `PR-12` | migrate to shared detail header, modal, drawer, and bounded central-canvas rules |
| Providers collection and detail | `PROVIDERS_SECTION_LAYOUT_SPECIFICATION.md` | `partially compliant` | providers have converged into workspace-owned section surfaces | `src/features/workspace/providers/*`, `src/components/providers/*` | final consistency work remains around comparison, detail composition, and rail adapter standardization | `refactor` | `P2` | `PR-13` | preserve the current contract path and remove remaining provider-specific visual drift |
| Statistics overview and details | `STATISTICS_SECTION_LAYOUT_SPECIFICATION.md` | `partially compliant` | statistics contract and frontend model foundation are already substantial | `src/features/workspace/stats/*`, `src/lib/api/workspace.ts`, `src/lib/api/dto/workspace.ts` | approved detail-routing model, broader state coverage, and final UI polish are still missing | `refactor` | `P2` | `PR-14` | keep backend-owned KPI semantics, finish routing and state coverage |
| Profile route root | `PROFILE_SECTION_SPECIFICATION.md`, `DECIZHEN_PROJECT_SPECIFICATION.md` | `conflict` | profile route currently opens an onboarding-first experience | `src/features/workspace/profile/WorkspaceProfileSection.tsx`, `src/features/workspace/requests/components/WorkspaceProfileTabPanel.tsx` | the approved profile management overview is not the primary route surface | `replace` | `P0` | `PR-16` | replace route root with a management overview, then split onboarding into a separate initial flow |
| Profile detail ownership | `PROFILE_SECTION_SPECIFICATION.md` | `legacy` | profile logic is mixed across onboarding, settings, and request-tab legacy panels | `src/features/workspace/profile/onboarding/*`, `src/features/workspace/profile/*`, `WorkspaceProfileTabPanel.tsx` | focused detail editors and clear section boundaries are still missing | `replace` | `P2` | `PR-17` | create overview + focused detail editors, then remove the monolithic onboarding-led panel |
| Actions feature code reuse | `ACTIONS_GROWTH_CENTER_SPECIFICATION.md` | `missing` | actions code today is mostly a request/chat interaction helper model, not a section UI | `src/features/workspace/actions/workspaceActions.model.ts` | Growth Center overview and detail flows are absent | `replace` | `P0` | `PR-15` | keep the reusable interaction helpers if still valid, but build a true Actions section on top |
| Chat section | `DECIZHEN_PROJECT_SPECIFICATION.md`, `WORKSPACE_LAYOUT_STANDARD.md` | `partially compliant` | chat has a dedicated workspace page and business context support | `src/features/workspace/chat/ChatWorkspacePage.tsx`, `chat/model/chat.model.ts` | final workspace list/detail grammar, mobile split flow, and contextual rail alignment remain open | `refactor` | `P2` | `PR-18` | keep entity context and migrate layout/state to the canonical shell patterns |
| Reviews section | `DECIZHEN_PROJECT_SPECIFICATION.md` and workspace reviews contracts | `partially compliant` | reviews use workspace-owned sections and rail-adjacent components | `src/features/workspace/reviews/*`, `src/components/reviews/*` | UI still carries public-profile and request-era styling and form patterns | `refactor` | `P2` | `PR-19` | migrate review cards and composers to shared primitives, then remove legacy styling dependencies |
| Settings / Help / legal | `DECIZHEN_PROJECT_SPECIFICATION.md`, `WORKSPACE_LAYOUT_STANDARD.md` | `partially compliant` | shell-owned support routes exist | `src/features/workspace/profile/WorkspaceSettingsPage.tsx`, `src/features/workspace/help/*`, `src/features/workspace/legal/*` | settings are not yet a full overview/detail management surface and support/legal surfaces still need final system-wide consistency | `refactor` | `P2` | `PR-20` | convert settings into themed detail sections and align help/legal with shell typography rules |
| Cross-section legacy cleanup | `DECIZHEN_PROJECT_SPECIFICATION.md` sections 21-24 | `legacy` | the repo intentionally retains wrappers, aliases, and compatibility state | `src/features/workspace/shell/useWorkspaceShellLegacyRouting.tsx`, `src/features/workspace/state/*`, request-side wrappers, section-specific old styles | cleanup cannot precede safe canonical replacement | `remove` | `P3` | `PR-21`, `PR-22` | remove only after each replacement is proven through tests and QA |

## Documentation consistency check

This audit was checked against:

1. `DECIZHEN_PROJECT_SPECIFICATION.md`
2. `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`
3. `WORKSPACE_LAYOUT_STANDARD.md`
4. `REQUESTS_SECTION_LAYOUT_SPECIFICATION.md`
5. `PROVIDERS_SECTION_LAYOUT_SPECIFICATION.md`
6. `STATISTICS_SECTION_LAYOUT_SPECIFICATION.md`
7. `ACTIONS_GROWTH_CENTER_SPECIFICATION.md`
8. `PROFILE_SECTION_SPECIFICATION.md`

Consistency result:

- the documentation hierarchy itself is coherent;
- the largest current contradictions are between canonical docs and live route/section ownership in code;
- section-level target contracts remain compatible with the shared execution sequence already recorded in the convergence strategy.

## Confirmed contradictions found during the audit

1. `section=actions` is canonical in the docs-pack, but runtime normalization still maps it to `profile`.
2. `Profile` is documented as a management center, but the active route root still renders an onboarding-led surface.
3. `Overview` is part of the canonical section model in docs, but code still treats it as a special case outside the public section union.
4. The shell contract requires a collapsed AI rail with a floating Decision Indicator and released grid width, but the current shell implementation does not yet express that state as one complete canonical system.
5. The docs require one canonical rail contract, while several sections still use custom rail behavior or no rail policy at all.

## Section completion checklist

For each workspace section, confirm all of the following:

- canonical route is used and legacy generation is removed;
- section renders inside the shared workspace shell;
- section uses shared primitives instead of local duplicates;
- desktop, tablet, and mobile behavior are verified;
- shell expanded, collapsed, and focus states are valid where applicable;
- loading, empty, error, partial, and permission states are deliberate;
- AI rail uses the common contract where applicable;
- frontend does not compute backend-owned business semantics;
- tests exist for the affected behavior;
- transitional code has an explicit removal condition.

## Recommended execution order after the audit

The audit should feed this implementation sequence:

1. routes and section registry
2. design tokens
3. typography
4. shared UI primitives
5. workspace shell
6. unified AI rail
7. dashboard
8. requests
9. providers
10. statistics
11. actions
12. profile
13. chat
14. reviews
15. settings and service pages
16. legacy removal
17. final system audit

## Backlog-linked PR queue

The current audited implementation queue is:

1. `PR-00` Audit baseline
2. `PR-01` Canonical routes and section registry
3. `PR-02` Legacy query normalization isolation
4. `PR-03` Detach Workspace shell from Requests-owned assumptions
5. `PR-04` Design tokens consolidation
6. `PR-05` Typography unification
7. `PR-06` Shared UI primitives core
8. `PR-07` Shared UI primitives overlays and detail flow
9. `PR-08` Canonical Workspace shell states
10. `PR-09` Unified AI rail contract adoption
11. `PR-10` Dashboard migration
12. `PR-11` Requests collection migration
13. `PR-12` Requests detail and overlay migration
14. `PR-13` Providers migration
15. `PR-14` Statistics migration
16. `PR-15` Actions section implementation
17. `PR-16` Profile overview migration
18. `PR-17` Profile detail editors and onboarding split
19. `PR-18` Chat migration
20. `PR-19` Reviews migration
21. `PR-20` Settings, help, privacy, cookies migration
22. `PR-21` Cross-section legacy cleanup
23. `PR-22` Final QA and documentation reconciliation

Sequence:

`PR-00 → PR-01 → PR-02 → PR-03 → PR-04 → PR-05 → PR-06 → PR-07 → PR-08 → PR-09 → PR-10 → PR-11 → PR-12 → PR-13 → PR-14 → PR-15 → PR-16 → PR-17 → PR-18 → PR-19 → PR-20 → PR-21 → PR-22`

## Audit outcome requirements

The audit is only complete when it produces:

- a filled `already compliant / partially compliant / missing / legacy / conflict` matrix;
- a list of contradictions between code and docs;
- a `keep / refactor / replace / remove` implementation queue;
- a first implementation block scoped to shared foundations rather than an arbitrary section rewrite.

## Audit completion status as of 2026-07-25

This template is now populated with:

- a high-level workspace matrix;
- detailed code-backed findings;
- explicit contradictions;
- linked backlog PR identifiers;
- a sequential implementation queue from `PR-00` through `PR-22`.
