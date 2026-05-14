-- Support tickets: user-submitted feedback, suggestions, and support requests.
-- Admins read/update via the service-role client (bypasses RLS).

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL CHECK (type IN ('feedback', 'suggestion', 'support')),
  subject     TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply TEXT,
  replied_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own tickets"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx   ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx    ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx ON public.support_tickets(created_at DESC);
