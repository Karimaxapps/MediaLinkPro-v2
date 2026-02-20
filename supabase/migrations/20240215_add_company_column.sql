-- Add company column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company text;

-- Add index for search performance if needed, though simple text field usage mostly
-- CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company);
