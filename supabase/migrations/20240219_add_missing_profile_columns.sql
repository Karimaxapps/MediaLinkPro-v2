-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add other potentially useful columns if they are missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS about text,
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS skills text[];
