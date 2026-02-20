-- Create a new public bucket for products
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload images to the products bucket
-- We allow them to upload anywhere in the bucket for simplicity, or we can restrict to their user ID folder if we follow that pattern.
-- The current UI code (use-image-upload.ts) prepends userId, so we can stick to that.

CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Policy: Allow authenticated users to update their own product images
CREATE POLICY "Allow authenticated users to update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Policy: Allow authenticated users to delete their own product images
CREATE POLICY "Allow authenticated users to delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Policy: Allow public to view product images
CREATE POLICY "Allow public to view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');
