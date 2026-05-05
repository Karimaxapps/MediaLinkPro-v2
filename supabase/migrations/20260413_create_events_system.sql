-- Events System
-- Allows organizations to create and manage industry events (conferences, webinars, workshops, etc.)

-- Create event_type enum
DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('conference', 'webinar', 'workshop', 'meetup', 'trade_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create event_status enum
DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create registration_status enum
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('registered', 'waitlisted', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    slug TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL DEFAULT 'conference',
    status event_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    is_online BOOLEAN DEFAULT false,
    online_url TEXT,
    cover_image_url TEXT,
    max_attendees INTEGER,
    registration_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, slug),
    CHECK (end_date >= start_date)
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Create event_speakers table
CREATE TABLE IF NOT EXISTS event_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
-- Published events are readable by everyone
CREATE POLICY "Published events are viewable by everyone"
    ON events FOR SELECT
    USING (status = 'published');

-- Org members can see draft events
CREATE POLICY "Org members can see draft events"
    ON events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = events.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- Org admins/editors can create events
CREATE POLICY "Org editors can create events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = events.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

-- Org admins/editors can update events
CREATE POLICY "Org editors can update events"
    ON events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = events.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );

-- Org admins can delete events
CREATE POLICY "Org admins can delete events"
    ON events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = events.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
    );

-- RLS Policies for event_registrations
CREATE POLICY "Registrations are viewable by event org members"
    ON event_registrations FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can register"
    ON event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registration"
    ON event_registrations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their registration"
    ON event_registrations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for event_speakers
CREATE POLICY "Speakers are viewable by everyone"
    ON event_speakers FOR SELECT
    USING (true);

CREATE POLICY "Org editors can manage speakers"
    ON event_speakers FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM events e
            JOIN organization_members om ON om.organization_id = e.organization_id
            WHERE e.id = event_speakers.event_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'editor')
        )
    );
