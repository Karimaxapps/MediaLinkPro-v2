-- Tighten EXECUTE grants on SECURITY DEFINER functions added in this batch.
--
-- Supabase grants EXECUTE to anon/authenticated by default, which the advisor
-- flags for SECURITY DEFINER functions. Lock these down:
--   * enforce_message_quota() is a trigger function — it fires from the trigger
--     context and must never be directly callable, so revoke from everyone.
--   * get_unread_message_count() is called by the signed-in app user, so keep
--     authenticated but drop anon.

revoke all on function public.enforce_message_quota() from public, anon, authenticated;

revoke execute on function public.get_unread_message_count() from anon;
