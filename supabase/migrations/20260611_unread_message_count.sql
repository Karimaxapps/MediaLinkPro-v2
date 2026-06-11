-- Single-query unread message count for the current user.
--
-- fetchUnreadMessageCount() previously selected every conversation id the user
-- belongs to, then ran a second `IN (...)` count over all of them — unbounded
-- and slow for engaged users. This SECURITY DEFINER function computes the count
-- in one scan, scoped to auth.uid().

create or replace function public.get_unread_message_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer
  from public.messages m
  where m.is_read = false
    and m.sender_profile_id is distinct from auth.uid()
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = m.conversation_id
        and (
          cp.profile_id = auth.uid()
          or (cp.organization_id is not null and public.is_org_member(cp.organization_id))
        )
    );
$$;

revoke all on function public.get_unread_message_count() from public;
grant execute on function public.get_unread_message_count() to authenticated;

-- Partial index supporting the unread scan.
create index if not exists idx_messages_unread
  on public.messages (conversation_id)
  where is_read = false;
