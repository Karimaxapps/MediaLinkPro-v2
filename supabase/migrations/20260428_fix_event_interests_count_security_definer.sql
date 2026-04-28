-- The event_interests_bump_count trigger updates events.interest_count,
-- but it runs as the inserting user — who typically can't update the
-- `events` table because of RLS (only org editors can). The UPDATE was
-- silently no-op'd, leaving interest_count stuck at 0.
--
-- Re-declare the trigger function as SECURITY DEFINER so it bypasses RLS
-- on the events table, and backfill any rows that fell out of sync.

CREATE OR REPLACE FUNCTION event_interests_bump_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET interest_count = interest_count + 1 WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET interest_count = GREATEST(0, interest_count - 1) WHERE id = OLD.event_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

UPDATE events e
SET interest_count = sub.cnt
FROM (
    SELECT event_id, count(*)::int AS cnt
    FROM event_interests
    GROUP BY event_id
) sub
WHERE e.id = sub.event_id
  AND e.interest_count IS DISTINCT FROM sub.cnt;
