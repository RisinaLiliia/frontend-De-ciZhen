# De'ciZhen Workspace Frontend Convergence Strategy

**Document status:** Approved target contract  
**Version:** 1.0  
**Date:** 2026-07-19  
**Parent specification:** `DECIZHEN_PROJECT_SPECIFICATION.md`  
**Related standards:** `WORKSPACE_LAYOUT_STANDARD.md`

## 1. Purpose

This document defines the approved frontend delivery strategy for converging the De'ciZhen workspace to its section specifications, visual references, and shared UI standards.

It is not a claim that the current preview branch already satisfies the target behavior.

It exists to prevent a recurring failure mode:

- data appears on screen;
- the backend contract is partially wired;
- the section is declared "done";
- the visual system, state coverage, naming, file boundaries, and transitional code remain unfinished.

That is not acceptable platform completion.

## 2. Scope

This strategy applies to all workspace-owned frontend surfaces on `preview/v0.4.0-workspace-platform`, including:

- overview/dashboard;
- requests;
- providers;
- reviews;
- statistics;
- profile;
- actions;
- chat where section-specific convergence is required;
- shell-owned workspace surfaces where layout, navigation, or shared primitives are affected.

## 3. Normative position

This document is an approved target contract and delivery strategy.

It governs:

- how frontend convergence work is sequenced;
- how sections are audited and declared complete;
- how shared UI standards must be adopted;
- how transitional code is replaced and removed;
- how implementation evidence is collected before completion.

It does not override:

- canonical route truth;
- backend ownership rules;
- section-specific product behavior defined in the owning specification.

Those remain governed by:

1. `DECIZHEN_PROJECT_SPECIFICATION.md`
2. `WORKSPACE_LAYOUT_STANDARD.md`
3. the owning section specification

## 4. Core convergence principles

### 4.1 Backend continuity

- The existing backend remains the baseline.
- Existing backend workspace contracts must be reused wherever they already provide the needed section semantics.
- Missing endpoints or fields are added separately and only through documented contracts.
- Frontend must not substitute fake production data where required backend data does not yet exist.
- When data is unavailable, the section must render an intentional loading, unavailable, partial, or restricted state instead of invented truth.

### 4.2 Section-by-section convergence

- Workspace sections are converged deliberately, one section at a time or through tightly scoped shared-infrastructure work that directly supports them.
- Each section must be brought to the shared workspace layout, UI standard, and route model.
- A section is not considered complete merely because its primary data is visible.
- Completion requires product, visual, state, responsive, and architectural alignment with the approved documentation.

### 4.3 Shared visual system is mandatory

Every converged section must use the shared workspace visual system:

- global fonts;
- typography scale;
- vertical rhythm;
- spacing system;
- color palette;
- semantic indicators;
- cards and surfaces;
- loading, empty, error, partial, and restricted states;
- responsive behavior;
- shared navigation and shell grammar.

Local one-off visual dialects are not an acceptable end state.

### 4.4 Visual references are normative

- Frontend implementation must align with approved workspace mockups, assets, and section specifications.
- Assets and visual references are not decorative inspiration; they are implementation targets within the limits of real data and accessibility.
- If implementation cannot match an approved reference because of a real product or contract constraint, the specification must be updated explicitly.

### 4.5 Cleanup is part of delivery

- Transitional rendering paths must be removed after safe replacement.
- Dead code must not be preserved as silent debt after a section converges.
- Files and components must be renamed professionally when their old names no longer describe canonical ownership.
- Files must be moved into correct feature and architecture boundaries.
- Duplicated logic, duplicate styles, and parallel primitives must be consolidated rather than left in place for convenience.

## 5. Shared frontend standards

### 5.1 Naming and ownership

- Feature names must reflect canonical workspace ownership.
- Request-branded or legacy-branded names must be replaced when the feature is no longer request-owned.
- Transitional wrapper names are acceptable only during active migration and must carry a removal path.

### 5.2 File boundaries

Frontend files must converge to correct boundaries:

- route and shell orchestration;
- section-specific presentation;
- section-specific state;
- shared workspace primitives;
- API/contract integration;
- feature-local tests.

No section should permanently depend on unrelated historical feature folders when canonical ownership has moved.

### 5.3 Style boundaries

- Shared primitives own shared styles.
- Section styles own section-specific composition only.
- Global tokens remain the source of truth for typography, color, radius, spacing, and motion.
- Large style duplication or many competing panel/card systems are not acceptable.

## 6. Required section delivery workflow

Every workspace section must follow this workflow:

1. documentation and visual audit;
2. current implementation audit;
3. backend contract audit;
4. gap definition;
5. architecture and file plan;
6. UI implementation;
7. data and behavior integration;
8. loading, empty, error, partial and restricted states;
9. responsive verification;
10. dead-code removal;
11. file renaming and relocation;
12. tests;
13. visual comparison;
14. documentation update;
15. isolated commit.

Skipping later cleanup and verification steps because earlier rendering "works" is not valid convergence.

## 7. Required audit dimensions per section

Before a section can be considered complete, the work must address:

- product ownership and section purpose;
- route model and URL behavior;
- backend contract coverage;
- shell integration;
- main content behavior;
- rail behavior;
- loading, empty, error, partial, and restricted states;
- responsive layout;
- accessibility behavior;
- visual comparison against approved references;
- naming, file ownership, and cleanup;
- documentation reconciliation.

## 8. Definition of section completion

A workspace section is complete only when all of the following are true:

- it uses the canonical workspace route and section-local route surface defined by the docs-pack;
- it renders through the shared workspace shell and layout rules;
- it uses approved backend contracts or explicitly documented temporary contract gaps;
- it does not rely on fake production data;
- its visual implementation matches the approved section specification closely enough to be considered the same product surface;
- its loading, empty, error, partial, and restricted states are deliberate and tested;
- its responsive behavior is verified;
- its transitional and dead code has been removed or reduced to documented, temporary wrappers;
- its files and components are named and located according to canonical ownership;
- its tests and documentation are updated;
- its implementation has been reviewed against both the current contract and the approved target.

## 9. Known non-goal

This strategy does not claim that convergence is already complete.

It is an approved delivery standard for finishing the preview refactor line professionally.


## 10. Concrete execution roadmap for `preview/v0.4.0-workspace-platform`

### 10.1 Purpose of this roadmap section

This section converts the approved convergence strategy into a concrete execution sequence for the current frontend integration branch.

It reflects the real current situation:

- `preview/v0.4.0-workspace-platform` remains the workspace integration branch;
- new implementation work must not target `main` directly;
- new task branches must be created from the updated preview branch and merged back into preview;
- the existing shared tokens, shell, primitives, and workspace surfaces must be audited and consolidated, not rebuilt from zero;
- Statistics, Profile, and Actions remain the main section-specific convergence tracks still requiring dedicated frontend work.

This roadmap is normative for sequencing and delivery discipline. It is not a claim that the listed phases are already complete on the preview branch.

### 10.2 Baseline assumptions and branch policy

Execution must start from the following assumptions:

- the preview branch may be both ahead of and behind `main`;
- merge-based synchronization is preferred over force-push, hard-reset, or history rewrite while a safe merge path remains possible;
- independent convergence tasks must not be mixed into one large implementation branch;
- no new UI foundation may be introduced where existing workspace tokens, primitives, and shell helpers already solve the problem;
- no section-specific business logic may be changed during the shared-foundation audit unless the change is strictly required to restore canonical rendering behavior.

### 10.3 Recommended execution order

| Order | Phase | Why now |
|---|---|---|
| 1 | Preview branch backup and stabilization | protects the integration line before new merges or feature work |
| 2 | Synchronization with `main` | reduces future conflict size and prevents implementing on stale branch state |
| 3 | Conflict analysis and safe conflict resolution | keeps the integration branch coherent before new convergence work |
| 4 | Post-sync validation | ensures the synchronized preview branch is technically usable |
| 5 | Shared workspace UI foundation audit and narrow refactor | confirms canonical primitives and removes only safe low-level drift |
| 6 | Workspace shell and responsive layout audit | stabilizes the shell before section-specific convergence |
| 7 | Statistics section convergence | highest-value remaining contract-driven section already closest to canonical backend ownership |
| 8 | Profile section convergence | removes transitional onboarding/profile coupling after stats is stabilized |
| 9 | Actions / Growth Center convergence | must happen after profile because the current implementation still overlaps with profile-oriented flows |
| 10 | Existing section consistency pass | reconciles Overview, Requests, Providers, Reviews, and Chat against the converged shell and primitives |
| 11 | Responsive, visual, and accessibility QA | verifies the whole workspace family after section convergence |
| 12 | Dead-code, alias, and architecture cleanup | only safe after canonical section replacements are live |
| 13 | Documentation reconciliation | updates docs to match real implementation after cleanup |
| 14 | Final release readiness | operational completion gate for the preview integration line |

### 10.4 Phase dependency matrix

| Phase | Depends on |
|---|---|
| 1 | none |
| 2 | 1 |
| 3 | 2 |
| 4 | 3 |
| 5 | 4 |
| 6 | 5 |
| 7 | 6 |
| 8 | 7 |
| 9 | 8 |
| 10 | 9 |
| 11 | 10 |
| 12 | 11 |
| 13 | 12 |
| 14 | 13 |

### 10.5 Items that must be clarified before phase 1

Before implementation resumes, confirm all of the following explicitly:

- whether the newer normative docs-pack has already been merged into the active preview branch or still exists only on a docs-focused branch;
- whether `origin/main` is the synchronization source for preview stabilization;
- whether backend already provides a canonical dedicated Actions section contract or only partial action-oriented payloads currently reused elsewhere;
- whether Profile target behavior is the approved management overview with focused editors rather than the current onboarding-led surface;
- whether Statistics still requires backend contract expansion or only frontend convergence and cleanup;
- whether any currently active compatibility alias must remain temporarily for production links and, if yes, what its removal trigger is.

### 10.6 Work already completed and not to be re-planned

The following work is already materially present and must not be restarted from zero:

- workspace-wide design tokens and theme layers;
- shared workspace list, panel, filter, rail, and surface primitives;
- canonical workspace shell and navigation execution model;
- providers convergence onto workspace-owned surfaces;
- reviews convergence onto workspace-owned surfaces;
- statistics endpoint, DTO, schema validation, and query-layer foundation;
- broad automated test coverage for shell, routing, orchestration, requests, shared primitives, and stats;
- release, lint, typecheck, unit, build, and E2E command set.

### 10.7 Documentation gaps that must be treated explicitly

The following documentation gaps are known and must be reconciled during later phases instead of ignored:

- some newer normative workspace specification files may not yet be present on the current preview branch baseline;
- some older roadmap and merge-readiness documents may overstate how complete the remaining frontend convergence really is;
- actions routing and canonical section truth may still be described inconsistently in older QA material;
- the concrete execution roadmap for the real remaining work must remain synchronized with current code reality.

### 10.8 Technical risk summary

Key technical risks for the remaining convergence work are:

- preview branch divergence from `main`;
- documentation drift between docs-focused branches and the integration branch;
- hidden route and alias coupling, especially around `actions`, private tabs, and legacy request filters;
- visual regressions caused by low-level style cleanup in shared workspace styles;
- profile/actions overlap that can produce false convergence if only labels change but routing and ownership do not;
- reintroducing frontend-owned statistics semantics during UI cleanup;
- deleting compatibility too early before route, QA, and backend coordination are complete.

### 10.9 Phase-by-phase execution plan

#### Phase 1. Preview branch backup and stabilization

- Goal:
  - establish a safe, reviewable starting point for the integration branch before any new implementation work begins.
- Dependencies:
  - none.
- Recommended branch name:
  - `chore/preview-stabilization`.
- Affected documents:
  - `docs/README.md`
  - `docs/architecture/project-current-state.md`
  - `docs/architecture/workspace-merge-readiness.md`
- Affected code areas:
  - no feature implementation should change in this phase.
- Work steps:
  1. check out `preview/v0.4.0-workspace-platform` locally and confirm a clean starting state;
  2. document branch divergence against `main` and remote tracking state;
  3. confirm that preview remains the integration branch for all workspace work;
  4. confirm that new task branches will be created from the updated preview branch and merged back into preview.
- Non-goals:
  - no feature work;
  - no visual cleanup;
  - no route changes.
- Risks:
  - beginning implementation from the wrong local branch or stale preview snapshot.
- Required tests and validation commands:
  - `git status --short --branch`
  - `git branch -vv`
  - `git rev-list --left-right --count origin/main...preview/v0.4.0-workspace-platform`
- Completion criteria:
  - preview branch status, divergence, and integration ownership are explicitly recorded.
- Expected result:
  - safe operational baseline for all later phases.
- Recommended commit type:
  - `chore`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 2. Synchronization with `main`

- Goal:
  - bring current `main` changes into the preview branch before any new section convergence continues.
- Dependencies:
  - phase 1.
- Recommended branch name:
  - `chore/preview-main-sync`.
- Affected documents:
  - `docs/architecture/workspace-merge-readiness.md`
  - `docs/release-dod.md`
- Affected code areas:
  - repository-wide merge surface; expected hotspots include `src/features`, `src/styles`, `src/components`, and `docs`.
- Work steps:
  1. update remote refs;
  2. merge `origin/main` into the phase branch created from preview;
  3. list all conflicted files and group them by architecture area;
  4. stop before conflict resolution is mixed with unrelated feature work.
- Non-goals:
  - no section convergence;
  - no opportunistic cleanup outside conflict handling.
- Risks:
  - hidden regressions from stale assumptions about deleted or renamed legacy files.
- Required tests and validation commands:
  - `git diff --name-only --diff-filter=U`
  - `git diff --stat`
- Completion criteria:
  - merge is performed and the conflict surface is fully identified.
- Expected result:
  - synchronized but not yet validated preview working branch.
- Recommended commit type:
  - `chore`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 3. Conflict analysis and safe conflict resolution

- Goal:
  - resolve `main` synchronization conflicts without reintroducing removed legacy architecture.
- Dependencies:
  - phase 2.
- Recommended branch name:
  - `chore/preview-conflict-resolution`.
- Affected documents:
  - `docs/architecture/frontend-backend-boundary.md`
  - `docs/architecture/platform-engineering-standard.md`
  - `docs/architecture/project-current-state.md`
- Affected code areas:
  - conflict files from phase 2, especially workspace routing, shared styles, legacy home cleanup, and section ownership.
- Work steps:
  1. resolve docs conflicts against actual branch behavior rather than older assumptions;
  2. preserve canonical workspace-owned surfaces over older home or request-branded paths;
  3. prefer the reduced legacy surface where safe;
  4. verify that no resolved conflict silently restores removed transitional files or aliases.
- Non-goals:
  - no new feature behavior;
  - no broad refactor unrelated to merge conflicts.
- Risks:
  - accidentally restoring deleted styles, routes, or duplicated rendering paths.
- Required tests and validation commands:
  - `git grep -n "legacy\|alias\|redirect" src/features/workspace src/styles/features/workspace docs`
  - targeted manual review of each conflict cluster.
- Completion criteria:
  - no unresolved conflicts remain and no known canonical regressions are introduced by the resolution itself.
- Expected result:
  - coherent merge-resolved preview working branch.
- Recommended commit type:
  - `chore` or `fix`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 4. Validation after branch synchronization

- Goal:
  - establish a technically green baseline after the preview branch is synchronized with `main`.
- Dependencies:
  - phase 3.
- Recommended branch name:
  - `chore/preview-post-sync-validation`.
- Affected documents:
  - `docs/release-dod.md`
  - `docs/workspace-ui-regression-check.md`
- Affected code areas:
  - repository-wide.
- Work steps:
  1. run the full technical verification baseline;
  2. fix only synchronization regressions that block a green base;
  3. record any intentionally deferred failures with explicit owner and reason before feature work resumes.
- Non-goals:
  - no new workspace feature implementation.
- Risks:
  - carrying broken build, type, lint, or test state into later convergence phases.
- Required tests and validation commands:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run lint:styles`
  - `npm run test:ci`
  - `npm run build`
  - optional release baseline: `npm run build:webpack`
- Completion criteria:
  - synchronized preview branch is green or all remaining blockers are explicitly documented.
- Expected result:
  - stable integration baseline for further work.
- Recommended commit type:
  - `fix` or `chore`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 5. Shared workspace UI foundation audit and narrow refactor

- Goal:
  - audit and consolidate the existing shared workspace UI foundation without rebuilding it from zero.
- Dependencies:
  - phase 4.
- Recommended branch name:
  - `refactor/workspace-foundation-audit`.
- Affected documents:
  - `WORKSPACE_LAYOUT_STANDARD.md`
  - `DECIZHEN_PROJECT_SPECIFICATION.md`
  - `docs/architecture/platform-engineering-standard.md`
- Affected code areas:
  - `src/styles/tokens.css`
  - `src/styles/themes.css`
  - `src/styles/themes-tokens-scale.css`
  - `src/styles/globals.css`
  - `src/features/workspace/shared/*`
  - `src/styles/features/workspace/workspace-surface-primitives.css`
- Work steps:
  1. inventory existing tokens, primitives, and shell helpers;
  2. identify duplicated imports, duplicate primitive roles, and naming drift;
  3. remove or consolidate only clearly redundant shared primitives and shared style glue;
  4. keep section-specific business behavior untouched unless a low-level bug blocks canonical rendering;
  5. document any intentionally retained compatibility primitive and its removal condition.
- Non-goals:
  - no new token system;
  - no section-specific business logic changes;
  - no simultaneous statistics/profile/actions implementation.
- Risks:
  - visual regressions from broad shared-style edits;
  - accidental mixing of low-level refactor with section product behavior.
- Required tests and validation commands:
  - `npm run typecheck`
  - `npm run lint:styles`
  - targeted vitest runs for `src/features/workspace/shared/*` and directly affected consumers
- Completion criteria:
  - canonical shared workspace primitives are clear, low-level duplication is reduced, and no new foundation is introduced.
- Expected result:
  - cleaner shared base for all later section convergence.
- Recommended commit type:
  - `refactor`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 6. Workspace shell and responsive layout audit

- Goal:
  - harden the workspace shell, navigation frame, and responsive layout behavior before section-specific convergence continues.
- Dependencies:
  - phase 5.
- Recommended branch name:
  - `refactor/workspace-shell-audit`.
- Affected documents:
  - `WORKSPACE_LAYOUT_STANDARD.md`
  - `docs/audit/workspace-responsive-qa-matrix.md`
- Affected code areas:
  - `src/features/workspace/shell/*`
  - `src/features/workspace/navigation/*`
  - `src/features/workspace/context/*`
  - `src/styles/features/workspace/workspace-shell.css`
  - `src/styles/features/workspace/workspace-layout.css`
  - `src/styles/features/workspace/workspace-sidebar.css`
  - `src/styles/features/workspace/workspace-controls-responsive.css`
- Work steps:
  1. verify shell invariants against the layout standard;
  2. isolate shell-level legacy routing and responsive assumptions;
  3. fix only shell/layout issues that affect multiple sections or violate canonical workspace geometry;
  4. update QA notes where route naming or breakpoint expectations are outdated.
- Non-goals:
  - no section-specific UI rebuild;
  - no actions/profile/statistics implementation work.
- Risks:
  - shell regressions propagate into every section.
- Required tests and validation commands:
  - `npx vitest run src/features/workspace/shell/WorkspacePageLayout.test.tsx`
  - `npx vitest run src/features/workspace/shell/WorkspaceRouteShell.test.tsx`
  - `npx vitest run src/features/workspace/navigation/workspaceNavigation.config.test.tsx`
  - `npx vitest run src/features/workspace/navigation/resolveActiveWorkspaceNavigationSection.test.ts`
  - `npx vitest run src/features/workspace/orchestration/useWorkspaceRouteState.test.tsx`
- Completion criteria:
  - shell behavior, canonical route handling, and responsive frame behavior are stable enough for section-level work.
- Expected result:
  - stable workspace frame and responsive baseline.
- Recommended commit type:
  - `refactor`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 7. Statistics section convergence

- Goal:
  - converge Statistics to its approved workspace section contract using the existing backend-driven dashboard path.
- Dependencies:
  - phase 6.
- Recommended branch name:
  - `refactor/workspace-statistics-convergence`.
- Affected documents:
  - `STATISTICS_SECTION_LAYOUT_SPECIFICATION.md`
  - `docs/decision-dashboard-backend-handoff.md`
  - `docs/openapi/workspace-statistics-decision-dashboard.openapi.yaml`
- Affected code areas:
  - `src/features/workspace/stats/*`
  - `src/lib/api/dto/workspace.ts`
  - `src/lib/api/workspace.ts`
- Work steps:
  1. compare the implemented stats route, state, and rendering behavior against the approved statistics specification;
  2. keep backend contract ownership primary and prevent UI cleanup from reintroducing a second analytics engine;
  3. close remaining gaps in section-local state coverage, detail routing, rail behavior, and visual/system consistency;
  4. keep any fallback behavior narrow, explicit, and outside the canonical hot path.
- Non-goals:
  - no profile convergence;
  - no actions section implementation;
  - no fake analytics data.
- Risks:
  - reintroducing avoidable frontend semantics during UI cleanup;
  - contract drift between frontend assumptions and backend payload.
- Required tests and validation commands:
  - `npx vitest run src/features/workspace/stats`
  - `npm run typecheck`
  - `npm run build`
- Completion criteria:
  - `section=stats` uses the canonical contract path, covers required UI states, and aligns with the statistics section specification.
- Expected result:
  - statistics becomes a fully converged workspace section rather than a partly transitional dashboard.
- Recommended commit type:
  - `refactor`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 8. Profile section convergence

- Goal:
  - replace the transitional onboarding-led profile surface with the approved profile management overview and focused detail flows.
- Dependencies:
  - phase 7.
- Recommended branch name:
  - `refactor/workspace-profile-convergence`.
- Affected documents:
  - `PROFILE_SECTION_SPECIFICATION.md`
  - `DECIZHEN_PROJECT_SPECIFICATION.md`
- Affected code areas:
  - `src/features/workspace/profile/*`
  - `src/features/workspace/context/*`
  - `src/features/workspace/state/*`
  - `src/styles/features/workspace/workspace-profile.css`
- Work steps:
  1. compare current profile implementation against the approved profile specification;
  2. move the route from onboarding-first behavior toward canonical management overview behavior;
  3. ensure `viewerMode` and `profileView` semantics are section-owned and explicit;
  4. isolate any remaining profile/actions overlap instead of preserving accidental coupling.
- Non-goals:
  - no actions section implementation in the same branch;
  - no broad foundation work.
- Risks:
  - profile and actions currently overlap in some rail and route expectations;
  - profile cleanup can break private workspace flows if ownership remains unclear.
- Required tests and validation commands:
  - `npm run typecheck`
  - targeted vitest runs for profile, viewer-mode state, and route-state behavior
  - `npm run build`
- Completion criteria:
  - `section=profile` is a canonical management surface, not only an onboarding wrapper.
- Expected result:
  - converged profile section with clear route, state, and layout ownership.
- Recommended commit type:
  - `refactor`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 9. Actions / Growth Center convergence

- Goal:
  - introduce Actions as a first-class canonical workspace section instead of a profile-oriented compatibility path.
- Dependencies:
  - phase 8.
- Recommended branch name:
  - `feat/workspace-actions-convergence`.
- Affected documents:
  - `ACTIONS_GROWTH_CENTER_SPECIFICATION.md`
  - `DECIZHEN_PROJECT_SPECIFICATION.md`
  - `WORKSPACE_LAYOUT_STANDARD.md`
- Affected code areas:
  - `src/features/workspace/actions/*`
  - `src/features/workspace/navigation/resolveActiveWorkspaceSection.ts`
  - `src/features/workspace/navigation/workspaceSection.contract.ts`
  - `src/features/workspace/orchestration/sections/workspaceSectionAdapters.tsx`
  - any new or updated Actions-specific workspace styles
- Work steps:
  1. remove the assumption that `section=actions` is only a profile redirect;
  2. add canonical route and section-model support for Actions;
  3. implement the approved Growth Center surface using existing shared workspace primitives;
  4. keep backend contract reuse primary and request missing backend fields separately when necessary;
  5. remove transitional profile-oriented Actions rendering only after safe replacement.
- Non-goals:
  - no simultaneous profile refactor inside the same branch;
  - no fake production data;
  - no parallel long-term Actions architectures.
- Risks:
  - route-model regression across shell, nav, and QA;
  - backend contract incompleteness could tempt frontend fabrication.
- Required tests and validation commands:
  - `npm run typecheck`
  - routing and shell tests affecting section resolution
  - new targeted Actions tests
  - `npm run build`
- Completion criteria:
  - `section=actions` is canonical in implementation, testable, and no longer a profile fallback path.
- Expected result:
  - approved Growth Center exists as a real workspace section.
- Recommended commit type:
  - `feat` or `refactor`, depending on scope.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 10. Consistency pass for already existing sections

- Goal:
  - verify Overview, Requests, Providers, Reviews, and Chat against the converged shell, shared primitives, and route model.
- Dependencies:
  - phase 9.
- Recommended branch name:
  - `refactor/workspace-cross-section-consistency`.
- Affected documents:
  - `DECIZHEN_PROJECT_SPECIFICATION.md`
  - the relevant section specifications
  - `docs/workspace-final-audit.md`
- Affected code areas:
  - `src/features/workspace/overview/*`
  - `src/features/workspace/requests/*`
  - `src/features/workspace/providers/*`
  - `src/features/workspace/reviews/*`
  - `src/features/workspace/chat/*`
  - `src/features/workspace/shared/*`
- Work steps:
  1. audit each already-converged section against the latest canonical shell and primitive set;
  2. remove low-value surface inconsistencies and route-state drift;
  3. keep the scope focused on consistency, not on inventing new behavior.
- Non-goals:
  - no broad redesign;
  - no new cross-section architecture experiments.
- Risks:
  - hidden small inconsistencies can widen scope if not controlled.
- Required tests and validation commands:
  - targeted section vitest suites
  - `npm run test:ci`
- Completion criteria:
  - the major existing sections behave like one workspace family with the same surface grammar.
- Expected result:
  - reduced cross-section inconsistency before final QA.
- Recommended commit type:
  - `refactor`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 11. Responsive, visual, and accessibility QA

- Goal:
  - verify canonical workspace behavior in real browser conditions after section convergence is in place.
- Dependencies:
  - phase 10.
- Recommended branch name:
  - `qa/workspace-responsive-visual-a11y`.
- Affected documents:
  - `docs/audit/workspace-responsive-qa-matrix.md`
  - `docs/workspace-ui-regression-check.md`
  - `docs/release-dod.md`
- Affected code areas:
  - fixes may touch any workspace section, shell, or shared primitive proved broken by QA.
- Work steps:
  1. execute real browser QA at `375`, `425`, `768`, `1024`, `1280`, and `1440`;
  2. verify canonical routes, overlays, rails, navigation, and primary CTA reachability;
  3. run critical E2E and accessibility smoke;
  4. fix only real QA findings and document the evidence.
- Non-goals:
  - no new feature work disguised as QA.
- Risks:
  - layout, overflow, or keyboard issues may still surface late.
- Required tests and validation commands:
  - `npm run test:e2e:critical`
  - `npm run test:e2e:a11y`
  - manual browser QA across required viewports
- Completion criteria:
  - no blocker-level responsive, visual, or accessibility defects remain on canonical workspace routes.
- Expected result:
  - real user-facing quality evidence for the converged workspace.
- Recommended commit type:
  - `fix` or `test`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 12. Dead-code, alias, and architecture cleanup

- Goal:
  - remove obsolete compatibility, duplicate helpers, and dead implementation only after safe canonical replacement is proven.
- Dependencies:
  - phase 11.
- Recommended branch name:
  - `refactor/workspace-cleanup`.
- Affected documents:
  - `DECIZHEN_PROJECT_SPECIFICATION.md`
  - `docs/architecture/platform-engineering-standard.md`
  - `docs/architecture/workspace-merge-readiness.md`
- Affected code areas:
  - legacy route handling
  - temporary wrappers
  - residual alias normalization
  - dead section styles or components
- Work steps:
  1. list every remaining compatibility or wrapper path;
  2. delete only those that are provably no longer needed;
  3. keep any remaining compatibility explicit, narrow, and documented.
- Non-goals:
  - no speculative deletion;
  - no rewrite of already-stable canonical paths.
- Risks:
  - deleting residual migration behavior too early.
- Required tests and validation commands:
  - `npm run test:ci`
  - `npm run build`
  - targeted route and section tests affected by cleanup
- Completion criteria:
  - dead and transitional paths are reduced to the minimum justified residual surface.
- Expected result:
  - simpler and more explainable workspace architecture.
- Recommended commit type:
  - `refactor`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 13. Documentation reconciliation

- Goal:
  - align the full docs-pack with the real implementation state after convergence and cleanup.
- Dependencies:
  - phase 12.
- Recommended branch name:
  - `docs/workspace-doc-reconciliation`.
- Affected documents:
  - `docs/README.md`
  - `DECIZHEN_PROJECT_SPECIFICATION.md`
  - `WORKSPACE_LAYOUT_STANDARD.md`
  - `WORKSPACE_FRONTEND_CONVERGENCE_STRATEGY.md`
  - section specifications
  - relevant QA, audit, and handoff docs
- Affected code areas:
  - none, except doc-derived reference corrections if required.
- Work steps:
  1. compare current code to canonical docs and approved target docs;
  2. update outdated implementation-status language;
  3. ensure routing truth, query registry, section ownership, and QA notes are consistent;
  4. record any still-open intentional gaps instead of silently omitting them.
- Non-goals:
  - no code changes only to make docs look cleaner.
- Risks:
  - documentation drift returning after implementation closes.
- Required tests and validation commands:
  - markdown link validation
  - targeted text search for outdated alias and route claims
- Completion criteria:
  - canonical docs describe the actual current preview branch accurately.
- Expected result:
  - trusted documentation baseline for the integrated workspace platform.
- Recommended commit type:
  - `docs`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

#### Phase 14. Final release readiness

- Goal:
  - finish the workspace convergence as an operationally reviewable release-ready preview integration line.
- Dependencies:
  - phase 13.
- Recommended branch name:
  - `release/workspace-final-readiness`.
- Affected documents:
  - `docs/release-dod.md`
  - `docs/architecture/workspace-merge-readiness.md`
  - final QA evidence documents
- Affected code areas:
  - only final blocker fixes that are necessary to pass release gates.
- Work steps:
  1. run the final release gate on the updated preview branch;
  2. verify critical E2E and accessibility smoke;
  3. reconcile frontend/backend sequencing expectations;
  4. document any accepted exception with explicit owner and reason.
- Non-goals:
  - no new feature scope;
  - no direct feature merge to `main` from isolated section branches.
- Risks:
  - delayed discovery of cross-repo contract or deployment assumptions.
- Required tests and validation commands:
  - `npm run release:check`
  - `npm run test:e2e:critical`
  - `npm run test:e2e:a11y`
  - optional: `npm run ci:verify`
- Completion criteria:
  - the preview branch is operationally ready for controlled final integration review and no longer blocked by open convergence work.
- Expected result:
  - workspace preview branch becomes the clean release-preparation baseline.
- Recommended commit type:
  - `chore` or `release`.
- PR target branch:
  - `preview/v0.4.0-workspace-platform`.

### 10.10 Full-process definition of done

The workspace frontend convergence process is complete only when all of the following are true:

- the preview branch is safely synchronized with `main` through a merge-based strategy;
- the canonical docs-pack is present on the preview branch and reflects actual implementation truth;
- shared tokens, shared primitives, and shared workspace shell helpers are consolidated rather than multiplied;
- Statistics, Profile, and Actions each exist as section-owned canonical workspace surfaces;
- `section=actions` is implemented as a real canonical section rather than a profile compatibility path;
- Profile no longer depends on transitional onboarding-led rendering as its main canonical surface;
- Statistics uses backend-owned semantics in the main runtime path and keeps any remaining fallback behavior narrow and explicit;
- existing sections remain consistent with the same workspace shell, primitive family, and route language;
- responsive, visual, and accessibility QA evidence exists for canonical workspace routes;
- dead code, obsolete aliases, and unnecessary compatibility helpers are removed where safe;
- release checks and required automated gates are green or explicitly exception-documented;
- the preview branch is a stable integration branch for subsequent controlled merge preparation rather than an accumulation of unresolved transitional work.
