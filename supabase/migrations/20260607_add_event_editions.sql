-- Event editions
-- A recurring event (NAB Show, IBC, Inter-BEE ...) keeps ONE identity but can
-- hold many dated editions (past + upcoming). Organizers add/update dates here
-- instead of creating a new event row each year. The parent event's headline
-- start_date/end_date are kept synced to the NEXT upcoming edition (or the most
-- recent past one) so existing lists, cards and widgets keep working unchanged.

CREATE TABLE IF NOT EXISTS event_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    label TEXT,                       -- e.g. "2025", "2026 Tokyo"
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    venue_name TEXT,
    city TEXT,
    country TEXT,
    registration_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_event_editions_event_id ON event_editions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_editions_start_date ON event_editions(start_date);

-- Keep events.start_date/end_date pointing at the most relevant edition:
-- the next upcoming edition if one exists, else the most recent past edition.
CREATE OR REPLACE FUNCTION sync_event_dates_from_editions(p_event_id UUID)
RETURNS VOID AS $$
DECLARE
    v_start TIMESTAMPTZ;
    v_end TIMESTAMPTZ;
BEGIN
    SELECT start_date, end_date INTO v_start, v_end
    FROM event_editions
    WHERE event_id = p_event_id AND start_date >= now()
    ORDER BY start_date ASC
    LIMIT 1;

    IF v_start IS NULL THEN
        SELECT start_date, end_date INTO v_start, v_end
        FROM event_editions
        WHERE event_id = p_event_id
        ORDER BY start_date DESC
        LIMIT 1;
    END IF;

    IF v_start IS NOT NULL THEN
        UPDATE events SET start_date = v_start, end_date = v_end WHERE id = p_event_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION event_editions_sync_trg()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM sync_event_dates_from_editions(OLD.event_id);
        RETURN OLD;
    END IF;
    PERFORM sync_event_dates_from_editions(NEW.event_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_editions_sync_trg ON event_editions;
CREATE TRIGGER event_editions_sync_trg
    AFTER INSERT OR UPDATE OR DELETE ON event_editions
    FOR EACH ROW EXECUTE FUNCTION event_editions_sync_trg();

CREATE OR REPLACE FUNCTION event_editions_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_editions_touch_updated_at_trg ON event_editions;
CREATE TRIGGER event_editions_touch_updated_at_trg
    BEFORE UPDATE ON event_editions
    FOR EACH ROW EXECUTE FUNCTION event_editions_touch_updated_at();

-- RLS
ALTER TABLE event_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event editions are viewable by everyone"
    ON event_editions FOR SELECT
    USING (true);

CREATE POLICY "Org editors can manage event editions"
    ON event_editions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM events e
            JOIN organization_members om ON om.organization_id = e.organization_id
            WHERE e.id = event_editions.event_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events e
            JOIN organization_members om ON om.organization_id = e.organization_id
            WHERE e.id = event_editions.event_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

-- Backfill: one edition per existing event from its current dates.
INSERT INTO event_editions (event_id, label, start_date, end_date, location, venue_name, city, country, registration_url)
SELECT id, to_char(start_date, 'YYYY'), start_date, end_date, location, venue_name, city, country, registration_url
FROM events
WHERE NOT EXISTS (SELECT 1 FROM event_editions ee WHERE ee.event_id = events.id);
