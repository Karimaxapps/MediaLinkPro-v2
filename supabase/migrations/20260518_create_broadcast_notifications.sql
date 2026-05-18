-- Broadcast notifications: admin-authored notifications fanned out to all users
-- plus delivery to mobile device push tokens.

-- 1. Extend the notifications table with media + link fields.
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS link_url TEXT;

-- 2. Broadcasts: a record of each admin-sent broadcast (for history/audit).
CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    link_url TEXT,
    recipient_count INTEGER DEFAULT 0,
    push_sent_count INTEGER DEFAULT 0,
    push_failed_count INTEGER DEFAULT 0
);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Only admins can read broadcasts. Inserts/updates go through service-role admin client.
DROP POLICY IF EXISTS "Admins can view broadcasts" ON broadcasts;
CREATE POLICY "Admins can view broadcasts" ON broadcasts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- 3. Device push tokens (Expo / FCM). Tied to a user; users can register/revoke their own.
CREATE TABLE IF NOT EXISTS device_push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    provider TEXT NOT NULL DEFAULT 'expo' CHECK (provider IN ('expo', 'fcm', 'apns')),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS device_push_tokens_user_id_idx ON device_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS device_push_tokens_token_idx ON device_push_tokens(token);

ALTER TABLE device_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own push tokens" ON device_push_tokens;
CREATE POLICY "Users can view their own push tokens" ON device_push_tokens
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own push tokens" ON device_push_tokens;
CREATE POLICY "Users can insert their own push tokens" ON device_push_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push tokens" ON device_push_tokens;
CREATE POLICY "Users can update their own push tokens" ON device_push_tokens
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own push tokens" ON device_push_tokens;
CREATE POLICY "Users can delete their own push tokens" ON device_push_tokens
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
    ON notifications(user_id, created_at DESC);
