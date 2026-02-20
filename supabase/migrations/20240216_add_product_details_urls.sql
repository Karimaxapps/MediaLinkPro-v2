-- Add URL columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS external_url text,
ADD COLUMN IF NOT EXISTS documentation_url text,
ADD COLUMN IF NOT EXISTS certification_url text;

-- Add check constraints for URLs (optional but good practice, though text is flexible)
-- We'll rely on application layer validation for strict URL formatting to avoid complex regex in SQL
