---
name: seed-stub-company
description: >
  Autonomous workflow for seeding a stub company into MediaLinkPro-v2 with one command.
  Invoke this skill whenever the user gives a company name and wants it added to the
  directory — phrases like "seed [Company]", "add [Company] as a stub", "insert [Company]",
  "create a stub for [Company]", or simply types a brand name after invoking the skill.
  The skill researches the company, finds a real logo, inserts the organization + at least
  one product/service with a valid image, and a job offer if one is available — all
  autonomously without asking the user for data.
---

# Seed a Stub Company — Autonomous Workflow

**Input:** company name only.
**Output:** organization row + ≥1 product row + optional job row — all in the DB, verified.

Do not ask the user for data. Research everything yourself, then insert.

---

## Phase 1 — Research the Company

Use `WebSearch` and `WebFetch` to gather:

| What                                          | Where to look                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Official name, founding year, HQ city/country | Wikipedia, company website About page                                                 |
| One-line tagline                              | Website header, LinkedIn headline                                                     |
| 2–3 sentence description                      | Wikipedia intro paragraph (best) or About page                                        |
| `type`                                        | Manufacturer / Distributor / Service Provider / Platform / Broadcaster                |
| `main_activity`                               | Pick from: Broadcast Audio, IP Video, Post-Production, Cloud Media, Live Events, etc. |
| Facebook page name                            | Search `{Company} site:facebook.com` or check website footer                          |
| X/Twitter handle                              | Website footer, Wikipedia infobox, or search `{Company} site:x.com`                   |
| Website URL                                   | Wikipedia, search result                                                              |
| 1–2 flagship products or services             | Wikipedia Products section, website nav, press releases                               |
| Current job openings                          | `{Company} careers jobs site:{company-website}`, LinkedIn jobs                        |

Aim to complete research in one or two WebSearch + WebFetch calls. Wikipedia is the
fastest single source for name, description, founding year, and social handles.

---

## Phase 2 — Find & Upload the Logo

The logo must be **square, clean, and uploaded to Supabase Storage** — never store
external social-media CDN URLs directly in the DB (they can expire).

Work through sources in this order. Stop at the first success.

### A. Facebook Graph API (always try first)

```
GET https://graph.facebook.com/{facebook-page-name}/picture?type=square&width=400&redirect=false
```

This returns JSON — **not** the image. Extract `.data.url`, then download _that_ URL.

```js
const apiRes = await fetch(
  `https://graph.facebook.com/${fbPageName}/picture?type=square&width=400&redirect=false`
);
const { data } = await apiRes.json();
// data.is_silhouette === false → real logo
// data.url → fbcdn.net image — download this and upload to Supabase
const imgRes = await fetch(data.url, { headers: FETCH_HEADERS });
const buf = Buffer.from(await imgRes.arrayBuffer());
logoUrl = await uploadOrgLogo({ buf, contentType, slug });
```

`fbcdn.net` URLs carry expiring tokens — download the bytes immediately and upload.

### B. X / Twitter Profile Image

Find the `_400x400.jpg` variant of the company profile picture:

- Visit the X page → right-click profile image → "Open image in new tab"
- URL pattern: `https://pbs.twimg.com/profile_images/{id}/{hash}_400x400.jpg`
- `pbs.twimg.com` URLs are stable — download → upload normally.

### C. Wikimedia Commons (well-known brands only)

File paths cannot be guessed. Always use the API:

1. Find filename: `https://en.wikipedia.org/w/api.php?action=query&titles={Company}&prop=images&format=json`
   → look for the `.svg` or `.png` logo in `pages[*].images[*].title`

2. Get URL: `https://commons.wikimedia.org/w/api.php?action=query&titles=File:{filename}&prop=imageinfo&iiprop=url&format=json`

3. For SVGs, never use 1200px thumbnails (they return HTTP 400). Use the pre-generated
   size from `https://en.wikipedia.org/api/rest_v1/page/summary/{Company}` → `thumbnail.source`.

4. Wait 1500 ms between Wikimedia requests to avoid HTTP 429.

### D. LinkedIn / Company Website

LinkedIn CDN blocks server-side fetch (403) — storing the direct URL is acceptable
since LinkedIn logos are long-lived. Company website logos are a last resort (often on
colored backgrounds or in non-square format).

### Upload convention

```
Bucket  : organizations (public)
Org logo: logos/{Date.now()}_{slug}_{random8}.{ext}
Product : products/{product-slug}/logo_{Date.now()}_0.{ext}
```

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

async function uploadProductImage({ buf, contentType, productSlug }) {
  const ext = (contentType.split("/")[1] ?? "jpg")
    .replace("jpeg", "jpg")
    .replace("+xml", "")
    .split(";")[0];
  const filePath = `products/${productSlug}/logo_${Date.now()}_0.${ext}`;
  const { error } = await supabase.storage
    .from("organizations")
    .upload(filePath, buf, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from("organizations").getPublicUrl(filePath).data.publicUrl;
}
```

**If every download attempt fails:** store the source URL string directly in the DB as
a fallback — it will render in browsers. Never let an image failure abort the whole seed.

---

## Phase 3 — Cover / Header Image

Set `cover_image_url` to a random abstract Unsplash photo. No research needed — just
rotate through this list so different companies look distinct:

```js
const ABSTRACT_COVERS = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop", // circuit board
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop", // blue globe
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop", // server room
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop", // abstract waves
  "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&auto=format&fit=crop", // radio / broadcast
  "https://images.unsplash.com/photo-1598387993441-a364f854cfdd?w=1600&auto=format&fit=crop", // audio waveform
];
const coverImageUrl = ABSTRACT_COVERS[Math.floor(Math.random() * ABSTRACT_COVERS.length)];
```

Store the Unsplash URL directly — no Supabase upload needed.

> **Note:** `cover_image_url` may not yet be a column on `organizations`. Check the
> TypeScript types before writing it. If it doesn't exist, add a `// TODO: add cover_image_url` comment
> in the script and skip the field in the upsert.

---

## Phase 4 — Find Product / Service Image

For each product, search for a valid image in this order:

1. Wikimedia Commons (best for well-known hardware — e.g., `Shure SM7B site:commons.wikimedia.org`)
2. Official product press kit / media page on the company website
3. Org logo as the absolute last resort

Download → upload to Supabase Storage using `uploadProductImage`.
If download fails: store the source URL directly (same pattern as logo fallback).

### Product type & category mapping

Use the closest match from this taxonomy:

| product_type | main_category examples                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| `Hardware`   | Audio Production & Radio, Capture & Acquisition, Infrastructure & Transmission                          |
| `Software`   | Post-Production & Editing, Management & Orchestration, Monetization & Ad Tech                           |
| `Cloud`      | Cloud Production & Collaboration, Storage & Active Archive, Cloud Playout & Virtual Distribution        |
| `Hybrid`     | Hybrid Remote Production, Edge Video Processing                                                         |
| `Service`    | Production Facilities & Rental, Integration & Engineering Services, Professional Training & Consultancy |

Pick `sub_category` from `src/features/products/constants.ts` or use `'Other'` if nothing fits.

---

## Phase 5 — Find a Job Offer (optional)

Search the company's careers page and/or LinkedIn for **currently open** positions.
Prefer roles that match the broadcast/media tech industry context.

If found, collect:

- `title` — exact job title (e.g., "Senior Broadcast Engineer")
- `department` — e.g., Engineering, Sales, Marketing, Product
- `location` — city + country, or "Remote"
- `is_remote` — boolean
- `job_type` — one of: `full_time`, `part_time`, `contract`, `freelance`, `internship`, `temporary`
- `description` — 2–4 bullet point summary of responsibilities (HTML `<ul><li>` format)
- `skills` — array of relevant skills strings, e.g. `['SMPTE ST 2110', 'NDI', 'Dante']`

If no live posting is found, skip the job — do not invent one.

---

## Phase 6 — Write the Seed Script

Create `scripts/seed_demo_{slug}.mjs`. Model it on `scripts/seed_demo_haivision.mjs`.

### Mandatory fields — Organization

```js
{
    name: 'Company Name',
    slug: 'company-slug',                        // lowercase, hyphens only
    logo_url: logoUrl,                           // Supabase Storage URL
    cover_image_url: coverImageUrl,              // Unsplash abstract (if column exists)
    tagline: '...',
    type: 'Manufacturer',                        // or Distributor / Service Provider / Platform / Broadcaster
    main_activity: 'Broadcast Audio',
    description: '...',                          // 2–3 sentences
    website: 'https://...',
    is_stub: true,
    claimed_at: null,
    source: 'admin_seed',
    seeded_by: ADMIN_USER_ID,                    // 'b713cc88-78fa-472a-bb8a-46eef3c1d5ea'
    updated_at: new Date().toISOString(),
}
// onConflict: 'slug'
```

### Mandatory fields — Product

```js
{
    id: crypto.randomUUID(),                     // required — not auto-generated in upsert
    organization_id: orgId,
    name: 'Product Name',
    slug: 'org-slug-product-slug',
    short_description: '...',                    // one sentence
    description: '<p>...</p><ul><li>...</li></ul>', // HTML, 3–5 bullet specs
    logo_url: productLogoUrl,                    // Supabase Storage URL (or fallback direct URL)
    product_type: 'Hardware',                    // Hardware / Software / Cloud / Hybrid / Service
    main_category: 'Audio Production & Radio',
    sub_category: 'Microphones & Transducers',   // or 'Other'
    external_url: 'https://...',
    support_url: 'https://...',
    documentation_url: 'https://...',
    availability_status: 'Available',
    price: null,
    currency: 'USD',
    price_upon_request: true,
    pricing_model: 'Custom Quote',
    is_public: true,
    status: 'published',
    views_count: Math.floor(Math.random() * 6000) + 1500,
    bookmarks_count: Math.floor(Math.random() * 150) + 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}
// onConflict: 'organization_id,slug'
```

### Mandatory fields — Job (if found)

```js
{
    id: crypto.randomUUID(),
    organization_id: orgId,
    title: 'Senior Broadcast Engineer',
    slug: 'senior-broadcast-engineer-company-slug',  // title-slug + '-' + org-slug
    description: '<ul><li>...</li><li>...</li></ul>',
    job_type: 'full_time',                       // full_time / part_time / contract / freelance / internship / temporary
    status: 'open',
    location: 'Berlin, Germany',
    is_remote: false,
    department: 'Engineering',
    skills: ['SMPTE ST 2110', 'NDI', 'Python'],
    salary_min: null,
    salary_max: null,
    currency: 'USD',
    expires_at: null,
    posted_by: null,                             // null for stub — no real user
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}
// onConflict: 'slug'  (or insert only — check if job already exists by slug first)
```

### Logo preservation on re-run

```js
const { data: existing } = await supabase
  .from("organizations")
  .select("logo_url")
  .eq("slug", SLUG)
  .maybeSingle();

if (
  existing?.logo_url &&
  !existing.logo_url.includes("unsplash.com") &&
  !existing.logo_url.includes("wikimedia.org") &&
  !existing.logo_url.includes("fbcdn.net")
) {
  logoUrl = existing.logo_url; // already on Supabase Storage — keep it
} else {
  // download + upload fresh
}
```

---

## Phase 7 — Run & Verify

**Always run from the repo root** (so `.env.local` resolves):

```bash
node scripts/seed_demo_{slug}.mjs
```

Then verify:

```sql
-- Org
SELECT id, slug, name, logo_url, is_stub FROM organizations WHERE slug = '{slug}';

-- Products
SELECT p.slug, p.name, p.logo_url, p.status
FROM products p JOIN organizations o ON p.organization_id = o.id
WHERE o.slug = '{slug}';

-- Jobs
SELECT j.title, j.job_type, j.status, j.location
FROM jobs j JOIN organizations o ON j.organization_id = o.id
WHERE o.slug = '{slug}';
```

All `logo_url` values must be either a `supabase.co` URL or a valid external image URL
(not null, not a placeholder).

---

## Phase 8 — Commit

```bash
git add scripts/seed_demo_{slug}.mjs
git commit -m "feat(seed): add {CompanyName} stub — org, products, job"
```

Never commit `.env.local`, `settings.local.json`, or ephemeral retry scripts.

---

## Full Execution Checklist

- [ ] Company researched (name, description, website, socials, type, activity)
- [ ] Logo downloaded from Facebook/X/Wikimedia and uploaded to Supabase Storage
- [ ] Cover image set to abstract Unsplash URL
- [ ] ≥1 product with real image uploaded to Supabase Storage
- [ ] Job searched — inserted if found, skipped if none
- [ ] Seed script runs without errors
- [ ] DB rows verified (org + products + jobs)
- [ ] Committed
