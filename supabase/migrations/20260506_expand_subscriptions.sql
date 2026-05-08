-- Expand subscriptions: dual plan tracks (individual/org), annual billing,
-- gifted/comped subscriptions, and helper functions for feature gating.

BEGIN;

-- 1. Drop old CHECK constraint so we can rename plan values + extend the set.
ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- 2. Migrate legacy plan IDs to new naming.
UPDATE public.subscriptions SET plan = 'individual_pro' WHERE plan = 'pro';
UPDATE public.subscriptions SET plan = 'org_enterprise' WHERE plan = 'enterprise';

-- 3. Re-apply CHECK constraint with the expanded plan ID set.
ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_plan_check
    CHECK (plan IN ('free', 'individual_pro', 'org_starter', 'org_growth', 'org_enterprise'));

-- 4. Add new columns.
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS plan_track text NOT NULL DEFAULT 'individual'
        CHECK (plan_track IN ('individual', 'org')),
    ADD COLUMN IF NOT EXISTS billing_interval text NOT NULL DEFAULT 'month'
        CHECK (billing_interval IN ('month', 'year')),
    ADD COLUMN IF NOT EXISTS gifted_until timestamptz DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS gifted_by uuid DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS gifted_note text DEFAULT NULL;

-- 5. Backfill plan_track for already-migrated rows.
UPDATE public.subscriptions
    SET plan_track = 'org'
    WHERE plan IN ('org_starter', 'org_growth', 'org_enterprise');

UPDATE public.subscriptions
    SET plan_track = 'individual'
    WHERE plan IN ('free', 'individual_pro');

-- 6. Restrict gifted_* columns to service role only.
--    RLS controls row visibility; column privileges control which columns
--    each role can SELECT/UPDATE. Service role bypasses both.
REVOKE SELECT (gifted_until, gifted_by, gifted_note)
    ON public.subscriptions FROM anon, authenticated;

REVOKE UPDATE (gifted_until, gifted_by, gifted_note)
    ON public.subscriptions FROM anon, authenticated;

REVOKE INSERT (gifted_until, gifted_by, gifted_note)
    ON public.subscriptions FROM anon, authenticated;

-- 7. Helper: get the plan ID for a given user.
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
RETURNS text AS $$
    SELECT plan FROM public.subscriptions WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO anon, authenticated;

-- 8. Feature-gate helper: does this user have one of the required plans?
CREATE OR REPLACE FUNCTION public.user_has_plan(p_user_id uuid, required_plans text[])
RETURNS boolean AS $$
    SELECT COALESCE(
        (SELECT plan = ANY(required_plans) FROM public.subscriptions WHERE user_id = p_user_id),
        false
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.user_has_plan(uuid, text[]) TO anon, authenticated;

-- 9. Index for admin lookups of active gifts.
CREATE INDEX IF NOT EXISTS idx_subscriptions_gifted_until
    ON public.subscriptions(gifted_until)
    WHERE gifted_until IS NOT NULL;

COMMIT;
