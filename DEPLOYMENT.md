# Deploying MediaLinkPro to Hostinger

This is a **Next.js 16 server-rendered application** (uses Server Actions,
dynamic routes, Supabase auth, and the Stripe webhook). It cannot run on
static-only hosting plans. You need one of:

| Hostinger plan                     | Works?               |
| ---------------------------------- | -------------------- |
| Cloud Hosting (Node.js apps)       | ✅                   |
| Cloud Startup / Cloud Professional | ✅                   |
| VPS                                | ✅                   |
| Premium / Business **Web Hosting** | ❌ (no Node runtime) |

If you see "Unsupported framework or invalid project structure" in hPanel,
check the plan first.

## 1. Connect the GitHub repo

1. hPanel → **Hosting** → your domain → **GitHub** → connect your account.
2. Repository: `Karimaxapps/MediaLinkPro-v2`
3. Branch: `main` (after merging `ClaudeCode`) — or `ClaudeCode` for a preview.
4. Auto-deploy on push: ✅

## 2. Configure the Node.js application

In hPanel → **Advanced → Node.js**:

| Setting                  | Value                               |
| ------------------------ | ----------------------------------- |
| Node.js version          | **20.x** (or newer)                 |
| Application root         | path to the cloned repo             |
| Application URL          | your domain                         |
| Application startup file | (leave blank — `npm start` is used) |
| Build command            | `npm install && npm run build`      |
| Start command            | `npm start`                         |

The repo includes:

- `engines.node = ">=20"` in `package.json`
- `.nvmrc` pinned to `20`
- `prepare: husky || true` so `npm install` succeeds even outside a git checkout

## 3. Environment variables

Copy every key from `.env.example` into hPanel → **Node.js → Environment
Variables** and fill in real values. Critical ones:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://your-real-domain.com
NEXT_PUBLIC_APP_URL=https://your-real-domain.com
RESEND_API_KEY
RESEND_FROM_EMAIL=hello@your-real-domain.com
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` MUST be the live origin
(no trailing slash). Open Graph share previews, sitemap, robots.txt,
notification email links, and Stripe redirects all read this value.

## 4. Stripe webhook

Stripe → Developers → Webhooks → Add endpoint:

```
URL    : https://your-real-domain.com/api/webhooks/stripe
Events : checkout.session.completed, customer.subscription.updated,
         customer.subscription.deleted, invoice.paid, invoice.payment_failed
```

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## 5. Supabase

The repo's `supabase/migrations` directory is the source of truth. If you
created the database via the Supabase dashboard with the latest migrations
already applied (everything dated 2026-04-28 and earlier), you're done.
Otherwise apply them in order via the Supabase SQL editor or CLI:

```bash
supabase db push   # if using the Supabase CLI
```

Make sure `is_admin` exists on `profiles` so `/admin` is reachable:

```sql
update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
```

## 6. Image domains

`next.config.ts` whitelists Supabase + Unsplash. If you upload images to a
different origin, add it to `next.config.ts → images.remotePatterns` and
redeploy.

## 7. Troubleshooting

- **"Unsupported framework or invalid project structure"** — your plan
  doesn't support Node.js, or Node version is too old. Switch to a Node.js-
  capable plan and pick Node 20+.
- **Build fails on `npm install`** — usually a `husky`/git issue on shared
  hosting. Set env var `HUSKY=0` or rely on the `prepare: husky || true`
  fallback already in place.
- **OG share previews show wrong domain or no image** — check
  `NEXT_PUBLIC_SITE_URL` and that your image origin is in
  `next.config.ts → images.remotePatterns`.
- **500s on every dynamic route** — Supabase env vars missing or wrong;
  check the Node.js logs in hPanel.
