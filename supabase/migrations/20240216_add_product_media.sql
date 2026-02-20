-- Add media columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS promo_video_url text;
