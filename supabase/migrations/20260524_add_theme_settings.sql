-- Theme settings: single-row table holding the brand palette so admins can
-- preview & launch different color schemes without redeploying.
-- Reads are public (every request injects these into :root). Writes go through
-- the service-role admin client behind requireSiteAdmin().

CREATE TABLE IF NOT EXISTS theme_settings (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE,
    brand TEXT NOT NULL DEFAULT '#C6A85E',
    brand_secondary TEXT NOT NULL DEFAULT '#135BEC',
    brand_success TEXT NOT NULL DEFAULT '#16A34A',
    brand_warning TEXT NOT NULL DEFAULT '#F59E0B',
    brand_destructive TEXT NOT NULL DEFAULT '#EF4444',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT theme_settings_singleton CHECK (id = TRUE)
);

ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "theme_settings_select_all" ON theme_settings;
CREATE POLICY "theme_settings_select_all" ON theme_settings
    FOR SELECT USING (true);

-- No write policies: updates happen via the service role only.

INSERT INTO theme_settings (id) VALUES (TRUE) ON CONFLICT (id) DO NOTHING;
