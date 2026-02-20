-- Make product experts auto-verified by default
ALTER TABLE public.product_experts 
ALTER COLUMN is_verified SET DEFAULT true;

-- Update existing experts to be verified
UPDATE public.product_experts 
SET is_verified = true 
WHERE is_verified = false;
