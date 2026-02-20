-- Add product_community_resources table (for videos, courses, etc.)
CREATE TABLE public.product_community_resources (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text NOT NULL CHECK (type IN ('video', 'course', 'article', 'other')),
    url text NOT NULL,
    description text,
    is_approved boolean DEFAULT false, -- Resources might need approval
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_community_resources_pkey PRIMARY KEY (id)
);

-- RLS for product_community_resources
ALTER TABLE public.product_community_resources ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved resources
CREATE POLICY "Public resources are viewable by everyone" ON public.product_community_resources
    FOR SELECT USING (is_approved = true);

-- Product owners/admins can view all resources for their product
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

-- Authenticated users can suggest resources
CREATE POLICY "Users can insert resources" ON public.product_community_resources
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can edit their own proposed resources
CREATE POLICY "Users can update own resources" ON public.product_community_resources
    FOR UPDATE USING (auth.uid() = created_by);

-- Product owners/admins can update/approve resources
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


-- Add product_experts table (users self-registering as experts)
CREATE TABLE public.product_experts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_verified boolean DEFAULT false, -- Product owner can verify an expert
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_experts_pkey PRIMARY KEY (id),
    CONSTRAINT product_experts_user_product_unique UNIQUE (user_id, product_id)
);

-- RLS for product_experts
ALTER TABLE public.product_experts ENABLE ROW LEVEL SECURITY;

-- Everyone can view experts
CREATE POLICY "Experts are viewable by everyone" ON public.product_experts
    FOR SELECT USING (true);

-- Authenticated users can register themselves
CREATE POLICY "Users can register as experts" ON public.product_experts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove themselves
CREATE POLICY "Users can remove themselves" ON public.product_experts
    FOR DELETE USING (auth.uid() = user_id);

-- Product owners/admins can verify experts
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
