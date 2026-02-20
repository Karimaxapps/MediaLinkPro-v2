 # Database Schema Documentation

## Overview

MediaLinkPro uses Supabase (PostgreSQL) for data storage and authentication. All tables are protected by Row Level Security (RLS).

## Tables

| Table | Description | RLS Policy Summary |
| :--- | :--- | :--- |
| `profiles` | Extends `auth.users`. Contains profile info (username, full_name, etc). | Public read (limited fields). Users update own. Auto-created via trigger. |
| `organizations` | Main entity (Company Page). | Public read. Auth create. Admins update. |
| `organization_members` | Junction table (User <-> Org) with roles. | Members view. Admins manage. Users can leave. |
| `products` | Products belonging to an organization. | Public read. Editors (Org member) create/update/delete. |
| `product_resources` | Links/files for a product. | Public read. Editors manage. |
| `demo_requests` | User requests for product demo. | Auth create. Admins view. User views own. |
| `product_experts` | Users registered as experts. | Public read. Users manage own. |
| `discussions` | Discussion threads on products. | Public read. Auth create. |
| `discussion_posts` | Posts within discussions. | Public read. Auth create. User update/delete own. |

## Enums

- **member_role**: `owner`, `admin`, `editor`, `viewer`
- **expertise_level**: `beginner`, `intermediate`, `advanced`, `certified`
- **resource_type**: `official_link`, `documentation`, `certification`, `training`, `youtube`, `community_link`

## Triggers

- `on_auth_user_created`: Automatically creates a `profiles` row when a new user signs up.
- `handle_updated_at`: Automatically updates `updated_at` column on modification.

## Storage Buckets

### 1. `public-assets`
- **Visibility**: Public
- **Content**: Organization logos, product covers.
- **Policies**:
    - Read: Public
    - Write: Authenticated users (any auth user can upload currently, refinement needed for ownership checks if strict).

### 2. `private-docs`
- **Visibility**: Private
- **Content**: Internal documents.
- **Policies**:
    - Read/Write: Only members of the organization the file belongs to (path convention: `organizations/{org_id}/*`).

## Type Generation

Run the following command to regenerate types after schema changes:
```bash
npx supabase gen types typescript --project-id {PROJECT_ID} > src/types/supabase.ts
```
