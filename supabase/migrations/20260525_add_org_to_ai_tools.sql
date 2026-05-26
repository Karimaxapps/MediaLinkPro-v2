-- Link AI tools to their company organizations.
-- Allows admin-curated AI tools to reference a stub/claimed org profile.

ALTER TABLE public.ai_tools
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ai_tools_organization_id_idx ON public.ai_tools(organization_id);

-- Admins need UPDATE/INSERT/DELETE on ai_tools (RLS currently only has SELECT for anon).
-- The admin client uses the service role key which bypasses RLS, so no extra policy needed.
-- But expose a read policy so the org join is visible in public queries.
-- (existing policy already covers SELECT for published tools — no change needed there)
