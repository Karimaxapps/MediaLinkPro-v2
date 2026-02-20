-- Create connections table
create type connection_status as enum ('pending', 'accepted', 'rejected');

create table if not exists connections (
    id uuid default gen_random_uuid() primary key,
    requester_id uuid references profiles(id) on delete cascade not null,
    recipient_id uuid references profiles(id) on delete cascade not null,
    status connection_status default 'pending' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(requester_id, recipient_id)
);

-- RLS Policies
alter table connections enable row level security;

-- Users can view their own connections (sent or received)
create policy "Users can view their own connections"
    on connections for select
    using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- Users can insert connection requests
create policy "Users can send connection requests"
    on connections for insert
    with check (auth.uid() = requester_id);

-- Users can update connections (accept/reject) if they are the recipient
create policy "Recipients can update connection status"
    on connections for update
    using (auth.uid() = recipient_id);

-- Users can delete connections they are part of (optional, e.g. disconnect)
create policy "Users can delete their connections"
    on connections for delete
    using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- Add indexes for performance
create index connections_requester_id_idx on connections(requester_id);
create index connections_recipient_id_idx on connections(recipient_id);
create index connections_status_idx on connections(status);
