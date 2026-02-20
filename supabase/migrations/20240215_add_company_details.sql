-- Add new columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS main_activity text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS x_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS tiktok_url text,
ADD COLUMN IF NOT EXISTS youtube_url text;

-- Add check constraint for organization type if desired, or handle in application logic
-- ALTER TABLE organizations ADD CONSTRAINT valid_organization_type CHECK (type IN ('Broadcaster', 'Production / Post-prod', 'Solution Provider', 'Media Association', 'Training Center'));
