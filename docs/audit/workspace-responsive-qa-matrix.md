# Workspace Responsive QA Matrix

## Scope

This document records responsive QA evidence for the `/workspace` shell before route QA, visual consistency QA, and production hardening.

Audit date: 2026-05-31

Audit basis:

- Static code audit of `src/features/workspace/shell`, `navigation`, `context`, `overlays`, and `src/styles/features/workspace`
- Targeted automated verification:
  - `npx vitest run src/features/workspace/shell/WorkspacePageLayout.test.tsx`
  - `npx vitest run src/features/workspace/shell/WorkspaceRouteShell.test.tsx`
  - `npx vitest run src/features/workspace/navigation/workspaceNavigation.config.test.tsx`
  - `npx vitest run src/features/workspace/navigation/resolveActiveWorkspaceNavigationSection.test.ts`
  - `npx vitest run src/features/workspace/orchestration/useWorkspaceRouteState.test.tsx`
- Result: 5 test files passed, 36 tests passed

Not covered yet:

- Real browser/manual viewport smoke tests
- Screenshot diff or visual regression tooling
- Exact overflow verification per route and per content dataset

## Canonical routes under responsive QA

Canonical routes:

- `/workspace?section=overview`
- `/workspace?section=requests&scope=market`
- `/workspace?section=requests&scope=my`
- `/workspace?section=providers`
- `/workspace?section=stats`
- `/workspace?section=profile`

Canonical route notes:

- `section=reviews` is a legacy alias and normalizes to `section=stats`
- `section=statistics` is redirected to `section=stats`
- `section=analysis` is not a canonical route and should be removed from QA checklists

## Target contract vs current implementation

Target responsive contract for the refactor:

- mobile: `0-767px`
- tablet: `768-1023px`
- desktop: `1024px+`

Current implementation contract found in code:

- mobile behavior: `max-width: 767px`
- tablet behavior: `768-1023px`
- desktop behavior with persistent sidebar and rail: `1024px+`

Impact:

- JS and CSS shell breakpoints are now aligned with the target contract
- Manual browser QA is still required to prove layout quality, spacing, and overflow behavior

## Shell evidence

Primary shell ownership:

- `src/app/workspace/page.tsx`
- `src/features/workspace/shell/WorkspaceRouteShell.tsx`
- `src/features/workspace/WorkspacePageClient.tsx`
- `src/features/workspace/shell/WorkspacePageLayout.tsx`
- `src/features/workspace/shell/WorkspaceShell.tsx`
- `src/features/workspace/shell/WorkspacePageFrame.tsx`

Responsive evidence:

- JS breakpoints:
  - `useMediaMatch('(max-width: 767px)')`
  - `useMediaMatch('(min-width: 1024px)')`
- CSS breakpoints:
  - `@media (max-width: 767px)`
  - `@media (max-width: 1023px)`
  - `@media (min-width: 1024px)`

Stable findings from code:

- `/workspace` resolves through one shared shell path rather than per-section standalone pages
- Mobile uses bottom dock navigation and does not mount the topbar
- Desktop uses persistent sidebar and sticky right rail from `1024px+`
- Requests overlays are rendered inside the workspace flow instead of routing users to a separate full page for normal in-workspace actions

## Responsive matrix

### Shell matrix by viewport

| Viewport | Expected shell                                                                         | Current shell from code                                                        | Status                                      | Notes                                                                   |
| -------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------- |
| `375px`  | mobile single-column, dock/sheet navigation, inline or sheet filters, no duplicate nav | matches mobile contract: no topbar, bottom dock mounted, main column stacked   | Pass on static contract / Pending visual QA | Still needs browser checks for overflow, modal height, CTA reachability |
| `425px`  | mobile single-column, dock/sheet navigation, inline or sheet filters, no duplicate nav | matches mobile contract: no topbar, bottom dock mounted, main column stacked   | Pass on static contract / Pending visual QA | Same manual checks as `375px`                                           |
| `768px`  | tablet drawer/burger nav, visible topbar, stacked rail, compact filters                | matches tablet contract: topbar + drawer path, single-column page frame        | Pass on static contract / Pending visual QA | Needs browser check for drawer, filters sheet, and rail order           |
| `1024px` | desktop persistent left sidebar, visible topbar, right rail beside content             | matches desktop contract: sidebar rendered, drawer hidden, rail beside content | Pass on static contract / Pending visual QA | Needs browser checks for spacing rhythm and sticky rail behavior        |
| `1280px` | desktop persistent sidebar and right rail                                              | matches desktop contract: sidebar rendered, drawer hidden, rail sticky         | Pass on static contract / Pending visual QA | Needs browser checks for spacing rhythm and sticky rail behavior        |
| `1440px` | desktop persistent sidebar and right rail                                              | matches desktop contract: sidebar rendered, drawer hidden, rail sticky         | Pass on static contract / Pending visual QA | Needs browser checks for max-width, balance, and whitespace             |

### Shared route applicability

Because the following sections all render through `WorkspacePageLayout -> WorkspaceShell`, the shell finding above applies to all of them:

- `overview`
- `requests` market scope
- `requests` my scope
- `providers`
- `stats`
- `profile`

That means shell-level responsive regressions will affect all major workspace sections and should be validated once at the shell level before route-specific QA.

## Invariants checked for responsive QA

### Proven by code or tests

- One shared workspace shell remains the entrypoint for the checked sections
- Mobile/tablet overlay navigation and desktop sidebar are mutually exclusive in the shell contract
- Guest/private requests state is normalized through route state instead of separate page shells
- Private navigation items such as `Angebote` and `Aufträge` are visibility-gated by auth and role
- Legacy `reviews` and `statistics` aliases normalize to `stats`

### Not yet proven without browser QA

- No horizontal overflow at `375px`, `425px`, `768px`, `1024px`, `1280px`, `1440px`
- No overlapping cards in overview, requests, providers, stats, and profile
- Context/filter controls remain usable with real content density
- Dialogs and overlays fit the viewport in all responsive states
- Right rail never appears duplicated with mobile rail variants
- Primary CTA remains reachable above the mobile dock and inside overlay states

## Findings

### F1. Manual responsive proof is still missing

Severity: high

Evidence:

- Automated tests prove shell composition and route normalization
- Breakpoint logic is now aligned in both JS and CSS
- No browser-based responsive audit has yet been executed

Impact:

- Overflow, clipping, sticky collisions, and card overlap are still unproven in a real browser

### F2. The QA checklist used a non-canonical `analysis` route

Severity: medium

Evidence:

- Navigation config routes `Analyse` to `/workspace?section=stats`
- Route shell tests normalize `section=reviews` and redirect `section=statistics`
- No canonical `section=analysis` route is defined

Impact:

- Future QA evidence can become inconsistent if checklists keep mixing UI labels with route names

### F3. Visual route density is still unverified under real content

Severity: medium

Evidence:

- Static audit proves shell ownership and route normalization
- The project still needs viewport smoke tests with real rendered sections

Impact:

- Per-section layout quality is not yet proven for production hardening

## Exit criteria for Responsive QA

Responsive QA can be considered complete only when all of the following are true:

- Canonical routes are used consistently in QA docs and tests
- Manual browser smoke is completed for `375`, `425`, `768`, `1024`, `1280`, `1440`
- Each checked section passes:
  - no horizontal overflow
  - no duplicate nav
  - usable filters
  - overlays fit viewport
  - primary CTA remains accessible

## Recommended next steps

1. Replace `analysis` with `stats` in the remaining QA and audit docs.
2. Perform manual browser responsive smoke on the six canonical viewports.
3. Record route-by-route findings for `overview`, `requests`, `providers`, `stats`, and `profile`.
4. Only after that proceed to route QA and visual consistency QA.
