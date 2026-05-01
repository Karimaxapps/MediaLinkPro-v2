-- Adds a `dashboard_hero_banner` ad placement so admins can replace the
-- "Unlock Premium Tools" hero banner on the dashboard via /admin/ads.

ALTER TABLE public.ad_campaigns
    DROP CONSTRAINT IF EXISTS ad_campaigns_placement_check;

ALTER TABLE public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_placement_check
    CHECK (placement IN ('feed', 'sidebar', 'marketplace', 'jobs_sidebar', 'events_sidebar', 'job_details_sidebar', 'dashboard_hero_banner'));
