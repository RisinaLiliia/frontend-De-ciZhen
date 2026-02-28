# De'ciZhen Frontend

Frontend application for the De'ciZhen local services marketplace.

## Overview

- Built with Next.js App Router (`next@16.1.6`, `react@19.2.3`, TypeScript).
- Provides:
  - public marketplace browsing (`/`, `/workspace?section=*`, `/requests/[id]`, `/providers/[id]`)
  - authenticated workspace (`/workspace?tab=*`, `/chat`, `/profile/*`)
  - auth flows (login/register/forgot/reset + modal intercept routes)
  - request creation, offer handling, contracts, favorites, reviews
- Integrates with backend through frontend-relative `/api/*` and `/presence/*` rewrites.

## Tech Stack

- Next.js App Router + React + TypeScript
- Zustand (auth state)
- TanStack Query (server state/caching)
- React Hook Form + Zod
- Tailwind CSS + custom CSS tokens/themes
- `socket.io-client` (presence)
- `react-markdown` (legal documents)
- Vitest + Testing Library

## Runtime Architecture

- Root providers in `src/app/layout.tsx`:
  - `AppThemeProvider`
  - `I18nProvider` (`de`/`en`, persisted in `localStorage`)
  - `QueryProvider`
  - `AuthProvider` (refresh bootstrap + auth mode memory)
  - `PresenceProvider` (socket + ping for authenticated users)
- API client is centralized in `src/lib/api/http.ts`:
  - bearer access token in memory
  - `401` retry via `/auth/refresh`
  - cookie-based refresh flow (`credentials: include`)
- Workspace runtime switch:
  - route entrypoint: `src/app/workspace/page.tsx`
  - implementation: `src/app/workspace/WorkspaceRouteClient.tsx`
  - authenticated -> `OrdersPageClient`
  - unauthenticated -> home/public workspace shell
- Home region hint uses client-side IP lookup (`https://ipapi.co/json/`) with 24h local cache.

## Routing

### Canonical routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Home page; supports `?view=orders` explore mode |
| `/workspace` | Public/Auth | Unified workspace surface |
| `/requests/[id]` | Public/Auth | Request details, offer interaction |
| `/providers/[id]` | Public/Auth | Public provider profile |
| `/offers/[requestId]` | Public/Auth | Offers for a specific request |
| `/request/create` | Public/Auth | Create request form (submit requires auth) |
| `/chat` | Auth | Inbox |
| `/chat/[threadId]` | Auth | Thread messages |
| `/profile` | Auth | Redirects to `/profile/[id]` (or alias path) |
| `/profile/[id]` | Auth | Profile/workspace settings page |
| `/auth/login` | Public | Login page |
| `/auth/register` | Public | Register page |
| `/auth/forgot-password` | Public | Forgot password page |
| `/auth/reset-password` | Public | Reset password page |
| `/provider/onboarding` | Auth | Provider profile onboarding |
| `/privacy-policy` | Public | Legal document page |
| `/cookie-notice` | Public | Legal document page |

### Legacy compatibility routes (redirects)

- `/client` -> `/workspace?section=orders`
- `/client/requests` -> `/workspace?tab=my-requests`
- `/client/offers` -> `/workspace?tab=my-requests`
- `/client/contracts` -> `/workspace?tab=completed-jobs`
- `/client/profile` -> `/profile`
- `/provider` -> `/workspace?tab=my-offers`
- `/provider/requests` -> `/workspace?section=orders`
- `/provider/contracts` -> `/workspace?tab=completed-jobs`
- `/provider/profile` -> `/profile`
- `/request/new` -> `/request/create`
- `/profile/workspace` remains a compatibility alias route

### Workspace query contract

- Public sections:
  - `section=orders|providers|stats`
- Private tabs:
  - `tab=my-requests|my-offers|completed-jobs|favorites|reviews`
  - `status=all|open|in_progress|completed`
  - `fav=requests|providers`
  - `reviewRole=provider|client`
- Shared listing/filter params:
  - `cityId`, `categoryKey`, `subcategoryKey` (or `serviceKey`), `sort`, `page`, `limit`
  - `sort=date_desc|date_asc|price_asc|price_desc`

## Environment Variables

Start from:

```bash
cp .env.local.example .env.local
```

Core variables:

| Variable | Required | Default / behavior |
| --- | --- | --- |
| `API_BASE_URL` | No (dev fallback exists) | Main backend base for rewrites (`/api`, `/presence`) |
| `NEXT_PUBLIC_API_BASE` | No | Fallback backend base (used by presence and production fallback rewrite base) |
| `NEXT_PUBLIC_PRIVACY_POLICY_URL` | No | `/privacy-policy` |
| `NEXT_PUBLIC_COOKIE_NOTICE_URL` | No | `/cookie-notice` |

Feature flags and behavior:

| Variable | Default | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_DEMO` | `true` (unless explicitly `false`) | Home live/demo counters |
| `NEXT_PUBLIC_HERO_VARIANT` | `animated` | Home hero variant switch |
| `NEXT_PUBLIC_HERO_ANIMATION_MODE` | `subtle` | Hero animation mode (`subtle` or `showcase`) |
| `NEXT_PUBLIC_ENABLE_APPLE_AUTH` | `false` | Enables Apple social auth button |
| `NEXT_PUBLIC_ANALYTICS_SOURCE` | `mock` | Platform analytics source (`mock`/`real`) |
| `NEXT_PUBLIC_ANALYTICS_SEED` | `decizhen-demo-v1` | Seed for deterministic mock analytics |
| `NEXT_PUBLIC_ANALYTICS_FALLBACK_TO_MOCK` | `true` | Fallback behavior when real analytics fails |

Mock data controls:

| Variable | Default | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_REQUESTS_MOCK_MODE` | `off` | Requests source mode: `off`, `only`, `merge` |
| `NEXT_PUBLIC_REQUESTS_MOCK_ENABLED` | `false` | Legacy switch (maps to `only` when mode unset) |
| `NEXT_PUBLIC_REQUESTS_MOCK_COUNT` | `40` | Generated mock requests count |
| `NEXT_PUBLIC_REQUESTS_MOCK_MERGE_FETCH_LIMIT` | `100` (clamped 20..100) | Pool size for merge mode |
| `NEXT_PUBLIC_PROVIDERS_MOCK_MODE` | fallback to requests mode | Providers source mode: `off`, `only`, `merge` |
| `NEXT_PUBLIC_PROVIDERS_MOCK_ENABLED` | `false` | Legacy providers-only switch |
| `NEXT_PUBLIC_PROVIDERS_MOCK_COUNT` | fallback to requests count | Generated mock providers count |

Presence and image optimization:

| Variable | Default | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_PRESENCE_WS_BASE` | unset | Explicit WS origin for Socket.IO presence |
| `NEXT_IMAGE_UNOPTIMIZED` | auto in dev | Forces `next/image` unoptimized mode |
| `NEXT_IMAGE_OPTIMIZE_DEV` | `false` | Enables optimizer in dev when set to `true` |

## Backend Integration

- Frontend calls use `buildApiUrl()` -> `/api/*`.
- `next.config.ts` rewrites:
  - `/api/:path*` -> `${API_BASE}/:path*`
  - `/presence/:path*` -> `${API_BASE}/presence/:path*`
- Main backend domains used by frontend modules:
  - auth: `/auth/*`, `/users/me`
  - catalog: `/catalog/*`
  - requests/offers/contracts/reviews/favorites/chat
  - providers and availability
  - legal: `/legal/privacy`, `/legal/cookies`
  - analytics: `/analytics/platform-activity`, `/analytics/platform-live-feed`

## Local Development

Prerequisites:

- Node.js `>=20.20.0` (`.nvmrc` is `20.20.0`)

Run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run lint:strict` | ESLint with `--max-warnings=0` |
| `npm run lint:colors:home` | No hardcoded hex colors in `src/styles/home.css` |
| `npm run lint:colors:components` | No hardcoded colors in `src/styles/components.css` (warn mode) |
| `npm run lint:colors:components:strict` | Same check in strict mode |
| `npm run lint:colors:pages` | No hardcoded colors in page style files (warn mode) |
| `npm run lint:colors:pages:strict` | Same check in strict mode |
| `npm run lint:colors` | Combined color checks |
| `npm run test` | Vitest |
| `npm exec tsc --noEmit` | Type check |

## Tests

Current test files:

- `src/components/requests/details/RequestOfferSheet.test.tsx`
- `src/features/auth/AuthRouteModal.test.tsx`
- `src/features/requests/details/viewModel.test.ts`
- `src/features/requests/uiState.test.ts`

For a single non-watch run:

```bash
npm run test -- --run
```

## Project Structure

```text
src/
  app/                 # App Router routes, route groups, modal intercept routes
  components/          # Shared UI and domain components
  features/            # Feature-level modules (auth, request creation, workspace, profile, legal)
  hooks/               # Custom React hooks
  lib/                 # API clients, auth/session, i18n, theme, utilities
  styles/              # Global CSS, tokens, component/page styles
  data/                # Static home page data
  types/               # Shared TypeScript types
scripts/               # Custom lint/check scripts (color guards)
public/                # Static assets and favicon/manifest
```

## License

Proprietary software. See [LICENSE](./LICENSE).
