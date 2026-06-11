-- Tighten the product_scans INSERT policy.
--
-- The original policy was WITH CHECK (true), letting anyone insert any row via
-- PostgREST — including attributing a scan to another user by setting
-- scanner_id to their id (which pollutes the owner-facing "who scanned this"
-- list). Restrict inserts to anonymous (null scanner) or self-attributed rows.
-- The scan route already inserts scanner_id as null (anonymous) or the caller's
-- own id, so this is non-breaking.

drop policy if exists "Anyone can insert scans" on public.product_scans;

create policy "Anyone can insert scans"
on public.product_scans for insert
with check (scanner_id is null or scanner_id = auth.uid());
