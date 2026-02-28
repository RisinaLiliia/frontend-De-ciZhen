# De'ciZhen Frontend

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

### Feature Flags (UX / Product)

- `NEXT_PUBLIC_DEMO` (default: `true` unless explicitly `false`)
- `NEXT_PUBLIC_HERO_VARIANT` (default: `animated`)
- `NEXT_PUBLIC_HERO_ANIMATION_MODE` (default: `subtle`)

### Analytics Flags

- `NEXT_PUBLIC_ANALYTICS_SOURCE` (`mock|real`, default: `mock`)
- `NEXT_PUBLIC_ANALYTICS_SEED` (default: `decizhen-demo-v1`)
- `NEXT_PUBLIC_ANALYTICS_FALLBACK_TO_MOCK` (default: `true`)

### Mock / Dev Data

- `NEXT_PUBLIC_REQUESTS_MOCK_MODE` (`off|only|merge`, default: `off`)
- `NEXT_PUBLIC_REQUESTS_MOCK_ENABLED` (legacy flag, default: `false`)
- `NEXT_PUBLIC_REQUESTS_MOCK_COUNT` (default: `40`)
- `NEXT_PUBLIC_REQUESTS_MOCK_MERGE_FETCH_LIMIT` (default: `100`, clamped)
- `NEXT_PUBLIC_PROVIDERS_MOCK_MODE` (fallbacks to requests mock mode)
- `NEXT_PUBLIC_PROVIDERS_MOCK_ENABLED` (legacy flag)
- `NEXT_PUBLIC_PROVIDERS_MOCK_COUNT` (fallbacks to requests mock count)

### Image / Build Behavior

- `NEXT_IMAGE_UNOPTIMIZED`
- `NEXT_IMAGE_OPTIMIZE_DEV`

## Analytics

The frontend emits UX events via `window.dataLayer` when available (`src/lib/analytics.ts`).

Current tracked event names include:
- `home_hero_cta_click`
- `workspace_filter_change`
- `workspace_filter_reset`
- `workspace_empty_result`
- `workspace_tab_change`
- `workspace_status_filter_change`
- `workspace_primary_cta_click`

Platform activity panels can also consume backend analytics endpoints:
- `/analytics/platform-activity`
- `/analytics/platform-live-feed`

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
| `npm run test:e2e:headed` | Playwright headed mode |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm exec tsc --noEmit` | Type check |

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
