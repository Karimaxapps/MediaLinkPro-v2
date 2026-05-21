-- Stats columns on organizations.
--
-- NOTE: the organization_followers table and its follower-count triggers are
-- defined in later migrations (20260505_create_organization_followers.sql for
-- the table, 20260520_add_org_followers_count.sql for the count column +
-- triggers). This migration only owns the organization stats columns and the
-- view-increment helper.

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS views_count BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS followers_count BIGINT NOT NULL DEFAULT 0;

-- Increment organization views safely.
CREATE OR REPLACE FUNCTION increment_organization_views(organization_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE organizations
    SET views_count = views_count + 1
    WHERE id = organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
