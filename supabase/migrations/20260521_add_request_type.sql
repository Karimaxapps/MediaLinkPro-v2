-- Add request_type to demo_requests so the same table/flow serves both
-- "demo" and "quote" inquiries, and make the owner notification generic.

ALTER TABLE demo_requests
    ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'demo'
    CHECK (request_type IN ('demo', 'quote'));

-- Drop the previous 8-arg version so the new 9-arg overload is the only
-- code path (adding an arg creates an overload rather than replacing).
DROP FUNCTION IF EXISTS create_demo_request_with_notification(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_demo_request_with_notification(
    p_product_id UUID,
    p_organization_id UUID,
    p_requester_id UUID,
    p_contact_name TEXT,
    p_contact_email TEXT,
    p_contact_phone TEXT,
    p_company_name TEXT,
    p_message TEXT,
    p_request_type TEXT DEFAULT 'demo'
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_owner_id UUID;
    v_product_name TEXT;
BEGIN
    SELECT name INTO v_product_name FROM products WHERE id = p_product_id;

    INSERT INTO demo_requests (
        product_id,
        organization_id,
        requester_id,
        contact_name,
        contact_email,
        contact_phone,
        company_name,
        message,
        request_type
    ) VALUES (
        p_product_id,
        p_organization_id,
        p_requester_id,
        p_contact_name,
        p_contact_email,
        p_contact_phone,
        p_company_name,
        p_message,
        COALESCE(p_request_type, 'demo')
    ) RETURNING id INTO v_request_id;

    -- Notify organization owners and admins with a generic message that
    -- covers both demo and quote requests.
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
            'New product request',
            p_contact_name || ' submitted a ' || COALESCE(p_request_type, 'demo') || ' request for ' || v_product_name,
            jsonb_build_object('request_id', v_request_id, 'product_id', p_product_id, 'request_type', COALESCE(p_request_type, 'demo'))
        );
    END LOOP;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
