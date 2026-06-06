-- Event exhibitors
-- Many-to-many link between organizations (companies) and events they
-- exhibit at. Distinct from events.organization_id, which is the event HOST.
-- A company exhibiting at NAB Show / IBC / Inter-BEE gets a row here per show.

CREATE TABLE IF NOT EXISTS event_exhibitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- 'self'   = a company owner declared participation
    -- 'import' = seeded from the exhibitor dataset
    source TEXT NOT NULL DEFAULT 'self' CHECK (source IN ('self', 'import')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_event_exhibitors_event_id ON event_exhibitors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_exhibitors_organization_id ON event_exhibitors(organization_id);

-- RLS
ALTER TABLE event_exhibitors ENABLE ROW LEVEL SECURITY;

-- Public can see exhibitors of published events.
CREATE POLICY "Exhibitors of published events are viewable by everyone"
    ON event_exhibitors FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_exhibitors.event_id
            AND e.status = 'published'
        )
    );

-- Org owners/admins/editors manage their OWN company's exhibitor records.
CREATE POLICY "Org editors can add their exhibitor records"
    ON event_exhibitors FOR INSERT
    TO authenticated
    WITH CHECK (can_edit_org(organization_id));

CREATE POLICY "Org editors can remove their exhibitor records"
    ON event_exhibitors FOR DELETE
    TO authenticated
    USING (can_edit_org(organization_id));
