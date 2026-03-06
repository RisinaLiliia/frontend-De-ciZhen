# Changelog

All notable changes to this project will be documented in this file.

## [0.3.2] - 2026-03-06

### Added
- Workspace private flow hook tests:
  - `useWorkspacePrivateSources.test.tsx`
  - `useWorkspacePrivateInteractions.test.tsx`
- New feature modules for page/model decomposition:
  - `ProfileBioSection`, `ProfileSettingsSection`
  - `useProviderPublicProfileModel`
  - `workspaceViewModel.types/private/public`
- New split CSS layers:
  - `home-content-layout.css`
  - `requests-provider.css`
  - `requests-shell-status.css`
  - `components-core-mobile-nav.css`
  - `components-ui-location-picker.css`

### Changed
- Refactored large files into smaller orchestration + section/model modules:
  - `ProfileWorkspacePage.tsx`
  - `providers/[id]/page.tsx`
  - `useWorkspaceViewModel.ts`
- Normalized shared CSS color formulas via design tokens.
- Hardened CI workflow behavior for PR checks and reduced duplicate runs.
- Tightened type contracts in workspace interactions (`ReadonlySet`).

### Fixed
- Restored deterministic PR checks flow (`quality`) for branch protection.

