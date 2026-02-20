-- Add stats columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS followers_count BIGINT DEFAULT 0;

-- Create organization_followers table
CREATE TABLE IF NOT EXISTS organization_followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- RLS for organization_followers
ALTER TABLE organization_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view followers"
ON organization_followers FOR SELECT
USING (true);

CREATE POLICY "Users can follow organizations"
ON organization_followers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow organizations"
ON organization_followers FOR DELETE
USING (auth.uid() = user_id);

-- Functions to increment/decrement followers count
CREATE OR REPLACE FUNCTION increment_org_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE organizations
    SET followers_count = followers_count + 1
    WHERE id = NEW.organization_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_org_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE organizations
    SET followers_count = followers_count - 1
    WHERE id = OLD.organization_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for followers count
DROP TRIGGER IF EXISTS on_org_follower_created ON organization_followers;
CREATE TRIGGER on_org_follower_created
AFTER INSERT ON organization_followers
FOR EACH ROW
EXECUTE FUNCTION increment_org_followers_count();

DROP TRIGGER IF EXISTS on_org_follower_deleted ON organization_followers;
CREATE TRIGGER on_org_follower_deleted
AFTER DELETE ON organization_followers
FOR EACH ROW
EXECUTE FUNCTION decrement_org_followers_count();

-- Function to increment organization views safely
CREATE OR REPLACE FUNCTION increment_organization_views(organization_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE organizations
    SET views_count = views_count + 1
    WHERE id = organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
