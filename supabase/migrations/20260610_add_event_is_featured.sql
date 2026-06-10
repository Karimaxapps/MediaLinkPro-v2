-- ─────────────────────────────────────────────────────────────────────────────
-- Featured events
-- Adds events.is_featured so site admins can pick which events/workshops are
-- highlighted in the dashboard feed's right-hand column.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_is_featured
  ON public.events (is_featured)
  WHERE is_featured = true;
