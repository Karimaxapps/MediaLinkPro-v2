-- Track follower counts on organizations, kept in sync with
-- organization_followers via triggers. Backfilled from existing rows.

ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS followers_count BIGINT NOT NULL DEFAULT 0;

-- Backfill current counts.
UPDATE public.organizations o
SET followers_count = sub.cnt
FROM (
    SELECT organization_id, COUNT(*)::bigint AS cnt
    FROM public.organization_followers
    GROUP BY organization_id
) sub
WHERE o.id = sub.organization_id;

CREATE OR REPLACE FUNCTION public.increment_org_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.organizations
    SET followers_count = followers_count + 1
    WHERE id = NEW.organization_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_org_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.organizations
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.organization_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_org_follower_created ON public.organization_followers;
CREATE TRIGGER on_org_follower_created
AFTER INSERT ON public.organization_followers
FOR EACH ROW
EXECUTE FUNCTION public.increment_org_followers_count();

DROP TRIGGER IF EXISTS on_org_follower_deleted ON public.organization_followers;
CREATE TRIGGER on_org_follower_deleted
AFTER DELETE ON public.organization_followers
FOR EACH ROW
EXECUTE FUNCTION public.decrement_org_followers_count();
