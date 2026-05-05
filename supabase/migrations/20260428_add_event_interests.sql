-- Event interests
-- Lightweight "I'll go" / "Maybe" signals shown publicly on event pages.
-- Distinct from event_registrations because, when registration_url is set,
-- the actual registration happens on an external site.

DO $$ BEGIN
    CREATE TYPE event_interest_type AS ENUM ('going', 'maybe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS event_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interest event_interest_type NOT NULL DEFAULT 'going',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_interests_event_id ON event_interests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_interests_user_id ON event_interests(user_id);

-- Maintain a denormalised count on the events table for cheap reads.
ALTER TABLE events ADD COLUMN IF NOT EXISTS interest_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION event_interests_bump_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET interest_count = interest_count + 1 WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET interest_count = GREATEST(0, interest_count - 1) WHERE id = OLD.event_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_interests_bump_count_trg ON event_interests;
CREATE TRIGGER event_interests_bump_count_trg
    AFTER INSERT OR DELETE ON event_interests
    FOR EACH ROW EXECUTE FUNCTION event_interests_bump_count();

CREATE OR REPLACE FUNCTION event_interests_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_interests_touch_updated_at_trg ON event_interests;
CREATE TRIGGER event_interests_touch_updated_at_trg
    BEFORE UPDATE ON event_interests
    FOR EACH ROW EXECUTE FUNCTION event_interests_touch_updated_at();

-- RLS
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event interests are viewable by everyone"
    ON event_interests FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can express interest"
    ON event_interests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interest"
    ON event_interests FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own interest"
    ON event_interests FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
