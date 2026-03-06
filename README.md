# De'ciZhen Frontend

## Current Release

- Version: `0.3.2`
- Date: `2026-03-06`
- Highlights:
  - large maintainability refactor for profile/provider/workspace modules
  - workspace hook coverage expanded (`sources` and `interactions`)
  - feature CSS split into smaller request/components/home layers
  - PR CI checks stabilized around `quality` status check

## What Is De'ciZhen?

De'ciZhen is a local services marketplace that connects clients and service providers.

Users can:
- create service requests
- receive and compare multiple offers
- communicate in chat
- manage contracts and profile/workspace actions in one interface

## Quick Start

Prerequisites:
- Node.js `>=20.20.0` (`.nvmrc` is `20.20.0`)

Setup:

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open:
- `http://localhost:3000`

## Core User Flows

Client:
1. Create a request (`/request/create`)
2. Receive offers (`/offers/[requestId]` and workspace views)
3. Choose a provider and continue in chat (`/chat`)
4. Complete contract/review flow in workspace (`/workspace?tab=*`)

Provider:
1. Browse public requests (`/workspace?section=orders`)
2. Send offers from request details/workspace
3. Continue communication in chat (`/chat`)
4. Manage contracts/completed jobs in workspace tabs

## Single Source Data Mode (Recommended)

Use one runtime data source (backend DB). Frontend runtime mock feeds were removed.

1. Seed backend data (`Backend-De-ciZhen`):
   - `npm run seed:cities`
   - `npm run seed:services`
   - `npm run seed:providers`
   - `npm run seed:reviews`
   - `npm run seed:demo`

Notes:
- Favorites API accepts only Mongo ObjectId in `targetId`.
- For provider favorites, backend contract is based on provider `userId` identity.
- `seed:providers` fills DB with public provider cards (`seed-provider-<n>@test.com / Password1`).
- If local Redis is not running, run seeds with `REDIS_DISABLED=true`.

## Tech Stack

- Next.js App Router (`next@16`)
- React 19 + TypeScript
- TanStack Query (server state)
- Zustand (auth/session state)
- React Hook Form + Zod
- Tailwind CSS + project CSS tokens/themes
- Socket.IO client (presence)
- Vitest + Testing Library
- Playwright (e2e)

## Routing Model

### Canonical Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Home page |
| `/workspace` | Public/Auth | Unified workspace surface |
| `/requests/[id]` | Public/Auth | Request details |
| `/providers/[id]` | Public/Auth | Public provider profile |
| `/offers/[requestId]` | Public/Auth | Offers for a request |
| `/request/create` | Public/Auth | Create request form (submit requires auth) |
| `/chat` | Auth | Inbox |
| `/chat/[threadId]` | Auth | Thread messages |
| `/profile` | Auth | Redirects to `/profile/[id]` (or alias route) |
| `/profile/[id]` | Auth | Profile/workspace settings |
| `/auth/login` | Public | Login |
| `/auth/register` | Public | Register |
| `/auth/forgot-password` | Public | Forgot password |
| `/auth/reset-password` | Public | Reset password |
| `/provider/onboarding` | Auth | Provider onboarding |
| `/privacy-policy` | Public | Legal |
| `/cookie-notice` | Public | Legal |

### Workspace Query Contract

Public mode:
- `section=orders|providers|stats`

Private mode:
- `tab=my-requests|my-offers|completed-jobs|favorites|reviews`
- `status=all|open|in_progress|completed`
- `fav=requests|providers`
- `reviewRole=provider|client`

Shared listing filters:
- `cityId`, `categoryKey`, `subcategoryKey` (or `serviceKey`)
- `sort=date_desc|date_asc|price_asc|price_desc`
- `page`, `limit`

### Provider Reviews Contract

Provider public profile (`/providers/[id]`) consumes one BFF endpoint:
- `GET /reviews/overview?targetUserId=<id>&targetRole=provider&limit=<n>&offset=<n>&sort=created_desc|rating_desc`

Response is already view-ready:
- paged `items` (review feed)
- `summary.total`
- `summary.averageRating`
- `summary.distribution` (`1..5`)

### Backend-Derived Provider Readiness

- Frontend consumes `providerProfile.isProfileComplete` from backend as the source of truth.
- Field is available from:
  - `GET /providers/me/profile`
  - `PATCH /providers/me/profile`
  - nested `providerProfile` in `POST /offers` and `PATCH /offers/:id`

### Legacy Compatibility Routes

Backward-compatible redirects are still present for older links:
- `/client*`, `/provider*`, `/request/new`, `/profile/workspace`

## Architecture

### Architecture Overview

```text
Next.js Frontend (App Router)
        |
        |  /api/*  and  /presence/*
        v
NestJS Backend (REST + Presence)
        |
        v
Persistence / External services
```

### Runtime Composition

- Root providers in `src/app/layout.tsx`:
  - `AppThemeProvider`
  - `I18nProvider`
  - `QueryProvider`
  - `AuthProvider`
  - `PresenceProvider`
- API access is centralized in `src/lib/api/http.ts`:
  - bearer token in memory
  - `401` retry via `/auth/refresh`
  - cookie-based refresh flow (`credentials: include`)
- `/workspace` is the single workspace runtime entrypoint:
  - authenticated users -> private workspace shell
  - guests -> public workspace shell

## Environment Variables

Start from:

```bash
cp .env.local.example .env.local
```

### Required (Production)

At least one backend base must be available:
- `API_BASE_URL`
- `NEXT_PUBLIC_API_BASE` (fallback source in production scenarios)

### Optional (General)

- `NEXT_PUBLIC_PRIVACY_POLICY_URL` (default: `/privacy-policy`)
- `NEXT_PUBLIC_COOKIE_NOTICE_URL` (default: `/cookie-notice`)
- `NEXT_PUBLIC_ENABLE_APPLE_AUTH` (default: `false`)
- `NEXT_PUBLIC_PRESENCE_WS_BASE` (explicit WS base for presence socket)

### Analytics / Consent

- `NEXT_PUBLIC_ANALYTICS_ENABLED` (default: `false`; set `true` to enable analytics runtime)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4 Measurement ID, e.g. `G-XXXXXXXXXX`)

### Feature Flags (UX / Product)

- `NEXT_PUBLIC_DEMO` (default: `true` unless explicitly `false`)
- `NEXT_PUBLIC_HERO_VARIANT` (default: `animated`)
- `NEXT_PUBLIC_HERO_ANIMATION_MODE` (default: `subtle`)

### Analytics

- Home activity widgets use backend analytics endpoints:
  - `/analytics/platform-activity`
- No frontend analytics mock fallback is used in runtime.

### Image / Build Behavior

- `NEXT_IMAGE_UNOPTIMIZED`
- `NEXT_IMAGE_OPTIMIZE_DEV`

## Analytics

### Product analytics events

The frontend emits UX events via `trackUXEvent` (`src/lib/analytics.ts`).
Events are gated by user consent and are sent only when analytics consent is granted.

Current tracked event names include:
- `home_hero_cta_click`
- `workspace_filter_change`
- `workspace_filter_reset`
- `workspace_empty_result`
- `workspace_tab_change`
- `workspace_status_filter_change`
- `workspace_primary_cta_click`

### Home activity widgets (backend analytics)

Platform activity panels consume backend analytics endpoints:
- `/analytics/platform-activity`

### GDPR / ePrivacy consent behavior

- Optional analytics is disabled by default.
- A global cookie consent banner is shown until the user decides.
- Users can accept all, reject optional, or customize categories.
- Consent can be changed later via:
  - global footer entry `Cookie settings` (public + authenticated pages)
  - profile settings (`/profile/*`) via `Datenschutz & Cookies`
- Consent decision is persisted in browser storage and mirrored to a lightweight consent cookie.

### GA4 setup

1. Set `NEXT_PUBLIC_ANALYTICS_ENABLED=true`.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`.
3. Restart frontend (`npm run dev`).
4. Open the app and grant analytics consent in the banner.

## Deployment

Build and run:

```bash
npm run build
npm run start
```

Notes:
- Node.js 20+ is required
- Backend must be reachable through configured API base env vars
- Next.js rewrites are defined in `next.config.ts` for `/api/*` and `/presence/*`

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run lint:strict` | ESLint with `--max-warnings=0` |
| `npm run lint:colors` | Combined design-token color checks |
| `npm run test` | Vitest (unit/component) |
| `npm run test:e2e` | Playwright e2e tests |
| `npm run test:e2e:critical` | Playwright critical e2e flows (`@critical`) |
| `npm run test:e2e:a11y` | Playwright accessibility smoke flows (`@a11y`) |
| `npm run test:e2e:headed` | Playwright headed mode |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm exec tsc --noEmit` | Type check |

## CI Branch Protection

For `main`, keep these required status checks enabled:
- `Frontend CI / quality`
- `Frontend CI / e2e-critical`

Optional but recommended:
- `Frontend CI / a11y-smoke`

## Project Structure

```text
src/
  app/                 # App Router routes and route groups
  components/          # Reusable UI/domain components
  features/            # Feature modules (auth, requests, profile, legal, etc.)
  hooks/               # Custom React hooks
  lib/                 # API clients, auth/session, i18n, analytics, utilities
  styles/              # Global styles, tokens, component/page styles
  data/                # Static data for home and previews
  types/               # Shared TypeScript types
tests/
  e2e/                 # Playwright end-to-end tests
scripts/               # Repository checks and utility scripts
public/                # Static assets and favicon/manifest files
```

## License

Proprietary software. See [LICENSE](./LICENSE).
