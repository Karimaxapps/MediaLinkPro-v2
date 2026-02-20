-- Add upvotes_count to product_community_resources
ALTER TABLE public.product_community_resources
ADD COLUMN IF NOT EXISTS upvotes_count integer DEFAULT 0;

-- Create product_resource_upvotes table
CREATE TABLE IF NOT EXISTS public.product_resource_upvotes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id uuid NOT NULL REFERENCES public.product_community_resources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_resource_upvotes_pkey PRIMARY KEY (id),
    CONSTRAINT product_resource_upvotes_user_resource_unique UNIQUE (user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.product_resource_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies for product_resource_upvotes

-- Viewable by everyone (to see who upvoted if needed, or just for count consistency)
DROP POLICY IF EXISTS "Upvotes are viewable by everyone" ON public.product_resource_upvotes;
CREATE POLICY "Upvotes are viewable by everyone" ON public.product_resource_upvotes
    FOR SELECT USING (true);

-- Users can insert their own upvote
DROP POLICY IF EXISTS "Users can upvote resources" ON public.product_resource_upvotes;
CREATE POLICY "Users can upvote resources" ON public.product_resource_upvotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvote
DROP POLICY IF EXISTS "Users can remove their upvotes" ON public.product_resource_upvotes;
CREATE POLICY "Users can remove their upvotes" ON public.product_resource_upvotes
    FOR DELETE USING (auth.uid() = user_id);


-- RPC functions for atomic updates

CREATE OR REPLACE FUNCTION public.increment_resource_upvote(resource_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.product_community_resources
  SET upvotes_count = upvotes_count + 1
  WHERE id = resource_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_resource_upvote(resource_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.product_community_resources
  SET upvotes_count = GREATEST(0, upvotes_count - 1)
  WHERE id = resource_id;
END;
$$;
