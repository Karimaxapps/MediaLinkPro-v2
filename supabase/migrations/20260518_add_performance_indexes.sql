-- Performance indexes for hot-path FK / filter columns
-- Postgres does NOT auto-index foreign keys, so high-traffic lookups
-- against these columns were doing sequential scans.

-- notifications: bell-icon query "show my notifications"
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON public.notifications (user_id);

-- Common query: list user's notifications newest first
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON public.notifications (user_id, created_at DESC);

-- Common query: count unread notifications for the badge
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON public.notifications (user_id)
    WHERE is_read = FALSE;

-- conversation_participants: "is this user in this conversation" check
-- runs on every message read/write via the is_conversation_participant() RLS helper
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv_profile
    ON public.conversation_participants (conversation_id, profile_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_profile_id
    ON public.conversation_participants (profile_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_organization_id
    ON public.conversation_participants (organization_id)
    WHERE organization_id IS NOT NULL;

-- messages: loading a conversation's messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON public.messages (conversation_id);

-- Paginated message loading (newest first within a conversation)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
    ON public.messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_profile_id
    ON public.messages (sender_profile_id);

-- product_bookmarks: the UNIQUE(user_id, product_id) constraint already
-- gives us an index covering user_id and (user_id, product_id) lookups,
-- but NOT lookups by product_id alone (e.g. "who bookmarked this product")
CREATE INDEX IF NOT EXISTS idx_product_bookmarks_product_id
    ON public.product_bookmarks (product_id);

-- demo_requests: org-dashboard listings and per-product/per-user lookups
CREATE INDEX IF NOT EXISTS idx_demo_requests_organization_id
    ON public.demo_requests (organization_id);

CREATE INDEX IF NOT EXISTS idx_demo_requests_product_id
    ON public.demo_requests (product_id);

CREATE INDEX IF NOT EXISTS idx_demo_requests_requester_id
    ON public.demo_requests (requester_id);

-- Common query: open (pending) requests for an org, newest first
CREATE INDEX IF NOT EXISTS idx_demo_requests_org_status_created
    ON public.demo_requests (organization_id, status, created_at DESC);
