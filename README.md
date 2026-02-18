# De’ciZhen Frontend

Next.js 16 frontend for De’ciZhen marketplace/workspace.

## Stack
- Next.js 16 (App Router)
- React 19 + TypeScript
- Zustand (auth/store state)
- React Query
- React Hook Form + Zod
- Tailwind CSS
- `react-markdown` (legal pages rendering)

## Key UX Areas
- Unified workspace route: `/orders` (tab-based flow)
- Unified profile route: `/profile/workspace`
- Auth as modal-routes (canonical):
  - `/auth/login`
  - `/auth/register`
- OAuth Google/Apple integrated in auth flow
- Legal pages:
  - `/privacy-policy`
  - `/cookie-notice`

## Auth Notes
- Email/password login/register via backend `/auth/*`
- Social login buttons call backend OAuth start endpoints
- If OAuth requires explicit consent, frontend completes flow via:
  - `POST /auth/oauth/complete-register`
- Consent links in register form are driven by:
  - `NEXT_PUBLIC_PRIVACY_POLICY_URL`
  - `NEXT_PUBLIC_COOKIE_NOTICE_URL`

## Quick Start
Prerequisites:
- Node.js >= 20.9.0 (required by Next.js 16.1.6)

Install:
```bash
npm install
```

Create local env:
```bash
cp .env.local.example .env.local
```

If no template exists, set at least:
```env
API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_PRIVACY_POLICY_URL=/privacy-policy
NEXT_PUBLIC_COOKIE_NOTICE_URL=/cookie-notice
```

Run dev:
```bash
npm run dev
```

Build:
```bash
npm run build
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`

## Project Notes
- Public requests list remains under `/requests`.
- Authenticated workspace actions are under `/orders`.
- Legal pages load markdown content from backend legal endpoints.
