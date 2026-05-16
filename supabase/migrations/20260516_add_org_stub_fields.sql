-- Adds stub/seed tracking columns to organizations.
-- is_stub    : true for admin-seeded placeholder companies (no real owner yet)
-- claimed_at : timestamp when a real user claimed ownership of a stub org
-- merged_into_id : if this org was merged into another, points to the target
-- source     : how the org was created ('user' | 'admin_seed' | 'bulk_import')
-- seeded_by  : admin user id who seeded the org (nullable)

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_stub        BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS merged_into_id UUID        REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source         TEXT        NOT NULL DEFAULT 'user'
    CHECK (source IN ('user', 'admin_seed', 'bulk_import')),
  ADD COLUMN IF NOT EXISTS seeded_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for quickly finding all unclaimed stub orgs
CREATE INDEX IF NOT EXISTS idx_organizations_is_stub ON public.organizations (is_stub)
  WHERE is_stub = true;
