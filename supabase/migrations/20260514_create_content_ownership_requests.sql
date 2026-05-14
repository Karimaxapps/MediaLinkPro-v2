-- Table for companies to claim ownership of platform-seeded content
CREATE TABLE IF NOT EXISTS public.content_ownership_requests (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type      TEXT        NOT NULL CHECK (content_type IN ('product', 'event', 'blog_post')),
  content_id        UUID        NOT NULL,
  requesting_org_id UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  message           TEXT,
  admin_note        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  resolved_by       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Prevent duplicate pending claims from the same org on the same content
  UNIQUE (content_type, content_id, requesting_org_id)
);

CREATE INDEX IF NOT EXISTS idx_cor_content
  ON public.content_ownership_requests(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_cor_requesting
  ON public.content_ownership_requests(requesting_org_id);

CREATE INDEX IF NOT EXISTS idx_cor_status
  ON public.content_ownership_requests(status);

ALTER TABLE public.content_ownership_requests ENABLE ROW LEVEL SECURITY;

-- Org owners/admins can view their own org's requests
CREATE POLICY "Org members can view their own requests"
  ON public.content_ownership_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = requesting_org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- Org owners/admins can submit new pending claim requests
CREATE POLICY "Org owners can submit claim requests"
  ON public.content_ownership_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = requesting_org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- Admin reads and resolves via service role (createAdminClient) which bypasses RLS
