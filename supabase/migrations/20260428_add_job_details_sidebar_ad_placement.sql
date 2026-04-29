-- Adds a `job_details_sidebar` ad placement so admins can promote
-- content next to individual job postings.

ALTER TABLE public.ad_campaigns
    DROP CONSTRAINT IF EXISTS ad_campaigns_placement_check;

ALTER TABLE public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_placement_check
    CHECK (placement IN ('feed', 'sidebar', 'marketplace', 'jobs_sidebar', 'events_sidebar', 'job_details_sidebar'));
