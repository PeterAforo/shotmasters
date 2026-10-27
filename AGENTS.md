# Shot Masters Cue Club

Next.js 16 + Payload CMS 3.92 + Neon Postgres. Snooker club site with inbuilt CMS, table booking (Paystack MoMo deposits), memberships, tournaments, member portal, leaderboard, news, gallery, WhatsApp integration, and a full cinematic animation layer.

## Runbook

```powershell
npm run dev        # next dev --turbopack → http://localhost:3000 (+ /admin)
npm run build      # production build
npm run seed       # demo content → Neon (admin@shotmasters.club / ShotMasters!2026)
npm run generate:types      # payload-types.ts
npm run generate:importmap  # admin import map
```

## Environment gotchas (this machine)

- **Node must be ≥ 24.22.1** (Payload 3.92 engine + undici bug). `nvm use 24.22.1`.
- **`undici` is force-overridden to ^8** in package.json — payload pins 7.30.1 which crashes under tsx on Node 22/24 (`Illegal constructor` CacheStorage bug). Do not remove the override.
- **`tsx` is broken here** for the same undici reason — the payload CLI must run with `--use-swc` (already in scripts). Seed runs via `node --import @swc-node/register/esm-register`.
- **`channel_binding=require` must be stripped** from the Neon DATABASE_URL — node-postgres doesn't support it.
- npm blocks some install scripts (esbuild/@swc/core postinstalls). If tools misbehave: `npm install-scripts approve <pkg>`.

## Architecture

- `src/payload.config.ts` — collections (users, members auth, media→Cloudinary, tables, bookings w/ overlap guard, membership plans+subs, tournaments+entries, rankings, posts, gallery), globals (site-settings, navigation, home-page), Postgres adapter on `DATABASE_URL` (push mode), SEO plugin, Resend email adapter (active when `RESEND_API_KEY` set).
- `src/app/(frontend)/` — public site. `(payload)/` — admin + REST/GraphQL API.
- Bookings: pending_payment → Paystack webhook (`/api/paystack/webhook`, HMAC-SHA512 verified) → confirmed → Resend email. Without PAYSTACK_SECRET_KEY bookings auto-confirm (dev).
- Member auth uses Payload's `members` collection REST endpoints (`/api/members/login`, `/api/members/me`).
- Animations: Lenis+GSAP (SmoothScroll), framer-motion page wipes + preloader + reveals + magnetic/tilt micro-interactions, R3F 8-ball hero (lazy chunk). `prefers-reduced-motion` respected.
- Media: Cloudinary custom adapter (`src/lib/cloudinaryAdapter.ts`) activates only with `CLOUDINARY_*` envs; otherwise local disk (dev only — won't persist on Vercel).

## Env vars

`DATABASE_URL` (Neon pooled) · `PAYLOAD_SECRET` · `NEXT_PUBLIC_SITE_URL` · `NEXT_PUBLIC_WHATSAPP_NUMBER` · `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` · `PAYSTACK_SECRET_KEY` · `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` · `RESEND_API_KEY` · `EMAIL_FROM`

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
