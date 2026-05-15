-- Add is_platform_org flag to identify the MediaLinkPro platform organization
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_platform_org BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_organizations_platform_org
  ON public.organizations(is_platform_org)
  WHERE is_platform_org = true;

-- Seed the MediaLinkPro platform organization (idempotent)
INSERT INTO public.organizations (name, slug, is_platform_org)
VALUES ('MediaLinkPro', 'medialinkpro', true)
ON CONFLICT (slug) DO UPDATE SET is_platform_org = true;
