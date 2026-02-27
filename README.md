# De'ciZhen Frontend

Next.js frontend for De'ciZhen marketplace and workspace.

## System Overview
- The frontend is the user-facing layer of the De'ciZhen marketplace.
- It integrates with a modular NestJS backend over REST APIs.
- It supports public browsing, authenticated workspace flows, and role-based UX behavior.

## Design Principles
- Thin route components
- Separation of data layer and presentation layer
- Explicit access control
- Environment-based configuration
- Reusable feature modules

## 1. Tech Stack
- Next.js (App Router)
- React + TypeScript
- Zustand (auth/session state)
- TanStack Query (data fetching + cache)
- React Hook Form + Zod (forms/validation)
- Tailwind CSS + project CSS tokens/themes
- `react-markdown` (legal documents rendering)
- Vitest + Testing Library + JSDOM (unit + component behavior tests)

## 2. Product Routing Model

### Public
- `/` home
- `/?view=orders` public orders explore mode (left-column listing with filters on home shell)
- `/workspace?section=orders` public workspace view (orders)
- `/workspace?section=providers` public workspace view (providers)
- `/requests/[id]` request details
- `/providers/[id]` public provider profile
- no `/orders` route (workspace is served only under `/workspace`)

### Authenticated Workspace
- `/workspace?tab=*` canonical workspace screen (tab-based)
- `/profile/{id}` canonical profile/settings screen (`/profile/workspace` stays as compatibility alias)
- `/chat` unified inbox

### Auth
- `/auth/login`
- `/auth/register`
- modal-route counterparts via `app/@authModal`

### Legal
- `/privacy-policy`
- `/cookie-notice`

## 3. Access Model
- Workspace route is served directly by `src/app/workspace/page.tsx` via `WorkspaceRouteClient`.
- No proxy-based rewrites/redirects are used for `/workspace`.
- Runtime mode selection is client-side:
  - authenticated users: private workspace tabs (`/workspace?tab=*`)
  - guests: public workspace explore (`/workspace?section=*`)

## 4. Architecture Notes

### Home Explore URL Contract
- Home supports two public modes:
  - default: `/`
  - orders explore: `/?view=orders`
- Explore mode keeps top layout and right column, while left column switches to `OrdersExplorer`.
- Filters/pagination are URL-driven in explore mode (`sort`, `page`, `limit`, and filter params) for shareable state.
- Workspace guest explore (`/workspace?section=orders|providers`) uses the same visual shell directly on `/workspace`.

### Workspace/requests page modularization
Goal: keep route files thin and isolate data logic from UI rendering.
This modularization ensures clear separation of concerns and improves testability.

Workspace entrypoint:
- `src/app/workspace/WorkspaceRouteClient.tsx` (auth/guest mode switch)

Private workspace screen:
- `src/app/orders/OrdersPageClient.tsx`

Composable modules:
- `src/features/requests/page/useRequestsPageData.ts` (query/data layer)
- `src/features/requests/page/useContractRequestsData.ts` (contract request mapping/query)
- `src/features/requests/page/useRequestsWorkspaceState.tsx` (workspace KPIs/nav/stats/top providers)
- `src/features/requests/page/useRequestsWorkspaceDerived.ts` (derived lists/view state)
- `src/features/requests/page/useRequestsPageViewModel.ts` (UI props composition)
- `src/features/requests/page/PublicContent.tsx` and `src/features/requests/page/WorkspaceContent.tsx` (render layers)

### Error fallback standard
- Shared helper: `src/lib/api/withStatusFallback.ts`
- Replaces duplicated `403/404` fallback logic across requests/profile flows.

## 5. Environment Configuration
Create local env file:

```bash
cp .env.local.example .env.local
```

Required:

```env
API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_PRIVACY_POLICY_URL=/privacy-policy
NEXT_PUBLIC_COOKIE_NOTICE_URL=/cookie-notice
```

Optional:

```env
NEXT_PUBLIC_DEMO=true
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

Notes:
- Frontend calls backend through `/api/*` rewrites (configured in `next.config.ts`).
- `API_BASE_URL` has priority; `NEXT_PUBLIC_API_BASE` is fallback.

## 6. Local Development
Prerequisites:
- Node.js `>= 20.20.0` (project baseline: `20.20.0`, see `.nvmrc`)

Verify active runtime:

```bash
node -v
```

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Open:
- `http://localhost:3000`

## 7. Quality Gates
Lint:

```bash
npm run lint
```

Unit + component tests:

```bash
npm run test
```

Type check:

```bash
npm exec tsc --noEmit
```

Production build check:

```bash
npm run build
```

Run production locally:

```bash
npm run start
```

## 8. Auth and Consent
- Email/password auth via backend `/auth/*`
- Social auth (Google/Apple) in the same auth flow
- Register form includes explicit legal consent links
- OAuth completion step supported via `POST /auth/oauth/complete-register`

## 9. Legal Content Flow
- Backend provides legal markdown via legal endpoints
- Frontend pages render legal content with `react-markdown`
- URLs for consent links are configurable via env:
  - `NEXT_PUBLIC_PRIVACY_POLICY_URL`
  - `NEXT_PUBLIC_COOKIE_NOTICE_URL`

## 10. Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`
- `npm exec tsc --noEmit`

## 11. License
This project is proprietary. See [LICENSE](./LICENSE).
