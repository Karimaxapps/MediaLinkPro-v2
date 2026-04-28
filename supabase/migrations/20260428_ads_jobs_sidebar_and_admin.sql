-- Adds a `jobs_sidebar` placement value for ad campaigns and grants
-- site admins (profiles.is_admin = true) full read/write on every
-- campaign, so they can manage promoted content from /admin/ads
-- regardless of who the original advertiser was.

ALTER TABLE public.ad_campaigns
    DROP CONSTRAINT IF EXISTS ad_campaigns_placement_check;

ALTER TABLE public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_placement_check
    CHECK (placement IN ('feed', 'sidebar', 'marketplace', 'jobs_sidebar'));

DROP POLICY IF EXISTS "Site admins manage all campaigns" ON public.ad_campaigns;
CREATE POLICY "Site admins manage all campaigns"
    ON public.ad_campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

DROP POLICY IF EXISTS "Site admins view all campaigns" ON public.ad_campaigns;
CREATE POLICY "Site admins view all campaigns"
    ON public.ad_campaigns
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );
