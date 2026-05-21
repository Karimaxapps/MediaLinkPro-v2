---
name: seed-stub-company
description: >
  Step-by-step playbook for seeding a stub company (organization + products) into the
  MediaLinkPro-v2 Supabase database with a validated logo image. Invoke this skill
  whenever the user says things like "add [Company] as a stub", "seed [Company]",
  "create a stub entry for [Company]", "insert [Company] into the DB", or "I want to
  add [Company] to the directory". Also use it proactively whenever you are writing or
  updating a seed_demo_*.mjs script.
---

# Seed a Stub Company — Full Playbook

A _stub company_ is an organization seeded without a real user account — visible in the
directory and claimable by the real company later. Each stub needs:

- A **clean square logo** stored in Supabase Storage (not a hot-linked external URL).
- An **organization row** with correct metadata.
- One or more **product rows** linked to the org.
- A reusable **`scripts/seed_demo_{slug}.mjs`** that can re-run safely (upsert-safe).

---

## Step 1 — Gather Company Data

Collect before writing any code:

| Field           | Example                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| `name`          | Shure                                                                    |
| `slug`          | shure (lowercase, hyphens only)                                          |
| `type`          | Manufacturer / Distributor / Service Provider / Platform                 |
| `main_activity` | Broadcast Audio                                                          |
| `tagline`       | 1-sentence brand line                                                    |
| `description`   | 2-3 sentence company overview (founding year, HQ, flagship products)     |
| `website`       | https://www.shure.com                                                    |
| Social handles  | Facebook page name, X/Twitter handle, LinkedIn company URL slug          |
| Products        | Name, slug, short description, description (HTML), external URL for each |

---

## Step 2 — Find the Logo (Priority Order)

The goal is a **square, clean, brand-official image** stored on Supabase Storage.
Work through these sources in order — stop as soon as one succeeds.

### 2a. Facebook Graph API (best: always square, always brand-official)

```
https://graph.facebook.com/{facebook-page-name}/picture?type=square&width=400&redirect=false
```

This returns JSON like `{"data":{"url":"https://...","is_silhouette":false}}`.
The `url` in the response is the actual image URL to download.

**Test it:**

```bash
curl -s "https://graph.facebook.com/shure/picture?type=square&width=400&redirect=false"
```

If `is_silhouette` is `false`, this is a real logo image — use it.
Download the image from the returned `url` field (not the API endpoint itself).

### 2b. X / Twitter Profile Image

Go to the company's Twitter/X page. Right-click the profile picture → "Open image in new tab".
The URL pattern is:

```
https://pbs.twimg.com/profile_images/{numeric-id}/{hash}_400x400.jpg
```

Always request the `_400x400` variant (replace `_normal` with `_400x400` in the URL if needed).

### 2c. LinkedIn Company Page

Navigate to the company's LinkedIn page. The logo URL pattern is:

```
https://media.licdn.com/dms/image/{hash}/company-logo_200_200/{hash2}/{timestamp}/{slug}/{filename}
```

LinkedIn blocks direct server-side fetch (403). If you need to use a LinkedIn logo,
copy the URL from the browser's network tab and store it directly — do not attempt
a server-side download.

### 2d. Wikimedia Commons (secondary — for well-known brands)

Wikimedia is rate-limited server-side. The file paths are non-obvious and must be
looked up via API — never guess them.

**Step 1 — Find the correct filename:**

```
https://en.wikipedia.org/w/api.php?action=query&titles={Company}&prop=images&format=json
```

Look for the `.svg` entry in `pages[*].images[*].title` (e.g., `File:Shure Logo 2024.svg`).

**Step 2 — Get the direct URL:**

```
https://commons.wikimedia.org/w/api.php?action=query&titles=File:{filename}&prop=imageinfo&iiprop=url&format=json
```

This returns the canonical URL with the correct hash path (e.g., `5/5d/`). You cannot
derive this path from the filename — always use the API.

**Step 3 — For SVGs, use a pre-generated PNG thumbnail:**

SVG thumbnails at 1200px are never pre-generated → HTTP 400.
Use the `page/summary` REST API to find a size that actually exists:

```
https://en.wikipedia.org/api/rest_v1/page/summary/{Company}
```

The `thumbnail.source` field returns a pre-generated thumbnail URL (e.g., `960px`).

**Important:** Wikimedia rate-limits server-side requests (HTTP 429). Always wait
1500ms between requests. If rate-limited, fall back to storing the direct Wikimedia
URL as a string in the DB — it renders fine in browsers.

### 2e. Company Website / Press Kit

Last resort. Company logos on websites are often on colored backgrounds or in wide
banner format. If you must use one, prefer URLs from press/media kit pages.

---

## Step 3 — Validate & Upload the Logo

### Validate

Before uploading, verify the URL returns a valid image:

```js
const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "..." } });
// Must be: res.ok && res.headers.get('content-type').startsWith('image/')
// Buffer must be > 1024 bytes
```

### Upload to Supabase Storage

**Org logo path convention:**

```
logos/{Date.now()}_{slug}_{random8chars}.{ext}
```

Bucket: `organizations` (public)

```js
async function uploadOrgLogo({ buf, contentType, slug }) {
  const ext = (contentType.split("/")[1] ?? "png")
    .replace("jpeg", "jpg")
    .replace("+xml", "")
    .split(";")[0];
  const filePath = `logos/${Date.now()}_${slug}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from("organizations")
    .upload(filePath, buf, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from("organizations").getPublicUrl(filePath).data.publicUrl;
}
```

**Product image path convention:**

```
products/{product-slug}/logo_{Date.now()}_0.{ext}
```

Also in the `organizations` bucket (project convention — not the `products` bucket).

### Rate-limit fallback

If all download attempts fail due to rate limiting, store the direct URL string in the
DB instead of a Supabase Storage URL:

```sql
UPDATE organizations SET logo_url = 'https://...' WHERE slug = 'company-slug';
```

The direct URL will render correctly in browsers even though it's not on Supabase Storage.

---

## Step 4 — Write the Seed Script

Create `scripts/seed_demo_{slug}.mjs`. Use `scripts/seed_demo_haivision.mjs` as the
canonical template. Key requirements:

### Must-haves

1. **Upsert-safe** — use `{ onConflict: 'slug' }` for orgs, `{ onConflict: 'organization_id,slug' }` for products.
2. **Preserve existing Supabase logos on re-run:**

```js
const { data: existing } = await supabase
  .from("organizations")
  .select("logo_url")
  .eq("slug", "company-slug")
  .maybeSingle();

if (
  existing?.logo_url &&
  !existing.logo_url.includes("unsplash.com") &&
  !existing.logo_url.includes("wikimedia.org")
) {
  logoUrl = existing.logo_url; // already in Supabase Storage — keep it
} else {
  // download + upload fresh
}
```

3. **Product image fallback to first candidate URL** (not org logo):

```js
let productLogo = candidates?.[0] ?? logoUrl;
if (candidates) {
  try {
    await new Promise((r) => setTimeout(r, 1500));
    const { buf, contentType } = await downloadImage({ candidates, label: product.slug });
    productLogo = await uploadProductImage({ buf, contentType, productSlug: product.slug });
  } catch {
    console.log(`   ⚠️  Download failed — storing direct URL: ${productLogo}`);
  }
}
```

4. **`is_stub: true`** and **`claimed_at: null`** on every org upsert.
5. **`seeded_by: ADMIN_USER_ID`** — use the constant `'b713cc88-78fa-472a-bb8a-46eef3c1d5ea'`.
6. **`source: 'admin_seed'`** on org upsert.
7. **`crypto.randomUUID()`** for product `id` fields (Supabase does not auto-generate these in upsert mode).

### Script structure (skeleton)

```js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
// IMPORTANT: run from repo root (C:\dev\MediaLinkPro-v2), not from scripts/

const ADMIN_USER_ID = "b713cc88-78fa-472a-bb8a-46eef3c1d5ea";

const LOGO_CANDIDATES = [
  /* primary URL first, then fallbacks */
];
const PRODUCT_IMAGES = {
  "company-product-slug": [
    /* candidates */
  ],
};

// ... downloadImage, uploadOrgLogo, uploadProductImage helpers (copy from haivision) ...

async function runSeed() {
  // 1. Resolve logo
  // 2. Upsert organization
  // 3. For each product: resolve image → upsert product
  // 4. Print summary
}
runSeed();
```

---

## Step 5 — Run the Script

**Always run from the repo root** (so `.env.local` resolves correctly):

```bash
# From C:\dev\MediaLinkPro-v2
node scripts/seed_demo_{slug}.mjs
```

If running a script that lives in the worktree:

```bash
node ".claude/worktrees/{worktree-name}/scripts/seed_demo_{slug}.mjs"
```

---

## Step 6 — Verify in the Database

After running, confirm all rows are correct:

```sql
-- Check org
SELECT id, slug, name, logo_url, is_stub, claimed_at
FROM organizations
WHERE slug = 'company-slug';

-- Check products
SELECT p.slug, p.name, p.logo_url, p.status
FROM products p
JOIN organizations o ON p.organization_id = o.id
WHERE o.slug = 'company-slug';
```

All `logo_url` values should contain either `supabase.co` (uploaded) or a valid direct
image URL (rate-limit fallback). Test each URL returns HTTP 200 with an image content type.

---

## Step 7 — Commit

Stage only the new/modified seed scripts (never commit `.env.local` or `settings.local.json`):

```bash
git add scripts/seed_demo_{slug}.mjs
git commit -m "feat(seed): add {CompanyName} stub seed script"
```

If a `fix_*.mjs` utility was created, add it too if it should be reusable.
Discard ephemeral retry scripts: `git checkout scripts/fix_*_retry.mjs`.

---

## Quick Reference — Logo Source Decision Tree

```
1. Try Facebook Graph API → clean square, always works if page exists
2. Try X/Twitter profile image → square, copy URL from browser
3. Try LinkedIn company logo → may need to copy URL manually (server fetch blocked)
4. Try Wikimedia Commons → use API to find correct filename + hash path
5. Use company website / press kit → last resort, may be on colored background
6. Rate-limited? → store direct URL string in DB (renders fine in browser)
```

## Image Quality Checklist

Before storing any logo URL, verify:

- [ ] Square or near-square aspect ratio
- [ ] Clean background (transparent, white, or solid brand color)
- [ ] Minimum 300×300px resolution
- [ ] HTTP 200 response
- [ ] `Content-Type` starts with `image/`
- [ ] Buffer size > 1 KB
