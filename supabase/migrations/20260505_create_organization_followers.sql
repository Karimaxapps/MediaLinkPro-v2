-- Follow system for organizations.
-- A profile (user) can follow many organizations; an organization can have
-- many followers. Distinct from `connections` (profile↔profile) and
-- `organization_members` (profile↔organization with roles).

CREATE TABLE IF NOT EXISTS public.organization_followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (profile_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_org_followers_org
    ON public.organization_followers(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_followers_profile
    ON public.organization_followers(profile_id);

ALTER TABLE public.organization_followers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) may read follower rows so we can
-- display follower counts and "Followed by" lists publicly.
DROP POLICY IF EXISTS "Followers are publicly viewable" ON public.organization_followers;
CREATE POLICY "Followers are publicly viewable"
ON public.organization_followers FOR SELECT
USING (true);

-- Authenticated users may create their OWN follow row.
DROP POLICY IF EXISTS "Users can follow on their own behalf" ON public.organization_followers;
CREATE POLICY "Users can follow on their own behalf"
ON public.organization_followers FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());

-- Authenticated users may delete only their own follow row.
DROP POLICY IF EXISTS "Users can unfollow themselves" ON public.organization_followers;
CREATE POLICY "Users can unfollow themselves"
ON public.organization_followers FOR DELETE
TO authenticated
USING (profile_id = auth.uid());
