-- Stub Company Profiles
-- Adds admin-seeded company stubs that can be claimed by real owners.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_stub        BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS claimed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS merged_into_id UUID        REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source         TEXT        NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS seeded_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_source_check;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_source_check
  CHECK (source IN ('user','admin_seed','bulk_import'));

CREATE INDEX IF NOT EXISTS idx_orgs_is_stub
  ON public.organizations(is_stub) WHERE is_stub = TRUE;

CREATE INDEX IF NOT EXISTS idx_orgs_merged_into
  ON public.organizations(merged_into_id) WHERE merged_into_id IS NOT NULL;

-- Extend content_ownership_requests to support org claims
ALTER TABLE public.content_ownership_requests
  DROP CONSTRAINT IF EXISTS content_ownership_requests_content_type_check;
ALTER TABLE public.content_ownership_requests
  ADD CONSTRAINT content_ownership_requests_content_type_check
  CHECK (content_type IN ('product','event','blog_post','organization'));

-- requesting_org_id can be NULL when a user without an existing org claims a stub
ALTER TABLE public.content_ownership_requests
  ALTER COLUMN requesting_org_id DROP NOT NULL;

-- Track the user who submitted the claim (existing rows derived this via membership;
-- for org claims we may not have a requesting org, so we need the user directly).
ALTER TABLE public.content_ownership_requests
  ADD COLUMN IF NOT EXISTS requesting_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_cor_requesting_user
  ON public.content_ownership_requests(requesting_user_id);

-- Allow authenticated users without an org to submit org claims
DROP POLICY IF EXISTS "Users can submit org claim requests" ON public.content_ownership_requests;
CREATE POLICY "Users can submit org claim requests"
  ON public.content_ownership_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND content_type = 'organization'
    AND requesting_user_id = auth.uid()
    AND (
      requesting_org_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = requesting_org_id
          AND om.user_id = auth.uid()
          AND om.role IN ('owner', 'admin')
      )
    )
  );

-- Allow users to see their own org claim requests (covers the no-org case)
DROP POLICY IF EXISTS "Users can view their own org claim requests" ON public.content_ownership_requests;
CREATE POLICY "Users can view their own org claim requests"
  ON public.content_ownership_requests FOR SELECT
  TO authenticated
  USING (
    content_type = 'organization'
    AND requesting_user_id = auth.uid()
  );

-- Slug redirects: when a stub merges into an existing org, the stub's old slug
-- 308-redirects to the canonical org slug so SEO juice is preserved.
CREATE TABLE IF NOT EXISTS public.organization_slug_redirects (
  old_slug   TEXT PRIMARY KEY,
  org_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_slug_redirects_org
  ON public.organization_slug_redirects(org_id);

ALTER TABLE public.organization_slug_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read slug redirects" ON public.organization_slug_redirects;
CREATE POLICY "Public read slug redirects"
  ON public.organization_slug_redirects FOR SELECT
  TO anon, authenticated
  USING (TRUE);
