-- Reduce PII retention on product_scans.
--
-- IP addresses are personal data. The scan route now stores a salted SHA-256
-- hash instead of the raw IP, but historical rows may still hold raw values and
-- the table grows without bound. This migration:
--   1. Scrubs any raw IPv4/IPv6 still stored (one-time).
--   2. Schedules a daily purge of scan rows older than 90 days.

-- One-time scrub: null out anything that still looks like a raw IP address.
-- (Hashes are 64-char hex and won't match these patterns.)
update public.product_scans
set ip_address = null
where ip_address is not null
  and (
    ip_address ~ '^[0-9]{1,3}(\.[0-9]{1,3}){3}$'  -- IPv4
    or ip_address ~ ':'                            -- IPv6 (contains a colon)
  );

-- Daily retention purge (90 days). Guarded so the migration still applies where
-- pg_cron is unavailable (e.g. local dev).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    if exists (select 1 from cron.job where jobname = 'purge-old-product-scans') then
      perform cron.unschedule('purge-old-product-scans');
    end if;
    perform cron.schedule(
      'purge-old-product-scans',
      '30 3 * * *',
      $cron$ delete from public.product_scans where scanned_at < now() - interval '90 days'; $cron$
    );
  end if;
end;
$$;
