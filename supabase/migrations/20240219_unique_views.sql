-- Create product_views table for unique visitor tracking
CREATE TABLE IF NOT EXISTS public.product_views (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    visitor_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_views_pkey PRIMARY KEY (id)
);

-- Add unique constraints to prevent duplicate counts
-- Case 1: Unique for authenticated user on a product
CREATE UNIQUE INDEX IF NOT EXISTS product_views_user_product_unique 
ON public.product_views (product_id, user_id) 
WHERE user_id IS NOT NULL;

-- Case 2: Unique for anonymous visitor on a product
CREATE UNIQUE INDEX IF NOT EXISTS product_views_visitor_product_unique 
ON public.product_views (product_id, visitor_id) 
WHERE visitor_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Views are viewable by product owner" ON public.product_views;
CREATE POLICY "Views are viewable by product owner" ON public.product_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.organization_members om ON p.organization_id = om.organization_id
            WHERE p.id = product_views.product_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

-- Trigger function to update products.views_count
CREATE OR REPLACE FUNCTION public.handle_new_product_view()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET views_count = views_count + 1
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_product_view_added ON public.product_views;
CREATE TRIGGER on_product_view_added
    AFTER INSERT ON public.product_views
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_product_view();

-- Update existing increment_product_views RPC to use the new logic
-- Wait, we might want to keep the RPC but update its internal logic
-- Actually, it's better to do the logic in the server action (getting visitor_id)
-- but we can provide a helper RPC if needed.

-- For now, let's just ensure the products table views_count is correct
-- We might need to initialize it if there are existing views?
-- UPDATE public.products p SET views_count = (SELECT count(*) FROM public.product_views WHERE product_id = p.id);
-- But we don't have existing product_views data yet, so we just start from current count.
