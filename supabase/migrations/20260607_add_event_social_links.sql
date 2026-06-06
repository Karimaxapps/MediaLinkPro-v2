-- Dedicated social pages for an event.
-- Some companies run event-specific social handles (separate from the org's).
ALTER TABLE events ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS x_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS youtube_url TEXT;
