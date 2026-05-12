-- Add broadcaster sub-type to organizations.
-- Only populated when type = 'Broadcaster'.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS broadcaster_type TEXT
  CHECK (broadcaster_type IN ('Television', 'Radio'));
