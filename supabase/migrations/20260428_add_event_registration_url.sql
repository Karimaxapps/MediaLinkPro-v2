-- Add an optional external registration URL to events.
-- When set, the "Register Now" button on the event details page links here
-- instead of using the in-app registration flow.

alter table public.events
    add column if not exists registration_url text;
