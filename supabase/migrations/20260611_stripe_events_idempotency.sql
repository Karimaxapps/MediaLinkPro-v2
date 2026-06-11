-- Idempotency log for Stripe webhook events.
--
-- Stripe retries webhook deliveries and can deliver events out of order, so the
-- handler must be safe to run more than once per event. We record each handled
-- event.id here and short-circuit duplicates before processing.

create table if not exists public.stripe_events (
  id text primary key,            -- Stripe event id (evt_...)
  type text,
  received_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- No policies: only the webhook (service role, bypasses RLS) touches this table.
