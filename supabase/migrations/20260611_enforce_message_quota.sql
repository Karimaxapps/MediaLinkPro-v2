-- Enforce the "3 unanswered messages" anti-spam rule at the database level.
--
-- The rule was previously enforced only in the sendMessage() server action, so
-- a user holding their own anon JWT could call PostgREST directly and insert
-- unlimited messages, bypassing the cap. This BEFORE INSERT trigger mirrors the
-- exact application logic so the limit holds regardless of how the row is
-- inserted. (The messages INSERT RLS policy already requires
-- sender_profile_id = auth.uid(), so the sender can't be spoofed.)
--
-- Rule: a user may send up to 3 messages to someone new; once the other party
-- replies the thread opens to unlimited. Connected professionals (an accepted
-- connection) are exempt from the start.

create or replace function public.enforce_message_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid := new.sender_profile_id;
  v_other uuid;
  v_recipient_replied boolean;
  v_connected boolean;
  v_sent_count integer;
begin
  -- Only user-sent messages are gated (sender_profile_id is always set by the
  -- app and required by RLS).
  if v_sender is null then
    return new;
  end if;

  -- Has anyone other than the sender already spoken in this thread?
  select exists (
    select 1 from public.messages m
    where m.conversation_id = new.conversation_id
      and m.sender_profile_id is distinct from v_sender
  ) into v_recipient_replied;

  if v_recipient_replied then
    return new; -- thread is open, no cap
  end if;

  -- The other participant profile in this conversation.
  select cp.profile_id into v_other
  from public.conversation_participants cp
  where cp.conversation_id = new.conversation_id
    and cp.profile_id is not null
    and cp.profile_id <> v_sender
  limit 1;

  -- Connected professionals message freely.
  if v_other is not null then
    select exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and (
          (c.requester_id = v_sender and c.recipient_id = v_other)
          or (c.requester_id = v_other and c.recipient_id = v_sender)
        )
    ) into v_connected;

    if v_connected then
      return new;
    end if;
  end if;

  -- Otherwise cap at 3 unanswered messages from this sender.
  select count(*) into v_sent_count
  from public.messages m
  where m.conversation_id = new.conversation_id
    and m.sender_profile_id = v_sender;

  if v_sent_count >= 3 then
    raise exception 'message quota exceeded: wait for a reply before sending more'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_message_quota_trigger on public.messages;
create trigger enforce_message_quota_trigger
  before insert on public.messages
  for each row execute function public.enforce_message_quota();

-- Support the per-conversation/per-sender counts the trigger runs on insert.
create index if not exists idx_messages_conv_sender
  on public.messages (conversation_id, sender_profile_id);
