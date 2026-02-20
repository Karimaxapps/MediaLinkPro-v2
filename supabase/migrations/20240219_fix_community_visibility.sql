-- Fix community resources visibility and relationships
-- 1. Ensure created_by references profiles for easier joins
ALTER TABLE public.product_community_resources
DROP CONSTRAINT IF EXISTS product_community_resources_created_by_fkey,
ADD CONSTRAINT product_community_resources_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Update RLS policy to make all resources viewable by everyone
DROP POLICY IF EXISTS "Public resources are viewable by everyone" ON public.product_community_resources;
CREATE POLICY "Public resources are viewable by everyone" ON public.product_community_resources
    FOR SELECT USING (true);

-- 3. Set is_approved default to true and update existing rows
ALTER TABLE public.product_community_resources ALTER COLUMN is_approved SET DEFAULT true;
UPDATE public.product_community_resources SET is_approved = true WHERE is_approved = false;
