-- Add expertise_level to product_experts
ALTER TABLE public.product_experts 
ADD COLUMN expertise_level text CHECK (expertise_level IN ('Intermediate', 'Advanced', 'Certified'));

-- Allow product owners to delete experts
-- (Existing policy "Product owners can update experts" only covers UPDATE, we need DELETE)
CREATE POLICY "Product owners can delete experts" ON public.product_experts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.organization_members om ON p.organization_id = om.organization_id
            WHERE p.id = product_experts.product_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );
