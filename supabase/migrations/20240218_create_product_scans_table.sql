
-- Create product_scans table
CREATE TABLE IF NOT EXISTS product_scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    scanner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous scans
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- RLS for product_scans
ALTER TABLE product_scans ENABLE ROW LEVEL SECURITY;

-- Product owners can view scans for their products
CREATE POLICY "Product owners can view scans for their products"
ON product_scans FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM products p
        JOIN organization_members om ON p.organization_id = om.organization_id
        WHERE p.id = product_scans.product_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'editor')
    )
);

-- Anyone can insert scans (public access for anonymous scanning)
CREATE POLICY "Anyone can insert scans"
ON product_scans FOR INSERT
WITH CHECK (true);

-- Add scanner_id column to product_scans if not exists (in case table was created differently before, good practice for idempotent migrations)
-- (Already included in create table above, but ensuring consistency)

-- Optional: Index for faster lookups by product
CREATE INDEX IF NOT EXISTS idx_product_scans_product_id ON product_scans(product_id);
