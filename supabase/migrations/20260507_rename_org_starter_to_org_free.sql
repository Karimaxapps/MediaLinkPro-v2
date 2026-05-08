-- Rename org_starter plan to org_free.
-- The Starter plan is being replaced with a free org plan that becomes the
-- default for company profiles. Existing rows on org_starter are migrated
-- to org_free.

-- 1. Drop the existing CHECK constraint so we can rename plan values.
ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- 2. Migrate any existing rows.
UPDATE public.subscriptions
   SET plan = 'org_free'
 WHERE plan = 'org_starter';

-- 3. Re-apply CHECK constraint with the updated plan ID set.
ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_plan_check
    CHECK (plan IN ('free', 'individual_pro', 'org_free', 'org_growth', 'org_enterprise'));
