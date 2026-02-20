-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS demo_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Create demo_requests table
CREATE TABLE demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    company_name TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'ignored'))
);

-- Enable RLS for demo_requests
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Policies for demo_requests
-- Users can see their own requests
CREATE POLICY "Users can view their own requests" ON demo_requests
    FOR SELECT USING (auth.uid() = requester_id);

-- Organization members with permissions can view requests for their org
CREATE POLICY "Org members can view requests" ON demo_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = demo_requests.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'editor', 'viewer')
        )
    );

-- Everyone can insert requests
CREATE POLICY "Anyone can create requests" ON demo_requests
    FOR INSERT WITH CHECK (true);

-- Only org admins/owners can update status
CREATE POLICY "Org admins/owners can update requests" ON demo_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = demo_requests.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'demo_request', 'system', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Check if function exists before creating to avoid errors if rerunning
DROP FUNCTION IF EXISTS create_demo_request_with_notification;

-- Function to create demo request and notify org owners
CREATE OR REPLACE FUNCTION create_demo_request_with_notification(
    p_product_id UUID,
    p_organization_id UUID,
    p_requester_id UUID,
    p_contact_name TEXT,
    p_contact_email TEXT,
    p_contact_phone TEXT,
    p_company_name TEXT,
    p_message TEXT
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_owner_id UUID;
    v_product_name TEXT;
BEGIN
    -- Get product name
    SELECT name INTO v_product_name FROM products WHERE id = p_product_id;

    -- Insert request
    INSERT INTO demo_requests (
        product_id,
        organization_id,
        requester_id,
        contact_name,
        contact_email,
        contact_phone,
        company_name,
        message
    ) VALUES (
        p_product_id,
        p_organization_id,
        p_requester_id,
        p_contact_name,
        p_contact_email,
        p_contact_phone,
        p_company_name,
        p_message
    ) RETURNING id INTO v_request_id;

    -- Notify organization owners and admins
    FOR v_owner_id IN
        SELECT user_id FROM organization_members
        WHERE organization_id = p_organization_id
        AND role IN ('owner', 'admin')
    LOOP
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data
        ) VALUES (
            v_owner_id,
            'demo_request',
            'New Demo Request',
            'You have a new demo request for ' || v_product_name,
            jsonb_build_object('request_id', v_request_id, 'product_id', p_product_id)
        );
    END LOOP;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
