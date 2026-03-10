# ADR 2026-03-10: Workspace Routing and Reviews Flow

## Status
Accepted

## Context
- Workspace uses both public sections (`section=*`) and private tabs (`tab=*`).
- Legacy query params and partially duplicated reviews state (`reviewRole`) caused unnecessary complexity.
- User reviews composer originally loaded only the first page of completed bookings, which could hide reviewable jobs for active users.

## Decision
1. Treat `tab` as explicit workspace mode only when it is a valid `WorkspaceTab`.
2. Keep public `section` active when `tab` query is invalid or missing.
3. Remove `reviewRole` routing/state branch from workspace flow and keep a single reviews mode.
4. Load reviewable completed bookings via paginated aggregation (`listAllMyBookings`) instead of a single hard limit page.

## Consequences
### Positive
- More robust deeplink behavior (`section` links no longer break on invalid `tab` values).
- Cleaner route contract and lower state complexity in workspace navigation.
- Better UX for heavy users: all completed jobs can be selected for feedback.
- Smaller maintenance surface for reviews and navigation logic.

### Trade-offs
- Aggregated bookings loading may perform multiple API requests for very large histories.
- Legacy `reviewRole` links are now ignored and cleaned from generated URLs.

## Verification
- `lint:strict`, `typecheck`, `test:ci`, and `build` passed after changes.
- Route-state tests cover invalid `tab` fallback behavior.
