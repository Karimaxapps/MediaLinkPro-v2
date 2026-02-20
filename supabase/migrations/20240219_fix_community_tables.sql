-- Fix missing product_community_resources table
CREATE TABLE IF NOT EXISTS public.product_community_resources (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text NOT NULL CHECK (type IN ('video', 'course', 'article', 'other')),
    url text NOT NULL,
    description text,
    is_approved boolean DEFAULT false,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_community_resources_pkey PRIMARY KEY (id)
);

-- Enable RLS for product_community_resources
ALTER TABLE public.product_community_resources ENABLE ROW LEVEL SECURITY;

-- Re-apply policies for product_community_resources (using IF NOT EXISTS logic via DO block or just drop/create)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public resources are viewable by everyone" ON public.product_community_resources;
    CREATE POLICY "Public resources are viewable by everyone" ON public.product_community_resources
        FOR SELECT USING (is_approved = true);

    DROP POLICY IF EXISTS "Product owners can view all resources" ON public.product_community_resources;
    CREATE POLICY "Product owners can view all resources" ON public.product_community_resources
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.products p
                JOIN public.organization_members om ON p.organization_id = om.organization_id
                WHERE p.id = product_community_resources.product_id
                AND om.user_id = auth.uid()
                AND om.role IN ('owner', 'admin', 'editor')
            )
        );

    DROP POLICY IF EXISTS "Users can insert resources" ON public.product_community_resources;
    CREATE POLICY "Users can insert resources" ON public.product_community_resources
        FOR INSERT WITH CHECK (auth.uid() = created_by);

    DROP POLICY IF EXISTS "Users can update own resources" ON public.product_community_resources;
    CREATE POLICY "Users can update own resources" ON public.product_community_resources
        FOR UPDATE USING (auth.uid() = created_by);

    DROP POLICY IF EXISTS "Product owners can update resources" ON public.product_community_resources;
    CREATE POLICY "Product owners can update resources" ON public.product_community_resources
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.products p
                JOIN public.organization_members om ON p.organization_id = om.organization_id
                WHERE p.id = product_community_resources.product_id
                AND om.user_id = auth.uid()
                AND om.role IN ('owner', 'admin', 'editor')
            )
        );
END $$;


-- Update product_experts policies to ensure visibility
-- We assume table exists since user has data
ALTER TABLE public.product_experts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Ensure comprehensive select policy
    DROP POLICY IF EXISTS "Experts are viewable by everyone" ON public.product_experts;
    CREATE POLICY "Experts are viewable by everyone" ON public.product_experts
        FOR SELECT USING (true);

    -- Ensure insert policy
    DROP POLICY IF EXISTS "Users can register as experts" ON public.product_experts;
    CREATE POLICY "Users can register as experts" ON public.product_experts
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Ensure delete policy
    DROP POLICY IF EXISTS "Users can remove themselves" ON public.product_experts;
    CREATE POLICY "Users can remove themselves" ON public.product_experts
        FOR DELETE USING (auth.uid() = user_id);

    -- Ensure update/manage policy for owners
    DROP POLICY IF EXISTS "Product owners can update experts" ON public.product_experts;
    CREATE POLICY "Product owners can update experts" ON public.product_experts
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.products p
                JOIN public.organization_members om ON p.organization_id = om.organization_id
                WHERE p.id = product_experts.product_id
                AND om.user_id = auth.uid()
                AND om.role IN ('owner', 'admin', 'editor')
            )
        );
END $$;
