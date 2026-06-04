-- Identity verification for media professionals (manual admin review).
-- The "Verified Pro" badge is decoupled from payment: a user must be both a
-- paying Pro AND have an approved identity check for the badge to display.
-- Proof is a professional/social URL (no document uploads in v1).

-- 1. Profile-level verification state ---------------------------------------
alter table public.profiles
  add column if not exists verification_status text not null default 'none'
    check (verification_status in ('none', 'pending', 'verified', 'rejected')),
  add column if not exists verified_at timestamptz;

-- 2. Verification requests (the review queue) -------------------------------
create table if not exists public.verification_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  proof_url   text not null,
  note        text,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  admin_note  text,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id)
);

create index if not exists verification_requests_status_idx
  on public.verification_requests (status);
create index if not exists verification_requests_user_id_idx
  on public.verification_requests (user_id);

-- At most one open request per user.
create unique index if not exists verification_requests_one_pending_per_user
  on public.verification_requests (user_id)
  where status = 'pending';

-- 3. RLS --------------------------------------------------------------------
alter table public.verification_requests enable row level security;

-- A user can read their own requests.
drop policy if exists "verification_requests_select_own" on public.verification_requests;
create policy "verification_requests_select_own"
  on public.verification_requests for select
  using (auth.uid() = user_id);

-- A user can create a request for themselves.
drop policy if exists "verification_requests_insert_own" on public.verification_requests;
create policy "verification_requests_insert_own"
  on public.verification_requests for insert
  with check (auth.uid() = user_id);

-- Admin review runs through the service-role client (bypasses RLS), so no
-- separate admin policy is required here — matching content_ownership_requests.
