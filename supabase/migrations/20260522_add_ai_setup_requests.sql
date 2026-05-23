-- AI Setup Builder: stores a user's brief + budget, the AI-generated setup
-- recommendation (grounded in real products), and a notify RPC that alerts the
-- owners of every recommended product once the user confirms satisfaction.

CREATE TABLE IF NOT EXISTS ai_setup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    brief JSONB NOT NULL DEFAULT '{}'::jsonb,
    budget_amount NUMERIC,
    budget_currency TEXT NOT NULL DEFAULT 'USD',
    recommendation JSONB NOT NULL DEFAULT '{}'::jsonb,
    product_ids UUID[] NOT NULL DEFAULT '{}',
    satisfied BOOLEAN,
    status TEXT NOT NULL DEFAULT 'generated'
        CHECK (status IN ('generated', 'confirmed', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_setup_requests_requester
    ON ai_setup_requests (requester_id);

CREATE INDEX IF NOT EXISTS idx_ai_setup_requests_product_ids
    ON ai_setup_requests USING GIN (product_ids);

-- Keep updated_at fresh.
CREATE OR REPLACE FUNCTION set_ai_setup_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_setup_requests_updated_at ON ai_setup_requests;
CREATE TRIGGER trg_ai_setup_requests_updated_at
    BEFORE UPDATE ON ai_setup_requests
    FOR EACH ROW EXECUTE FUNCTION set_ai_setup_requests_updated_at();

-- Row Level Security
ALTER TABLE ai_setup_requests ENABLE ROW LEVEL SECURITY;

-- Requester can read their own requests.
DROP POLICY IF EXISTS "ai_setup_requests_select_own" ON ai_setup_requests;
CREATE POLICY "ai_setup_requests_select_own" ON ai_setup_requests
    FOR SELECT USING (requester_id = auth.uid());

-- Org owners/admins can read requests that recommend one of their products,
-- so they have context when they reach out.
DROP POLICY IF EXISTS "ai_setup_requests_select_owners" ON ai_setup_requests;
CREATE POLICY "ai_setup_requests_select_owners" ON ai_setup_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM products p
            JOIN organization_members om ON om.organization_id = p.organization_id
            WHERE p.id = ANY (ai_setup_requests.product_ids)
              AND om.user_id = auth.uid()
              AND om.role IN ('owner', 'admin')
        )
    );

-- Requester can create their own requests.
DROP POLICY IF EXISTS "ai_setup_requests_insert_own" ON ai_setup_requests;
CREATE POLICY "ai_setup_requests_insert_own" ON ai_setup_requests
    FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Requester can update their own requests (e.g. confirm satisfaction).
DROP POLICY IF EXISTS "ai_setup_requests_update_own" ON ai_setup_requests;
CREATE POLICY "ai_setup_requests_update_own" ON ai_setup_requests
    FOR UPDATE USING (requester_id = auth.uid())
    WITH CHECK (requester_id = auth.uid());

-- Notify the owners/admins of every organization whose product appears in the
-- confirmed setup. SECURITY DEFINER so it can read members + insert cross-user
-- notifications regardless of the caller's RLS scope.
CREATE OR REPLACE FUNCTION notify_ai_setup_owners(p_request_id UUID)
RETURNS VOID AS $$
DECLARE
    v_requester_name TEXT;
    v_product_ids UUID[];
    v_member RECORD;
BEGIN
    SELECT product_ids INTO v_product_ids
    FROM ai_setup_requests
    WHERE id = p_request_id;

    IF v_product_ids IS NULL OR array_length(v_product_ids, 1) IS NULL THEN
        RETURN;
    END IF;

    SELECT COALESCE(p.full_name, 'A MediaLinkPro user')
    INTO v_requester_name
    FROM ai_setup_requests r
    LEFT JOIN profiles p ON p.id = r.requester_id
    WHERE r.id = p_request_id;

    -- One notification per distinct owner/admin across all recommended products.
    FOR v_member IN
        SELECT DISTINCT om.user_id
        FROM products p
        JOIN organization_members om ON om.organization_id = p.organization_id
        WHERE p.id = ANY (v_product_ids)
          AND om.role IN ('owner', 'admin')
    LOOP
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            v_member.user_id,
            'ai_setup_request',
            'New AI setup lead',
            v_requester_name || ' built an AI setup that includes your product and wants to connect.',
            jsonb_build_object('request_id', p_request_id, 'product_ids', to_jsonb(v_product_ids))
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
