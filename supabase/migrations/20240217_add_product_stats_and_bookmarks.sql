-- Add stats columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS bookmarks_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS qr_scans_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Create product_bookmarks table
CREATE TABLE IF NOT EXISTS product_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- RLS for product_bookmarks
ALTER TABLE product_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
ON product_bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON product_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON product_bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Functions to increment/decrement bookmarks count
CREATE OR REPLACE FUNCTION increment_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET bookmarks_count = bookmarks_count + 1
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET bookmarks_count = bookmarks_count - 1
    WHERE id = OLD.product_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for bookmarks count
DROP TRIGGER IF EXISTS on_bookmark_created ON product_bookmarks;
CREATE TRIGGER on_bookmark_created
AFTER INSERT ON product_bookmarks
FOR EACH ROW
EXECUTE FUNCTION increment_bookmarks_count();

DROP TRIGGER IF EXISTS on_bookmark_deleted ON product_bookmarks;
CREATE TRIGGER on_bookmark_deleted
AFTER DELETE ON product_bookmarks
FOR EACH ROW
EXECUTE FUNCTION decrement_bookmarks_count();

-- Function to increment product views safely
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET views_count = views_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product qr scans safely
CREATE OR REPLACE FUNCTION increment_product_qr_scans(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET qr_scans_count = qr_scans_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
