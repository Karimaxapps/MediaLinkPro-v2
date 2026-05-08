-- Per-organization subscriptions.
--
-- Until now the subscriptions table held one row per user (their personal
-- plan: free / individual_pro). This migration extends the table so each
-- organization gets its own subscription row, defaulting to org_free.
--
-- Shape after this migration:
--   - user-owned subs: user_id IS NOT NULL, organization_id IS NULL
--   - org-owned subs:  organization_id IS NOT NULL, user_id IS NULL
--   - exactly one of the two is set (CHECK + partial unique indexes)

-- 1. Add organization_id and relax user_id (both nullable now).
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS organization_id uuid
        REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
    ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop the column-level UNIQUE on user_id (auto-named *_user_id_key).
--    Replaced below by partial unique indexes that allow either side.
ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;

-- 3. Owner exclusivity: exactly one of user_id / organization_id is set.
ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_owner_exclusive;
ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_owner_exclusive CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL)
        OR (user_id IS NULL AND organization_id IS NOT NULL)
    );

-- 4. Partial unique indexes — one row per user, one row per org.
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_unique
    ON public.subscriptions(user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_organization_id_unique
    ON public.subscriptions(organization_id) WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_org
    ON public.subscriptions(organization_id);

-- 5. RLS: org members can read their org's subscription.
DROP POLICY IF EXISTS "Org members read org subscription" ON public.subscriptions;
CREATE POLICY "Org members read org subscription"
    ON public.subscriptions
    FOR SELECT
    USING (
        organization_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = subscriptions.organization_id
              AND om.user_id = auth.uid()
        )
    );

-- 6. Backfill: every existing organization gets an org_free subscription.
INSERT INTO public.subscriptions (organization_id, plan, plan_track, status, billing_interval)
SELECT o.id, 'org_free', 'org', 'active', 'month'
  FROM public.organizations o
 WHERE NOT EXISTS (
        SELECT 1 FROM public.subscriptions s WHERE s.organization_id = o.id
 );

-- 7. Auto-create an org_free subscription whenever a new organization is inserted.
CREATE OR REPLACE FUNCTION public.create_org_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.subscriptions (organization_id, plan, plan_track, status, billing_interval)
    VALUES (NEW.id, 'org_free', 'org', 'active', 'month')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_org_subscription ON public.organizations;
CREATE TRIGGER trg_org_subscription
    AFTER INSERT ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.create_org_subscription();
