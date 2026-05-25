# Workspace Final Audit

## Summary

- `PASS` `/workspace` и связанные legacy entry routes (`/orders`, `/client`, `/provider/requests`) сходятся в один route shell: `WorkspaceRoutePage -> WorkspaceRouteShell -> WorkspacePageClient -> WorkspacePageLayout -> WorkspaceShell`.
- `PASS` Основные section ownership boundary для `overview`, `requests`, `providers`, `profile`, `context`, `ai-rail`, `navigation` и `shell` стали заметно чище и предсказуемее после последних refactor-pass.
- `PASS` Verification suite для этого audit pass прошла:
  - `npm run typecheck`
  - `npm run lint:styles`
  - `npm run lint`
  - `npm run test:ci`
  - `npx vitest run src/features/workspace/shell/WorkspaceRouteShell.test.tsx src/features/workspace/shell/WorkspacePageLayout.test.tsx`
  - `npm run build`
- `PASS` Route flow упрощён до реального execution path без ложных branch wrappers: `WorkspacePageClient` использует `useWorkspacePublicBranchModel` / `useWorkspacePrivateBranchModel` напрямую.
- `NEEDS CLEANUP` CSS ownership ещё не доведён до финального состояния: значимая часть statistics styles по-прежнему живёт в `src/styles/features/requests/requests-shell-statistics-*`.
- `DOCUMENTED EXCEPTION` Часть legacy alias / fallback логики пока намеренно сохранена для route compatibility и безопасного перехода со старых query/state path.

## Checked routes

- `PASS` `/workspace?section=overview`
- `PASS` `/workspace?section=requests`
- `PASS` `/workspace?section=requests&scope=my`
- `PASS` `/workspace?section=providers`
- `PASS` `/workspace?section=profile`
- `PASS` `/workspace?section=offers`
- `PASS` `/workspace?section=contracts`
- `PASS` `/workspace?section=analysis`
- `PASS` `/workspace?section=actions`
- `PASS` `/workspace?section=chat`
- `PASS` `/orders`
- `PASS` `/client`
- `PASS` `/provider/requests`

Notes:

- Route audit выполнялся статически по route entrypoints, shell composition, section adapters и query-state flow.
- Полный browser smoke-check всех route/section переходов в sandbox не выполнялся.

## Checked breakpoints

- `PASS` Статически проверен shell contract для:
  - mobile `<768px`
  - tablet `768px–1279px`
  - desktop `>=1280px`
- `NEEDS CLEANUP` Ручной viewport smoke-check на `375`, `425`, `768`, `1024`, `1280`, `1440` не выполнялся в этом audit pass.

## Architecture status

- `PASS` `/workspace` остаётся canonical working shell, а не набором независимых pages.
- `PASS` `/orders`, `/client`, `/provider/requests` монтируют тот же route page entrypoint, а не отдельные shell implementations.
- `PASS` Topbar, sidebar, bottom navigation и page frame контролируются через один layout contract: `WorkspacePageLayout` + `WorkspaceShell`.
- `PASS` Public/private mode используют один shell path и расходятся на уровне branch model/data composition, а не на уровне независимых page shells.
- `PASS` URL query state остаётся центральным driver для section/scope/filter state.
- `NEEDS CLEANUP` `useWorkspaceRouteState` сейчас живёт в `src/features/workspace/context/contextUrlState.ts`, что смазывает ownership между `context` и route/page state.
- `DOCUMENTED EXCEPTION` `useWorkspaceShellLegacyRouting.tsx` и alias mapping в workspace state intentionally keep old route/query aliases alive.

## Responsive shell status

- `PASS` Mobile shell contract разделён от tablet/desktop:
  - mobile использует lower dock navigation
  - tablet использует burger/drawer path
  - desktop использует visible sidebar
- `PASS` Workspace topbar не монтируется на mobile shell path, когда используется нижняя mobile navigation.
- `PASS` Providers/profile/context ownership cleanup уменьшил риск duplicated right-rail/render paths.
- `NEEDS CLEANUP` Без ручной viewport QA нельзя окончательно подтвердить отсутствие всех duplicated branches, horizontal scroll и one-off overflow regressions во всех sections.
- `DOCUMENTED EXCEPTION` Некоторые duplicated render paths на уровне responsive composition могут оставаться намеренно ради stacked rail/mobile slots; они должны оцениваться визуально, а не только статически.

## Design-system status

- `PASS` `src/features/workspace/shared/workspaceSurfaceShell.ts` остаётся canonical surface helper API.
- `PASS` Surface helpers покрывают expected shell variants:
  - `workspacePanelShell`
  - `workspaceCardShell`
  - `workspaceRequestsPanelShell`
  - `workspaceRightRailPanelShell`
  - `workspaceMutedPanelShell`
  - `workspaceElevatedCardShell`
  - `workspaceStatCardShell`
  - `workspaceStatLinkCardShell`
- `NEEDS CLEANUP` В workspace TSX всё ещё есть raw `panel/card` class usage вместо системного surface helper contract.
- `NEEDS CLEANUP` В feature CSS остаются локальные gradients/shadows/color-like declarations; часть из них token-driven и допустима, но overall design-system discipline ещё не везде одинаково строгая.
- `NEEDS CLEANUP` Statistics CSS ownership всё ещё частично сидит в `requests` styles.
- `DOCUMENTED EXCEPTION` Не каждый grep hit по `box-shadow`, `rgba`, `linear-gradient` является bug: часть правил intentional и token-based.

## Legacy/dead-code findings

- `DOCUMENTED EXCEPTION` `useWorkspaceShellLegacyRouting.tsx`
- `DOCUMENTED EXCEPTION` `workspaceRequestsScope.model.ts` legacy alias support
- `DOCUMENTED EXCEPTION` `legacyPublicOverviewData` compatibility path в data/public overview flow
- `DOCUMENTED EXCEPTION` stats compatibility/fallback notes в stats README/model/tests

Reason:

- Эти compatibility branches ещё выглядят сознательными transitional adapters, а не случайным мусором.

## Duplicated render findings

- `PASS` Providers больше не живут одновременно в `explore` и `providers`.
- `PASS` Profile больше не живёт одновременно в `explore` и `profile`.
- `PASS` Contextual rail ownership лучше разделён между `shell`, `ai-rail`, `overview`, `demand-map`.
- `NEEDS CLEANUP` Полное отсутствие duplicated mobile/desktop content trees нельзя закрыть без ручного responsive smoke-check.

## Folder/naming findings

- `PASS` `src/features/workspace/shell/`
- `PASS` `src/features/workspace/page/`
- `PASS` `src/features/workspace/context/`
- `PASS` `src/features/workspace/navigation/`
- `PASS` `src/features/workspace/requests/`
- `PASS` `src/features/workspace/overview/`
- `PASS` `src/features/workspace/ai-rail/`
- `PASS` `src/features/workspace/shared/`
- `PASS` `src/features/workspace/providers/`
- `PASS` `src/features/workspace/profile/`
- `DOCUMENTED EXCEPTION` `src/features/workspace/demand-map/` is a valid shared feature split even though it was not listed in the original target folder map.

- `NEEDS CLEANUP` Suspicious-but-intentional naming hits remain:
  - `context/context.copy.ts`
  - `navigation/workspaceMode.copy.ts`
  - `stats/*copy.ts`

Reason:

- Эти `copy` files выглядят нормально, если команда считает them canonical text catalogs. Их стоит воспринимать как intentional copy ownership, а не как legacy leftovers.

- `PASS` Route/page naming теперь отражает реальный flow: `WorkspaceRoutePage`, `WorkspaceRouteShell`, `WorkspacePageClient`, `WorkspacePageLayout`.

## Remaining risks

- Нет ручного browser QA на обязательных viewport widths.
- Statistics visual/layout ownership всё ещё partially attached to requests CSS files.
- Некоторые raw `panel/card` wrappers ещё обходят central surface helper API.
- Legacy alias routing всё ещё существует; это снижает архитектурную чистоту, хотя и помогает compatibility.
- Route-state ownership между `context` и `page/shell` ещё неидеален.

## Recommended next PRs

1. `refactor(workspace): move route state ownership out of context`
   - перенести `useWorkspaceRouteState` / related route-query helpers ближе к `page` или `shell`

2. `refactor(stats): move statistics CSS out of requests shell styles`
   - довести CSS ownership до исходного target state

3. `refactor(workspace): normalize remaining raw panel/card wrappers`
   - постепенно свести section-level surfaces к `workspaceSurfaceShell.ts`

4. `test(workspace): run manual responsive QA matrix`
   - проверить `375`, `425`, `768`, `1024`, `1280`, `1440`
   - отдельно подтвердить отсутствие duplicated rail/context blocks и overflow regressions
