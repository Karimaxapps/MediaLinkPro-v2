-- Per-claim email opt-in. When true (the default), the requester receives an
-- email when an admin approves/rejects their ownership claim, in addition to
-- the in-app notification + mobile push. When false, only the internal
-- notification is sent.
ALTER TABLE public.content_ownership_requests
  ADD COLUMN IF NOT EXISTS notify_by_email BOOLEAN NOT NULL DEFAULT true;
