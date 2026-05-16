ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_organizations_is_featured
  ON public.organizations (is_featured)
  WHERE is_featured = true;
