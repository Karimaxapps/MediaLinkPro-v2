---
name: medialinkpro-context
description: >
  Deep project context for MediaLinkPro-v2 — a Next.js 16 SaaS platform for connecting
  media professionals with products and organizations. Use this skill whenever the user
  asks you to add a feature, fix a bug, create a new page, add a database column, write
  a server action, create a component, or do anything else in this codebase. If the user
  mentions anything about MediaLinkPro, a product page, company dashboard, user profile,
  connections, messaging, events, or any other feature in this app — load this skill first
  before touching any code. This skill is your blueprint for how everything is structured
  and how new things should be built.
---

# MediaLinkPro-v2 — Project Context

Working directory: `C:\dev\MediaLinkPro-v2`
Source root: `C:\dev\MediaLinkPro-v2\src`

## Stack at a Glance

| Layer           | Technology                                     |
| --------------- | ---------------------------------------------- |
| Framework       | Next.js 16 (App Router, React 19)              |
| Auth & Database | Supabase (PostgreSQL + Auth + Storage)         |
| UI Components   | shadcn/ui (New York style, Neutral base color) |
| Styling         | Tailwind CSS 4, CSS variables                  |
| Forms           | React Hook Form + Zod                          |
| Server state    | React Query (@tanstack/react-query)            |
| Icons           | Lucide React                                   |
| Rich text       | TipTap                                         |
| Toasts          | Sonner                                         |
| QR codes        | qrcode.react                                   |

TypeScript path alias: `@/*` → `./src/*`

---

## Repository Layout

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── (public)/         # Landing pages, no auth required
│   ├── (auth)/           # Login, signup, onboarding routes
│   │   ├── auth/
│   │   └── onboarding/
│   └── (app)/            # Protected routes (auth required)
│       ├── layout.tsx    # App shell: sidebar, header, auth gate
│       ├── dashboard/    # Main feed
│       ├── profile/      # Own profile view
│       ├── profiles/[username]/
│       ├── companies/[slug]/
│       ├── companies/new/
│       ├── companies/[slug]/dashboard/
│       ├── products/[slug]/
│       ├── products/new/
│       ├── products/[slug]/edit/
│       ├── products/[slug]/wizard/
│       ├── products/[slug]/analytics/
│       ├── marketplace/products/
│       ├── connect/[category]/
│       ├── experts/[username]/
│       ├── bookmarks/
│       ├── messages/
│       └── settings/
├── features/             # Feature-based modules (main business logic)
│   ├── auth/
│   ├── profiles/
│   ├── organizations/
│   ├── products/
│   ├── connections/
│   ├── messaging/
│   ├── notifications/
│   ├── requests/
│   └── types.ts          # Shared ActionState type
├── components/           # Shared UI components
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Sidebar, AppHeader
│   ├── dashboard/
│   ├── products/
│   ├── companies/
│   ├── profiles/
│   ├── connect/
│   ├── ads/
│   └── events/
├── lib/
│   ├── supabase/
│   │   ├── server.ts     # Server & admin Supabase clients
│   │   ├── browser.ts    # Browser client
│   │   └── middleware.ts # Session refresh
│   ├── utils.ts          # cn(), debounce(), formatCurrency()
│   ├── env.ts            # Env var validation (Zod)
│   ├── formatters.ts
│   └── countries.ts
├── hooks/
│   ├── use-image-upload.ts
│   └── use-profile-upload.ts
├── types/
│   └── supabase.ts       # Auto-generated DB types
├── config/
│   └── nav.ts            # Sidebar navigation config
└── middleware.ts          # Supabase session refresh (runs on every request)

supabase/
└── migrations/           # SQL migration files (30 files, Feb–Apr 2026)
```

---

## Core Patterns — Read These Before Writing Code

### 1. Feature Module Structure

Every feature lives in `src/features/<feature-name>/` and follows this pattern:

```
features/products/
├── server/
│   └── actions.ts        # Server actions ('use server')
├── components/           # Feature-specific React components
├── schema.ts             # Zod validation schemas
├── types.ts              # Feature-specific TypeScript types
└── constants.ts          # Enums and constants
```

When adding a new feature, mirror this structure. Do **not** scatter logic across random files.

### 2. Server Actions

All data mutations and fetches happen through Next.js server actions in `server/actions.ts`.

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/features/types";

export async function updateSomething(data: SomeInput): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("table_name").update(data).eq("id", data.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/some-path");
  return { success: true, message: "Updated successfully" };
}
```

**ActionState type** (always return this from server actions):

```typescript
// src/features/types.ts
export type ActionState = {
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: any;
};
```

### 3. Supabase Client Usage

```typescript
// In server actions and route handlers:
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // user-scoped (respects RLS)
const adminSupabase = createAdminClient(); // bypasses RLS, use carefully

// In client components:
import { createClient } from "@/lib/supabase/browser";
const supabase = createClient();
```

### 4. Zod Validation

Each feature has a `schema.ts` with Zod schemas. Always validate before calling DB:

```typescript
// schema.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
```

### 5. Component Patterns

- **Server components** by default (no `'use client'`). Fetch data directly.
- Add `'use client'` only when you need hooks, event handlers, or browser APIs.
- Use `shadcn/ui` primitives from `@/components/ui/*` for all base UI elements.
- Wrap server actions in forms using React Hook Form + `useTransition` for optimistic UI.

### 6. Styling Conventions

- Dark theme by default. Root background is approximately `#121212`.
- Primary accent: gold `#C6A85E` — use for primary CTA buttons.
- Secondary accent: blue `#135bec`.
- Primary buttons: gold background (`bg-[#C6A85E]`).
- Outline buttons: `bg-transparent` with border — **not** white background.
- Use `cn()` from `@/lib/utils` for conditional class merging.

### 7. Database Migrations

New tables/columns go in `supabase/migrations/` as `.sql` files.
Naming convention: `YYYYMMDD_description.sql` (e.g., `20260502_add_events_notifications.sql`).

Always include:

- Row Level Security (RLS) enabled
- Appropriate RLS policies (reference existing migrations for patterns)
- Indexes on foreign keys and commonly-queried columns
- Timestamps: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

### 8. Navigation

To add a new route to the sidebar, edit `src/config/nav.ts`. It has three nav groups:

- "Main" — primary app pages
- "Connect with" — category-based connection pages
- "Discover" — marketplace and discovery features

---

## Database Schema Summary

See `references/db-schema.md` for full table and column details. Key tables:

| Table                                                      | Purpose                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| `profiles`                                                 | User profiles, bio, social links, skills, contact info       |
| `organizations`                                            | Companies with logos, details, member roles                  |
| `organization_members`                                     | User→org membership with roles (owner/admin/editor/viewer)   |
| `organization_followers`                                   | Users following orgs                                         |
| `products`                                                 | Products with logos, descriptions, QR codes                  |
| `product_experts`                                          | User expertise level for products (beginner→certified)       |
| `product_resources`                                        | Links: docs, certs, training, YouTube, etc.                  |
| `product_bookmarks`                                        | User bookmarks on products (triggers update bookmarks_count) |
| `connections`                                              | User follows/connections                                     |
| `demo_requests`                                            | Product demo inquiry requests                                |
| `discussions` / `discussion_posts`                         | Community discussions                                        |
| `conversations` / `conversation_participants` / `messages` | Messaging system                                             |
| `events`                                                   | Events (created 2026-04-25)                                  |

**Key enums:**

- `expertise_level`: `beginner`, `intermediate`, `advanced`, `certified`
- `member_role`: `owner`, `admin`, `editor`, `viewer`
- `resource_type`: `official_link`, `documentation`, `certification`, `training`, `youtube`, `community_link`

**RLS helper functions:** `can_edit_org(org_id)`, `is_org_admin(org_id)`, `is_org_member(org_id)`

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=        # Public — safe to use in browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Public — safe to use in browser
SUPABASE_SERVICE_ROLE_KEY=       # Server only — never expose to client
```

---

## How to Add a New Feature (Checklist)

1. **Database:** Write a migration in `supabase/migrations/` if new tables/columns are needed. Enable RLS. Add policies.
2. **Types:** Update `src/types/supabase.ts` after schema changes.
3. **Schema:** Add Zod schemas to `src/features/<feature>/schema.ts`.
4. **Server actions:** Add to `src/features/<feature>/server/actions.ts` with `'use server'` and return `ActionState`.
5. **Components:** Build feature components in `src/features/<feature>/components/` or `src/components/<feature>/`.
6. **Page:** Add the page/route under `src/app/(app)/<route>/page.tsx`. Prefer server components.
7. **Navigation:** If user-facing, add to `src/config/nav.ts`.
8. **Revalidation:** Call `revalidatePath()` in server actions after mutations.

---

## Where Things Live — Quick Reference

| What you need               | Where to look                                      |
| --------------------------- | -------------------------------------------------- |
| Add a new page              | `src/app/(app)/your-route/page.tsx`                |
| Add a server action         | `src/features/<feature>/server/actions.ts`         |
| Add a DB table/column       | `supabase/migrations/YYYYMMDD_name.sql`            |
| Add a sidebar link          | `src/config/nav.ts`                                |
| Add a reusable UI component | `src/components/ui/` (shadcn) or `src/components/` |
| Add a form schema           | `src/features/<feature>/schema.ts`                 |
| Get current user (server)   | `supabase.auth.getUser()` via `createClient()`     |
| Access DB types             | `import type { Tables } from '@/types/supabase'`   |
| Merge Tailwind classes      | `import { cn } from '@/lib/utils'`                 |
| Add toast notification      | `import { toast } from 'sonner'`                   |

---

## Reference Files

- **`references/db-schema.md`** — Full database schema with all tables, columns, types, RLS policies, and functions. Read this before writing any SQL or DB queries.
