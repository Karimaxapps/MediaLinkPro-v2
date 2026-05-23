-- Simple key/value feature flags so admins can gate experimental features.
-- Reads are public (so gates work for any visitor); writes go through the
-- service-role admin client behind requireSiteAdmin().

CREATE TABLE IF NOT EXISTS feature_flags (
    key TEXT PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone may read flags (needed to decide what UI to show).
DROP POLICY IF EXISTS "feature_flags_select_all" ON feature_flags;
CREATE POLICY "feature_flags_select_all" ON feature_flags
    FOR SELECT USING (true);

-- No write policies: inserts/updates happen via the service role only.

INSERT INTO feature_flags (key, enabled, description)
VALUES ('ai_setup_builder', false, 'AI Setup Builder (experimental) — when off, hidden from non-admins.')
ON CONFLICT (key) DO NOTHING;
