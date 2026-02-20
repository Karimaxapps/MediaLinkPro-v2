-- Add missing columns for Screen 2 (Details) & Screen 3 (Media)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS promo_video_url text,
ADD COLUMN IF NOT EXISTS documentation_url text,
ADD COLUMN IF NOT EXISTS certification_url text,
ADD COLUMN IF NOT EXISTS external_url text;
