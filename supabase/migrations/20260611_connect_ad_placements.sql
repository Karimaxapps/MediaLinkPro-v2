-- Per-page ad placements for the Connect listing pages.
-- Previously all Connect pages shared the generic "sidebar" placement.
alter table ad_campaigns drop constraint ad_campaigns_placement_check;

alter table ad_campaigns add constraint ad_campaigns_placement_check check (
  placement = any (array[
    'feed'::text,
    'sidebar'::text,
    'marketplace'::text,
    'jobs_sidebar'::text,
    'events_sidebar'::text,
    'job_details_sidebar'::text,
    'dashboard_hero_banner'::text,
    'mobile_top_feed_screen1'::text,
    'mobile_middle_feed_screen2'::text,
    'connect_broadcasters'::text,
    'connect_solution_providers'::text,
    'connect_production_companies'::text,
    'connect_media_associations'::text,
    'connect_media_professionals'::text
  ])
);
