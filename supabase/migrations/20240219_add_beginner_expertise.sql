-- Update expertise_level check constraint to include 'Beginner'
ALTER TABLE public.product_experts
DROP CONSTRAINT IF EXISTS product_experts_expertise_level_check;

ALTER TABLE public.product_experts
ADD CONSTRAINT product_experts_expertise_level_check
CHECK (expertise_level IN ('Beginner', 'Intermediate', 'Advanced', 'Certified'));
