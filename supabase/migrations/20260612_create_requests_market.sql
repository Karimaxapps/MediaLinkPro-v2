-- Requests Market
-- Seekers (individuals or organizations) post detailed requests — a solution,
-- a technology, or a production crew. Providers (individuals or organizations)
-- express interest with a short pitch. The request owner reviews interests and
-- starts a conversation in the existing messaging system; the linked
-- conversation id is stored on the interest row.

-- Enums -----------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE market_request_category AS ENUM ('solution', 'technology', 'crew', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE market_request_status AS ENUM ('draft', 'open', 'closed', 'fulfilled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE market_interest_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Requests --------------------------------------------------------------------
-- posted_by is always the human poster; organization_id is set only when the
-- request is posted on behalf of an org the poster can edit.
CREATE TABLE IF NOT EXISTS market_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 160),
    slug TEXT NOT NULL UNIQUE,
    category market_request_category NOT NULL DEFAULT 'other',
    description TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    currency TEXT DEFAULT 'USD',
    location TEXT,
    is_remote BOOLEAN DEFAULT false,
    skills TEXT[] DEFAULT '{}',
    deadline DATE,
    expires_at TIMESTAMPTZ,
    status market_request_status NOT NULL DEFAULT 'open',
    interest_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interests -------------------------------------------------------------------
-- profile_id is always the human sender; organization_id is set when the
-- interest is sent on behalf of an org. One pitch per human per request.
-- conversation_id links the messaging thread once the owner accepts.
CREATE TABLE IF NOT EXISTS market_request_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES market_requests(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    pitch TEXT NOT NULL CHECK (char_length(pitch) >= 10 AND char_length(pitch) <= 2000),
    status market_interest_status NOT NULL DEFAULT 'pending',
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(request_id, profile_id)
);

-- Indexes ----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_market_requests_posted_by ON market_requests(posted_by);
CREATE INDEX IF NOT EXISTS idx_market_requests_org_id ON market_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_market_requests_status ON market_requests(status);
CREATE INDEX IF NOT EXISTS idx_market_requests_category ON market_requests(category);
CREATE INDEX IF NOT EXISTS idx_market_requests_created_at ON market_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_interests_request_id ON market_request_interests(request_id);
CREATE INDEX IF NOT EXISTS idx_market_interests_profile_id ON market_request_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_market_interests_org_id ON market_request_interests(organization_id);
CREATE INDEX IF NOT EXISTS idx_market_interests_status ON market_request_interests(status);
CREATE INDEX IF NOT EXISTS idx_market_interests_created_at ON market_request_interests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_interests_conversation_id ON market_request_interests(conversation_id);

-- updated_at trigger (touch_jobs_updated_at is generic: sets NEW.updated_at) ---
DROP TRIGGER IF EXISTS trg_market_requests_touch ON market_requests;
CREATE TRIGGER trg_market_requests_touch BEFORE UPDATE ON market_requests
    FOR EACH ROW EXECUTE FUNCTION touch_jobs_updated_at();

DROP TRIGGER IF EXISTS trg_market_interests_touch ON market_request_interests;
CREATE TRIGGER trg_market_interests_touch BEFORE UPDATE ON market_request_interests
    FOR EACH ROW EXECUTE FUNCTION touch_jobs_updated_at();

-- Interest count maintenance ---------------------------------------------------
CREATE OR REPLACE FUNCTION market_request_interests_bump_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE market_requests SET interest_count = interest_count + 1 WHERE id = NEW.request_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE market_requests SET interest_count = GREATEST(interest_count - 1, 0) WHERE id = OLD.request_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_market_interests_count ON market_request_interests;
CREATE TRIGGER trg_market_interests_count
    AFTER INSERT OR DELETE ON market_request_interests
    FOR EACH ROW EXECUTE FUNCTION market_request_interests_bump_count();

-- RLS ---------------------------------------------------------------------------
ALTER TABLE market_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_request_interests ENABLE ROW LEVEL SECURITY;

-- Requests: open listings visible to everyone
DROP POLICY IF EXISTS "Open market requests are viewable by everyone" ON market_requests;
CREATE POLICY "Open market requests are viewable by everyone"
    ON market_requests FOR SELECT
    USING (status = 'open');

-- Requests: poster and org members see their own drafts / closed requests
DROP POLICY IF EXISTS "Owners see all their market requests" ON market_requests;
CREATE POLICY "Owners see all their market requests"
    ON market_requests FOR SELECT
    TO authenticated
    USING (
        posted_by = auth.uid()
        OR (organization_id IS NOT NULL AND is_org_member(organization_id))
    );

-- Requests: insert as self, optionally on behalf of an editable org
DROP POLICY IF EXISTS "Users can post market requests" ON market_requests;
CREATE POLICY "Users can post market requests"
    ON market_requests FOR INSERT
    TO authenticated
    WITH CHECK (
        posted_by = auth.uid()
        AND (organization_id IS NULL OR can_edit_org(organization_id))
    );

DROP POLICY IF EXISTS "Owners can update market requests" ON market_requests;
CREATE POLICY "Owners can update market requests"
    ON market_requests FOR UPDATE
    TO authenticated
    USING (
        posted_by = auth.uid()
        OR (organization_id IS NOT NULL AND can_edit_org(organization_id))
    );

DROP POLICY IF EXISTS "Owners can delete market requests" ON market_requests;
CREATE POLICY "Owners can delete market requests"
    ON market_requests FOR DELETE
    TO authenticated
    USING (
        posted_by = auth.uid()
        OR (organization_id IS NOT NULL AND is_org_admin(organization_id))
    );

-- Interests: senders see their own (incl. org members of the sending org)
DROP POLICY IF EXISTS "Senders see their own interests" ON market_request_interests;
CREATE POLICY "Senders see their own interests"
    ON market_request_interests FOR SELECT
    TO authenticated
    USING (
        profile_id = auth.uid()
        OR (organization_id IS NOT NULL AND is_org_member(organization_id))
    );

-- Interests: request owners see interests on their requests
DROP POLICY IF EXISTS "Request owners see interests" ON market_request_interests;
CREATE POLICY "Request owners see interests"
    ON market_request_interests FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM market_requests r
            WHERE r.id = market_request_interests.request_id
            AND (
                r.posted_by = auth.uid()
                OR (r.organization_id IS NOT NULL AND can_edit_org(r.organization_id))
            )
        )
    );

-- Interests: insert as self, optionally on behalf of an editable org; the
-- NOT EXISTS blocks pitching your own request or your org pitching its own
-- org-posted request.
DROP POLICY IF EXISTS "Users can express interest" ON market_request_interests;
CREATE POLICY "Users can express interest"
    ON market_request_interests FOR INSERT
    TO authenticated
    WITH CHECK (
        profile_id = auth.uid()
        AND (organization_id IS NULL OR can_edit_org(organization_id))
        AND NOT EXISTS (
            SELECT 1 FROM market_requests r
            WHERE r.id = market_request_interests.request_id
            AND (
                r.posted_by = auth.uid()
                OR (r.organization_id IS NOT NULL
                    AND r.organization_id = market_request_interests.organization_id)
            )
        )
    );

-- Interests: sender can withdraw; request owner can accept/decline/link chat
DROP POLICY IF EXISTS "Senders or request owners can update interests" ON market_request_interests;
CREATE POLICY "Senders or request owners can update interests"
    ON market_request_interests FOR UPDATE
    TO authenticated
    USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM market_requests r
            WHERE r.id = market_request_interests.request_id
            AND (
                r.posted_by = auth.uid()
                OR (r.organization_id IS NOT NULL AND can_edit_org(r.organization_id))
            )
        )
    );

-- Interests: sender can delete their own
DROP POLICY IF EXISTS "Senders can delete their interests" ON market_request_interests;
CREATE POLICY "Senders can delete their interests"
    ON market_request_interests FOR DELETE
    TO authenticated
    USING (profile_id = auth.uid());
