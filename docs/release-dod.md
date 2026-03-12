# Release Definition of Done (DoD)

This checklist is the mandatory release gate for the frontend repository (`frontend-de-cizhen`).
Backend-specific controls (NestJS, MongoDB, Redis operations) must be validated in the backend repository before production rollout.

## MUST (blocking)

1. Build and runtime stability
- `npm run release:check` passes.
- Production build is generated with webpack mode (`npm run build:webpack`) as release baseline.
- No unresolved runtime crashes on core routes (`/`, `/workspace`, `/requests/[id]`, `/chat`).

2. Environment and secrets
- Secrets are provided via environment variables only.
- `.env.local.example` is up to date and documents required runtime values.
- Runtime environment validation passes (`src/lib/config/env.server.ts`).
- In production, at least one backend base is set: `API_BASE_URL` or `NEXT_PUBLIC_API_BASE`.

3. API resilience and UX states
- Critical frontend flows have explicit `loading`, `empty`, and `error` states.
- API errors are surfaced safely (no stack traces in UI).
- Request correlation header (`x-request-id`) is sent for API calls.

4. Security baseline (frontend scope)
- No hardcoded secrets in code or logs.
- Cookie/session helper code does not weaken browser defaults unexpectedly.
- Consent and legal links are accessible from runtime UI.

5. Test baseline
- Unit/component tests for changed critical modules pass.
- Critical E2E flow passes in CI (`test:e2e:critical`).
- Accessibility smoke checks pass in CI (`test:e2e:a11y`).

## SHOULD (strongly recommended)

1. Architecture and maintainability
- Keep business logic in services/view-models, not in pure UI components.
- Avoid monolithic files; prefer feature decomposition and utilities.
- Keep DTO mapping deterministic and test-covered.

2. Observability
- Preserve `x-request-id` propagation from frontend to backend.
- Verify release logs for noise, sensitive data leaks, and unresolved warnings.

3. Performance and UX quality
- Avoid unnecessary refetches and duplicate network calls.
- Keep layout stable across desktop/mobile breakpoints.

## NICE TO HAVE

1. Contract checks against backend OpenAPI.
2. Extra E2E flows for auth, workspace stats, and favorites.
3. Automated visual regression snapshots for high-change dashboard sections.

## Release Commands

```bash
npm run release:check
```

Optional (local confidence):

```bash
npm run test:e2e:critical
npm run test:e2e:a11y
```

## Backend Cross-Repo Gate (required before prod)

Validate in backend repository:
- DTO validation and unified error contract
- AuthZ checks on server side
- CORS/rate-limit/session hardening
- Mongo indexes + unique constraints
- Redis cache TTL/invalidation/fallback behavior
- `/health`, graceful shutdown, structured logs
