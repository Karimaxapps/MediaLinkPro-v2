-- Notification preferences per user
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications boolean NOT NULL DEFAULT true,
    product_updates boolean NOT NULL DEFAULT true,
    connection_requests boolean NOT NULL DEFAULT true,
    demo_requests boolean NOT NULL DEFAULT true,
    event_invites boolean NOT NULL DEFAULT true,
    messages boolean NOT NULL DEFAULT true,
    marketing_emails boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users manage own notification preferences"
    ON public.notification_preferences
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_notification_preferences()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_notification_preferences ON public.notification_preferences;
CREATE TRIGGER trg_touch_notification_preferences
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.touch_notification_preferences();
