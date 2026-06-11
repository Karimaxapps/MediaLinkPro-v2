-- Durable, multi-instance rate-limit counters.
--
-- The API routes previously rate-limited with a per-process in-memory Map,
-- which (a) doesn't work behind multiple Node instances / serverless — each
-- worker has its own counter, so the effective limit is N× and trivially
-- bypassed by reconnecting — and (b) leaked memory (keys were never evicted).
--
-- src/lib/rate-limit.ts uses this table (via rate_limit_hit) when Upstash Redis
-- isn't configured, giving a counter shared across every instance.

create table if not exists public.rate_limit_counters (
  key text primary key,
  count integer not null default 0,
  expires_at timestamptz not null
);

alter table public.rate_limit_counters enable row level security;
-- Intentionally no policies: only the service role (bypasses RLS) and the
-- SECURITY DEFINER function below touch this table. anon/authenticated cannot.

create or replace function public.rate_limit_hit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  -- Atomic upsert: start a fresh window when the bucket is new or expired,
  -- otherwise increment the existing one.
  insert into public.rate_limit_counters (key, count, expires_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set
      count = case
                when public.rate_limit_counters.expires_at < now() then 1
                else public.rate_limit_counters.count + 1
              end,
      expires_at = case
                     when public.rate_limit_counters.expires_at < now()
                       then now() + make_interval(secs => p_window_seconds)
                     else public.rate_limit_counters.expires_at
                   end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public;
revoke all on function public.rate_limit_hit(text, integer, integer) from anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- Purge expired counters hourly (best-effort; a bucket is also reset in place
-- on the next hit for the same key, so this only reclaims abandoned keys).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    if exists (select 1 from cron.job where jobname = 'purge-rate-limit-counters') then
      perform cron.unschedule('purge-rate-limit-counters');
    end if;
    perform cron.schedule(
      'purge-rate-limit-counters',
      '15 * * * *',
      $cron$ delete from public.rate_limit_counters where expires_at < now() - interval '1 hour'; $cron$
    );
  end if;
end;
$$;
