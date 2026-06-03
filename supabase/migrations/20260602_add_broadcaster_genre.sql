ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS broadcaster_genre TEXT;

-- Speeds up the Broadcasters connect-page filter chips (grouped by genre).
CREATE INDEX IF NOT EXISTS idx_organizations_broadcaster_genre
  ON public.organizations (broadcaster_genre)
  WHERE broadcaster_genre IS NOT NULL;
