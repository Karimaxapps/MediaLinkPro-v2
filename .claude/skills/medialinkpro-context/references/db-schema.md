# MediaLinkPro Database Schema Reference

## Enum Types

| Enum                | Values                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `member_role`       | `owner`, `admin`, `editor`, `viewer`                                                       |
| `expertise_level`   | `Beginner`, `Intermediate`, `Advanced`, `Certified`                                        |
| `resource_type`     | `official_link`, `documentation`, `certification`, `training`, `youtube`, `community_link` |
| `connection_status` | `pending`, `accepted`, `rejected`                                                          |
| `event_type`        | `summit`, `award_ceremony`, `networking`, `training`, `other`                              |

---

## Tables

### profiles

Linked 1:1 to `auth.users`. Auto-created on signup via `handle_new_user()` trigger.

| Column                           | Type                | Notes                                                      |
| -------------------------------- | ------------------- | ---------------------------------------------------------- |
| id                               | uuid PK             | FK → auth.users(id) CASCADE                                |
| created_at / updated_at          | timestamptz         | updated_at managed by trigger                              |
| email                            | text                |                                                            |
| full_name                        | text                | CHECK length >= 3                                          |
| avatar_url                       | text                |                                                            |
| website / bio / headline / about | text                |                                                            |
| hourly_rate                      | numeric             |                                                            |
| skills                           | text[] DEFAULT '{}' |                                                            |
| birth_date                       | date                |                                                            |
| company                          | text                |                                                            |
| job_function                     | text                | CHECK: 'C-Suite','Business','Creative','Technical','Other' |
| facebook_url / tiktok_url        | text                |                                                            |

**RLS:** SELECT public; UPDATE own row only.

---

### organizations

| Column                                                                         | Type                 | Notes                                 |
| ------------------------------------------------------------------------------ | -------------------- | ------------------------------------- |
| id                                                                             | uuid PK              |                                       |
| name                                                                           | text NOT NULL        |                                       |
| slug                                                                           | text NOT NULL UNIQUE | URL identifier                        |
| logo_url                                                                       | text                 |                                       |
| tagline / type / main_activity / description                                   | text                 |                                       |
| website / contact_email / phone / country / address                            | text                 |                                       |
| linkedin_url / x_url / facebook_url / instagram_url / tiktok_url / youtube_url | text                 |                                       |
| views_count / followers_count                                                  | bigint DEFAULT 0     | followers_count maintained by trigger |

**RLS:** SELECT public; INSERT authenticated; UPDATE via `can_edit_org()`.

---

### organization_members

| Column          | Type                         | Notes                          |
| --------------- | ---------------------------- | ------------------------------ |
| organization_id | uuid                         | FK → organizations(id) CASCADE |
| user_id         | uuid                         | FK → profiles(id) CASCADE      |
| role            | member_role DEFAULT 'viewer' |                                |
| UNIQUE          | (organization_id, user_id)   |                                |

---

### products

| Column                                                                                            | Type                    | Notes                                                    |
| ------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------- |
| id                                                                                                | uuid PK                 |                                                          |
| organization_id                                                                                   | uuid                    | FK → organizations(id) CASCADE                           |
| name                                                                                              | text NOT NULL           |                                                          |
| slug                                                                                              | text                    |                                                          |
| description / short_description                                                                   | text                    | short_description CHECK length <= 150                    |
| logo_url                                                                                          | text                    |                                                          |
| is_public                                                                                         | boolean DEFAULT true    |                                                          |
| product_type                                                                                      | text                    | CHECK: 'Hardware','Software','Cloud','Hybrid','Service'  |
| main_category / sub_category                                                                      | text                    |                                                          |
| gallery_urls                                                                                      | text[] DEFAULT '{}'     |                                                          |
| promo_video_url / documentation_url / certification_url / external_url / support_url / course_url | text                    |                                                          |
| training_video_urls                                                                               | text[] DEFAULT '{}'     |                                                          |
| availability_status                                                                               | text                    | CHECK: 'Available','Pre-order','Discontinued'            |
| price                                                                                             | numeric                 |                                                          |
| currency                                                                                          | text DEFAULT 'USD'      |                                                          |
| price_upon_request                                                                                | boolean DEFAULT false   |                                                          |
| pricing_model                                                                                     | text                    | CHECK: 'One-time','Subscription','Rental','Custom Quote' |
| status                                                                                            | text DEFAULT 'draft'    | CHECK: 'draft','published','archived'                    |
| views_count / bookmarks_count / qr_scans_count                                                    | bigint DEFAULT 0        | maintained by triggers                                   |
| qr_code_url                                                                                       | text                    |                                                          |
| UNIQUE                                                                                            | (organization_id, slug) |                                                          |

**RLS:** SELECT public; INSERT/UPDATE/DELETE via `can_edit_org()`.

---

### product_experts

| Column          | Type                  | Notes                                                   |
| --------------- | --------------------- | ------------------------------------------------------- |
| product_id      | uuid                  | FK → products(id) CASCADE                               |
| user_id         | uuid                  | FK → profiles(id) CASCADE                               |
| expertise_level | text                  | CHECK: 'Beginner','Intermediate','Advanced','Certified' |
| is_verified     | boolean DEFAULT true  | Auto-verified on creation                               |
| UNIQUE          | (user_id, product_id) |                                                         |

---

### product_bookmarks

| Column     | Type                      | Notes                       |
| ---------- | ------------------------- | --------------------------- |
| user_id    | uuid                      | FK → auth.users(id) CASCADE |
| product_id | uuid                      | FK → products(id) CASCADE   |
| created_at | timestamptz DEFAULT NOW() |                             |
| UNIQUE     | (user_id, product_id)     |                             |

**Triggers:** Increment/decrement `products.bookmarks_count` on insert/delete.
**RLS:** Users manage their own bookmarks only.

---

### product_views

| Column     | Type                                                  | Notes                     |
| ---------- | ----------------------------------------------------- | ------------------------- |
| product_id | uuid                                                  | FK → products(id) CASCADE |
| user_id    | uuid nullable                                         |                           |
| visitor_id | text                                                  | For anonymous visitors    |
| UNIQUE     | (product_id, user_id) WHERE user_id IS NOT NULL       |                           |
| UNIQUE     | (product_id, visitor_id) WHERE visitor_id IS NOT NULL |                           |

**Triggers:** Increment `products.views_count` on insert.

---

### product_scans

| Column                  | Type                      | Notes                        |
| ----------------------- | ------------------------- | ---------------------------- |
| product_id              | uuid                      | FK → products(id) CASCADE    |
| scanner_id              | uuid nullable             | FK → auth.users(id) SET NULL |
| scanned_at              | timestamptz DEFAULT NOW() |                              |
| ip_address / user_agent | text                      |                              |

---

### product_community_resources

| Column        | Type                 | Notes                                     |
| ------------- | -------------------- | ----------------------------------------- |
| product_id    | uuid                 | FK → products(id) CASCADE                 |
| title         | text NOT NULL        |                                           |
| type          | text NOT NULL        | CHECK: 'video','course','article','other' |
| url           | text NOT NULL        |                                           |
| is_approved   | boolean DEFAULT true |                                           |
| created_by    | uuid                 | FK → profiles(id) SET NULL                |
| upvotes_count | integer DEFAULT 0    | Maintained by RPC                         |

---

### product_resources (legacy link store)

| Column      | Type                                  | Notes                     |
| ----------- | ------------------------------------- | ------------------------- |
| product_id  | uuid                                  | FK → products(id) CASCADE |
| title / url | text NOT NULL                         |                           |
| type        | resource_type DEFAULT 'documentation' |                           |
| added_by    | uuid                                  | FK → profiles(id)         |

---

### organization_followers

| Column          | Type                       | Notes                          |
| --------------- | -------------------------- | ------------------------------ |
| user_id         | uuid                       | FK → auth.users(id) CASCADE    |
| organization_id | uuid                       | FK → organizations(id) CASCADE |
| UNIQUE          | (user_id, organization_id) |                                |

**Triggers:** Increment/decrement `organizations.followers_count`.

---

### connections

| Column       | Type                                | Notes                     |
| ------------ | ----------------------------------- | ------------------------- |
| requester_id | uuid                                | FK → profiles(id) CASCADE |
| recipient_id | uuid                                | FK → profiles(id) CASCADE |
| status       | connection_status DEFAULT 'pending' |                           |
| UNIQUE       | (requester_id, recipient_id)        |                           |

**Indexes:** (requester_id), (recipient_id), (status).

---

### demo_requests

| Column                                 | Type                   | Notes                                  |
| -------------------------------------- | ---------------------- | -------------------------------------- |
| product_id                             | uuid                   | FK → products(id) CASCADE              |
| organization_id                        | uuid                   | FK → organizations(id) CASCADE         |
| requester_id                           | uuid nullable          | FK → auth.users(id) SET NULL           |
| contact_name / contact_email           | text NOT NULL          |                                        |
| contact_phone / company_name / message | text                   |                                        |
| status                                 | text DEFAULT 'pending' | CHECK: 'pending','contacted','ignored' |

---

### notifications

| Column          | Type                  | Notes                         |
| --------------- | --------------------- | ----------------------------- |
| user_id         | uuid                  | FK → auth.users(id) CASCADE   |
| type            | text NOT NULL         | e.g. 'demo_request', 'system' |
| title / message | text NOT NULL         |                               |
| data            | jsonb DEFAULT '{}'    | Extra payload                 |
| is_read         | boolean DEFAULT false |                               |

---

### conversations / conversation_participants / messages

**conversations:** id, created_at, updated_at  
**conversation_participants:** conversation_id, profile_id (nullable), organization_id (nullable) — one or the other must be set  
**messages:** conversation_id, sender_profile_id (nullable), sender_organization_id (nullable), content NOT NULL, is_read DEFAULT false

RLS: participants only.

---

### events

| Column                                                          | Type                 | Notes                                       |
| --------------------------------------------------------------- | -------------------- | ------------------------------------------- |
| organization_id                                                 | uuid                 | FK → organizations(id) CASCADE              |
| title                                                           | text NOT NULL        |                                             |
| slug                                                            | text                 |                                             |
| event_type                                                      | event_type           |                                             |
| status                                                          | text                 |                                             |
| start_date / end_date                                           | timestamptz          |                                             |
| format                                                          | text                 | CHECK: 'In-Person','Virtual','Hybrid'       |
| location / venue_name / address / city / country / location_url | text                 |                                             |
| cover_image_url / logo_url                                      | text                 |                                             |
| gallery_urls                                                    | text[] DEFAULT '[]'  |                                             |
| tags                                                            | text[] DEFAULT '[]'  |                                             |
| price                                                           | numeric              | currency DEFAULT 'USD'                      |
| pricing_model                                                   | text                 | CHECK: 'Free','Paid','Invite-only','Tiered' |
| speakers / agenda / sponsors                                    | jsonb DEFAULT '[]'   |                                             |
| website_url / registration_url / contact_email                  | text                 |                                             |
| views_count / bookmarks_count / registration_count              | integer DEFAULT 0    |                                             |
| is_public                                                       | boolean DEFAULT true |                                             |

**Indexes:** (start_date), (status), (organization_id).

---

## Key Functions

### RLS Helpers (SECURITY DEFINER)

- `is_org_member(org_id UUID) → boolean`
- `is_org_admin(org_id UUID) → boolean` — owner or admin
- `can_edit_org(org_id UUID) → boolean` — owner, admin, or editor
- `is_conversation_participant(conv_id UUID) → boolean`

### Public RPCs

- `increment_product_views(product_id UUID)` — safely increment view counter
- `increment_product_qr_scans(product_id UUID)` — safely increment QR scan counter
- `increment_resource_upvote(resource_id UUID)` / `decrement_resource_upvote(resource_id UUID)`
- `create_demo_request_with_notification(p_product_id, p_organization_id, p_requester_id, p_contact_name, p_contact_email, p_contact_phone, p_company_name, p_message) → UUID`

### Triggers on All Major Tables

`handle_updated_at()` keeps `updated_at` current on every modification.  
`handle_new_user()` creates a `profiles` row when `auth.users` gets a new row.

---

## Storage Buckets

| Bucket          | Public | Purpose                   |
| --------------- | ------ | ------------------------- |
| `products`      | Yes    | Product images and assets |
| `public-assets` | Yes    | General public assets     |
| `private-docs`  | No     | Private org documents     |
