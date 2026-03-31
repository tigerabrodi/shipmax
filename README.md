# React + Convex Auth Template

Personal starter for side projects with auth already wired up. Clone it, configure Google OAuth, and start building.

## Quick start

```bash
bun install
npx convex dev          # creates .env.local with CONVEX_DEPLOYMENT and VITE_CONVEX_URL
bun run dev             # start Vite dev server (separate terminal)
```

### Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create an OAuth 2.0 Client ID
2. Add this as an authorized redirect URI: `{CONVEX_SITE_URL}/api/auth/callback/google`
   - Your `CONVEX_SITE_URL` is printed when you run `npx convex dev` (ends in `.convex.site`)
3. Set your env vars:

```bash
# Dev
npx convex env set AUTH_GOOGLE_ID your-client-id
npx convex env set AUTH_GOOGLE_SECRET your-client-secret
npx convex env set IS_DEV true
```

`IS_DEV=true` makes every new user an admin automatically so you can access the admin panel during development. Don't set it in production.

### Production env vars

```bash
npx convex env set --prod AUTH_GOOGLE_ID your-client-id
npx convex env set --prod AUTH_GOOGLE_SECRET your-client-secret
npx convex env set --prod SITE_URL https://your-domain.com
```

`SITE_URL` must be set in production so Convex auth knows where to redirect back to.

## Environment variables

| Variable             | How to set                       | Description                        |
| -------------------- | -------------------------------- | ---------------------------------- |
| `CONVEX_DEPLOYMENT`  | Auto-created by `npx convex dev` | Written to `.env.local`            |
| `VITE_CONVEX_URL`    | Auto-created by `npx convex dev` | Written to `.env.local`            |
| `AUTH_GOOGLE_ID`     | `npx convex env set`             | Google OAuth client ID             |
| `AUTH_GOOGLE_SECRET` | `npx convex env set`             | Google OAuth client secret         |
| `IS_DEV`             | `npx convex env set`             | Set to `true` for dev admin access |
| `SITE_URL`           | `npx convex env set --prod`      | Your production domain (prod only) |

## Auth flow

```
Landing (/) --> Google OAuth --> /dashboard
```

- Authenticated users visiting `/` are redirected to `/dashboard`
- Unauthenticated users visiting `/dashboard` are redirected to `/`
- Admin pages require `isAdmin: true` on the user record

## Route structure

```
src/routes/
├── __root.tsx                          # Auth loading + smart redirects
├── index/route.tsx                     # Landing page + Google sign-in (/)
├── _authenticated/
│   ├── route.tsx                       # Auth guard + CurrentUserProvider
│   ├── dashboard/route.tsx             # Main app page (/dashboard)
│   └── _admin/
│       ├── route.tsx                   # Admin guard + nav header
│       └── admin/
│           ├── components/route.tsx    # Loading component showcase (/admin/components)
│           └── users/route.tsx         # Clear-all-users utility (/admin/users)
```

## What to customize

Search for `// CUSTOMIZE:` comments across the codebase. Key swap points:

- **Project name**: `package.json`, `index.html`, dashboard header, admin header
- **Fonts**: `src/main.tsx` imports, `src/app.css` theme, `src/declarations.d.ts`
- **Colors**: `src/app.css` `@theme` block
- **Auth provider**: `convex/auth.ts` (swap Google for GitHub, etc.)
- **Main route**: Replace `/dashboard` with your app's primary route
- **Schema**: `convex/schema.ts` — add your app's tables and user fields
- **Admin nav**: `src/routes/_authenticated/_admin/route.tsx`
- **Loading animation**: `src/components/loading-screen.tsx`

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `bun run dev`    | Start dev server              |
| `bun run build`  | Type-check + production build |
| `bun run lint`   | Run ESLint                    |
| `bun run tsc`    | Type-check only               |
| `bun run test`   | Run tests with Vitest         |
| `bun run format` | Format with Prettier          |

## Conventions

### Path aliases — always use `@/`

Never use relative imports like `../../components/foo`. Always use the aliases:

```ts
import { Button } from '@/components/button'
import { useAuth } from '@/lib/auth'
import { api } from '@convex/_generated/api'
```

| Alias       | Maps to      | Use for                           |
| ----------- | ------------ | --------------------------------- |
| `@/*`       | `./src/*`    | Components, lib, icons, etc.      |
| `@convex/*` | `./convex/*` | Convex functions, generated types |

### Route structure — folders, not flat files

Every route is a folder with a `route.tsx`. Never use the flat dot-separated naming. The only exception is `__root.tsx` which stays flat per TanStack Router convention.

Page-specific components go in a `-components/` directory next to `route.tsx`. The `-` prefix tells TanStack Router to ignore it.

**Layout routes** use `_prefix` for pathless layouts: `_authenticated/route.tsx` wraps children without adding a URL segment.

## Vercel

`vercel.json` is preconfigured with:

- `installCommand`: `bun install`
- `buildCommand`: `npx convex deploy --cmd 'bun run build'` (deploys Convex functions + builds the frontend)
- SPA rewrites so client-side routing works on all paths

### Production deploy with Convex

1. Go to the [Convex dashboard](https://dashboard.convex.dev) > your project > **Settings**
2. Click **"Generate Production Deploy Key"** and copy it
3. In Vercel > your project > **Settings** > **Environment Variables**, add `CONVEX_DEPLOY_KEY` (Production only)
4. Set production env vars via CLI (see [Production env vars](#production-env-vars) above)
5. Push to main — Vercel will deploy Convex functions and build the frontend in one step

## What's included

- **Vite** with React plugin and auto code-splitting
- **Tailwind v4** as a Vite plugin with a full `@theme` block
- **TanStack Router** with file-based routing
- **Convex** with `@convex-dev/auth` (Google OAuth)
- **motion** for loading animations
- **Vitest** for testing with path aliases matching the app
- **ESLint** with type-checked rules
- **Prettier** with Tailwind class sorting
- **Vercel** config with bun + Convex deploy + SPA rewrites
- **Admin tooling** — component playground + user wipe utility
