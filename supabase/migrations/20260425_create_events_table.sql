-- Extend the existing public.events table with rich event-detail columns.
-- The base table (id, organization_id, title, slug, description, event_type,
-- status, start_date, end_date, location, is_online, online_url,
-- cover_image_url, max_attendees, registration_count, created_at, updated_at)
-- and its RLS policies were created out-of-band; this migration only ADDS
-- the additional fields used by the application UI.

alter table public.events
    add column if not exists tagline text,
    add column if not exists short_description text,
    add column if not exists logo_url text,
    add column if not exists gallery_urls text[],
    add column if not exists promo_video_url text,
    add column if not exists format text,
    add column if not exists tags text[],
    add column if not exists timezone text,
    add column if not exists venue_name text,
    add column if not exists address text,
    add column if not exists city text,
    add column if not exists country text,
    add column if not exists location_url text,
    add column if not exists price numeric,
    add column if not exists currency text default 'USD',
    add column if not exists price_upon_request boolean default false,
    add column if not exists pricing_model text,
    add column if not exists speakers jsonb default '[]'::jsonb,
    add column if not exists agenda jsonb default '[]'::jsonb,
    add column if not exists sponsors jsonb default '[]'::jsonb,
    add column if not exists website_url text,
    add column if not exists registration_url text,
    add column if not exists contact_email text,
    add column if not exists views_count integer default 0,
    add column if not exists bookmarks_count integer default 0,
    add column if not exists is_public boolean default true;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'events_format_check') then
        alter table public.events
            add constraint events_format_check
            check (format is null or format in ('In-Person', 'Virtual', 'Hybrid'));
    end if;

    if not exists (select 1 from pg_constraint where conname = 'events_pricing_model_check') then
        alter table public.events
            add constraint events_pricing_model_check
            check (pricing_model is null or pricing_model in ('Free', 'Paid', 'Invite-only', 'Tiered'));
    end if;
end $$;

do $$
begin
    if not exists (select 1 from pg_enum where enumtypid = 'public.event_type'::regtype and enumlabel = 'summit') then
        alter type public.event_type add value 'summit';
    end if;
    if not exists (select 1 from pg_enum where enumtypid = 'public.event_type'::regtype and enumlabel = 'award_ceremony') then
        alter type public.event_type add value 'award_ceremony';
    end if;
    if not exists (select 1 from pg_enum where enumtypid = 'public.event_type'::regtype and enumlabel = 'networking') then
        alter type public.event_type add value 'networking';
    end if;
    if not exists (select 1 from pg_enum where enumtypid = 'public.event_type'::regtype and enumlabel = 'training') then
        alter type public.event_type add value 'training';
    end if;
    if not exists (select 1 from pg_enum where enumtypid = 'public.event_type'::regtype and enumlabel = 'other') then
        alter type public.event_type add value 'other';
    end if;
end $$;

create index if not exists idx_events_starts_at on public.events(start_date);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_organization_id on public.events(organization_id);
