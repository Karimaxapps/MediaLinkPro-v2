-- Expire gifted subscriptions whose `gifted_until` has passed.
--
-- Background: admin gifting sets subscriptions.plan to the gifted tier and
-- subscriptions.gifted_until to an expiry date, but nothing ever reverted the
-- plan once the gift lapsed — so a time-boxed gift effectively became
-- permanent (a revenue/entitlement bug).
--
-- This migration adds:
--   1. expire_gifted_subscriptions() — downgrades expired gift rows that are
--      not backed by a live Stripe subscription.
--   2. A daily pg_cron job (03:00 UTC) that runs it.
--
-- The read path (src/lib/subscription/gate.ts) independently treats
-- gifted_until as authoritative, so entitlements are correct even between
-- cron runs; this job keeps the stored rows consistent.

create or replace function public.expire_gifted_subscriptions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  with updated as (
    update public.subscriptions s
    set
      plan = case when s.organization_id is not null then 'org_free' else 'free' end,
      plan_track = case when s.organization_id is not null then 'org' else 'individual' end,
      status = 'active',
      gifted_until = null,
      gifted_note = null,
      gifted_by = null,
      updated_at = now()
    where s.gifted_until is not null
      and s.gifted_until < now()
      -- Leave rows backed by a live Stripe subscription untouched; their plan
      -- is authoritative and maintained by the Stripe webhook.
      and (
        s.stripe_subscription_id is null
        or s.status not in ('active', 'trialing')
      )
    returning 1
  )
  select count(*) into affected from updated;

  return affected;
end;
$$;

-- Lock the function down: it bypasses RLS, so it must not be callable by the
-- anon/authenticated roles. Only the cron job (postgres) and service role run it.
revoke all on function public.expire_gifted_subscriptions() from public;
revoke all on function public.expire_gifted_subscriptions() from anon, authenticated;

-- Schedule a daily sweep. Guarded so the migration still applies on databases
-- where pg_cron is unavailable (e.g. local dev without the extension).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;

    if exists (select 1 from cron.job where jobname = 'expire-gifted-subscriptions') then
      perform cron.unschedule('expire-gifted-subscriptions');
    end if;

    perform cron.schedule(
      'expire-gifted-subscriptions',
      '0 3 * * *',
      $cron$ select public.expire_gifted_subscriptions(); $cron$
    );
  end if;
end;
$$;
