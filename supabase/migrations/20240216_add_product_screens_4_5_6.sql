-- Add missing columns for Screen 2 (Details) & Screen 3 (Media)
-- Fixed: logic to include gallery_urls, promo_video_url, etc.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS support_url text,
ADD COLUMN IF NOT EXISTS course_url text,
ADD COLUMN IF NOT EXISTS training_video_urls text[] DEFAULT '{}';

-- Add columns for Screen 5: Commercial Information
ALTER TABLE products
ADD COLUMN IF NOT EXISTS availability_status text,
ADD COLUMN IF NOT EXISTS price numeric,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS price_upon_request boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pricing_model text,

-- Add status column for lifecycle management
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT products_availability_status_check
CHECK (availability_status IN ('Available', 'Pre-order', 'Discontinued'));

ALTER TABLE products
ADD CONSTRAINT products_pricing_model_check
CHECK (pricing_model IN ('One-time', 'Subscription', 'Rental', 'Custom Quote'));

ALTER TABLE products
ADD CONSTRAINT products_status_check
CHECK (status IN ('draft', 'published', 'archived'));
