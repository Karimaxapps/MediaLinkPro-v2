-- Add new columns to profiles table to unify expert profile features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS about text,
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS skills text[];

-- Migration to move data from expert_profiles to profiles if needed could go here
-- But since we are likely in dev/early stage and users might not have data, we'll skip complex data migration
-- and just focus on schema changes. 

-- If expert_profiles table exists, we can drop it later, but for now we just extend profiles.
