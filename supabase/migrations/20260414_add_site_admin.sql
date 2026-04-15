-- Site-wide admin flag for platform moderation/admin UI
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
    ON public.profiles(is_admin) WHERE is_admin = true;

-- Helper function for RLS checks
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
