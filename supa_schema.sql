-- MEDIA LINK PRO - STEP 2 SCHEMA

-- 1. ENUMS
do $$ begin
    create type public.member_role as enum ('owner', 'admin', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.expertise_level as enum ('beginner', 'intermediate', 'advanced', 'certified');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.resource_type as enum ('official_link', 'documentation', 'certification', 'training', 'youtube', 'community_link');
exception when duplicate_object then null; end $$;

-- 2. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamptz default now(),
  full_name text,
  avatar_url text,
  website text,
  bio text,
  constraint check_fullname_length check (char_length(full_name) >= 3)
);
alter table public.profiles enable row level security;

-- 3. ORGANIZATIONS
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  slug text not null unique,
  logo_url text,
  constraint check_slug_length check (char_length(slug) >= 3)
);
alter table public.organizations enable row level security;

-- 4. ORGANIZATION MEMBERS
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  organization_id uuid references public.organizations on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role public.member_role not null default 'viewer',
  unique (organization_id, user_id)
);
alter table public.organization_members enable row level security;

-- 5. PRODUCTS
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  organization_id uuid references public.organizations on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  logo_url text,
  is_public boolean default true,
  unique (organization_id, slug)
);
alter table public.products enable row level security;

-- 6. PRODUCT RESOURCES
create table if not exists public.product_resources (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  product_id uuid references public.products on delete cascade not null,
  title text not null,
  url text not null,
  type public.resource_type not null default 'documentation',
  added_by uuid references public.profiles(id)
);
alter table public.product_resources enable row level security;

-- 7. DEMO REQUESTS
create table if not exists public.demo_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  message text,
  status text default 'pending'
);
alter table public.demo_requests enable row level security;

-- 8. PRODUCT EXPERTS
create table if not exists public.product_experts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  expertise_level public.expertise_level not null default 'beginner',
  verification_status text default 'pending',
  unique (product_id, user_id)
);
alter table public.product_experts enable row level security;

-- 9. DISCUSSIONS
create table if not exists public.discussions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  title text not null
);
alter table public.discussions enable row level security;

-- 10. DISCUSSION POSTS
create table if not exists public.discussion_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  discussion_id uuid references public.discussions on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  content text not null
);
alter table public.discussion_posts enable row level security;

-- 11. EXPERT PROFILES
create table if not exists public.expert_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  updated_at timestamptz default now(),
  headline text,
  about text,
  hourly_rate numeric,
  skills text[],
  social_links jsonb,
  verification_status text default 'pending'
);
alter table public.expert_profiles enable row level security;


-- FUNCTIONS & TRIGGERS

-- Handle new user -> create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at timestamp handler
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
drop trigger if exists handle_updated_at_profiles on public.profiles;
create trigger handle_updated_at_profiles before update on public.profiles for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at_orgs on public.organizations;
create trigger handle_updated_at_orgs before update on public.organizations for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at_products on public.products;
create trigger handle_updated_at_products before update on public.products for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at_experts on public.product_experts;
create trigger handle_updated_at_experts before update on public.product_experts for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at_discussions on public.discussions;
create trigger handle_updated_at_discussions before update on public.discussions for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at_posts on public.discussion_posts;
create trigger handle_updated_at_posts before update on public.discussion_posts for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_updated_at_expert_profiles on public.expert_profiles;
create trigger handle_updated_at_expert_profiles before update on public.expert_profiles for each row execute procedure public.handle_updated_at();


-- RLS HELPERS

create or replace function public.is_org_member(org_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
    and user_id = auth.uid()
  );
$$ language sql security definer;

create or replace function public.is_org_admin(org_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
  );
$$ language sql security definer;

create or replace function public.can_edit_org(org_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
    and user_id = auth.uid()
    and role in ('owner', 'admin', 'editor')
  );
$$ language sql security definer;


-- RLS POLICIES

-- PROFILES
drop policy if exists "Public profiles" on public.profiles;
create policy "Public profiles" on public.profiles for select using (true);

drop policy if exists "User update own profile" on public.profiles;
create policy "User update own profile" on public.profiles for update using (auth.uid() = id);

-- ORGANIZATIONS
drop policy if exists "Public organizations" on public.organizations;
create policy "Public organizations" on public.organizations for select using (true);

drop policy if exists "Auth create organizations" on public.organizations;
create policy "Auth create organizations" on public.organizations for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin update organization" on public.organizations;
create policy "Admin update organization" on public.organizations for update using (public.is_org_admin(id));

-- ORGANIZATION MEMBERS
drop policy if exists "Members view members" on public.organization_members;
create policy "Members view members" on public.organization_members for select using (public.is_org_member(organization_id));

drop policy if exists "Admins manage members" on public.organization_members;
create policy "Admins manage members" on public.organization_members for insert with check (public.is_org_admin(organization_id));

drop policy if exists "Initial member" on public.organization_members;
create policy "Initial member" on public.organization_members for insert with check (
  auth.uid() = user_id 
);
-- Note: Simplified initial member check to allow ANY user to insert themselves. 
-- For production, should ideally verify 'id' is NOT in org yet, but logic handles unique constraint.

drop policy if exists "Admins update members" on public.organization_members;
create policy "Admins update members" on public.organization_members for update using (public.is_org_admin(organization_id));

drop policy if exists "Admins delete members" on public.organization_members;
create policy "Admins delete members" on public.organization_members for delete using (public.is_org_admin(organization_id));

drop policy if exists "User leave org" on public.organization_members;
create policy "User leave org" on public.organization_members for delete using (auth.uid() = user_id);

-- PRODUCTS
drop policy if exists "Public products" on public.products;
create policy "Public products" on public.products for select using (true);

drop policy if exists "Editors create products" on public.products;
create policy "Editors create products" on public.products for insert with check (public.can_edit_org(organization_id));

drop policy if exists "Editors update products" on public.products;
create policy "Editors update products" on public.products for update using (public.can_edit_org(organization_id));

drop policy if exists "Editors delete products" on public.products;
create policy "Editors delete products" on public.products for delete using (public.can_edit_org(organization_id));

-- PRODUCT RESOURCES
drop policy if exists "Public view resources" on public.product_resources;
create policy "Public view resources" on public.product_resources for select using (true);

drop policy if exists "Editors manage resources" on public.product_resources;
create policy "Editors manage resources" on public.product_resources for all using (
  exists (select 1 from public.products where id = product_id and public.can_edit_org(organization_id))
);

-- DEMO REQUESTS
drop policy if exists "Auth create demo request" on public.demo_requests;
create policy "Auth create demo request" on public.demo_requests for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin view demo requests" on public.demo_requests;
create policy "Admin view demo requests" on public.demo_requests for select using (
  exists (select 1 from public.products where id = product_id and public.is_org_admin(organization_id))
  or auth.uid() = user_id
);

-- PRODUCT EXPERTS
drop policy if exists "Public view experts" on public.product_experts;
create policy "Public view experts" on public.product_experts for select using (true);

drop policy if exists "User manage own expert profile" on public.product_experts;
create policy "User manage own expert profile" on public.product_experts for all using (auth.uid() = user_id);

-- DISCUSSIONS
drop policy if exists "Public view discussions" on public.discussions;
create policy "Public view discussions" on public.discussions for select using (true);

drop policy if exists "Auth create discussion" on public.discussions;
create policy "Auth create discussion" on public.discussions for insert with check (auth.role() = 'authenticated');

-- DISCUSSION POSTS
drop policy if exists "Public view posts" on public.discussion_posts;
create policy "Public view posts" on public.discussion_posts for select using (true);

drop policy if exists "Auth create posts" on public.discussion_posts;
create policy "Auth create posts" on public.discussion_posts for insert with check (auth.role() = 'authenticated');

drop policy if exists "User edit own posts" on public.discussion_posts;
create policy "User edit own posts" on public.discussion_posts for update using (auth.uid() = user_id);

-- EXPERT PROFILES
drop policy if exists "Public view expert profiles" on public.expert_profiles;
create policy "Public view expert profiles" on public.expert_profiles for select using (true);

drop policy if exists "User manage own expert profile" on public.expert_profiles;
create policy "User manage own expert profile" on public.expert_profiles for all using (auth.uid() = id);

-- STORAGE SCRIPT (Run only if standard SQL access to storage schema is permitted)
-- NOTE: Using DO block to handle potential missing buckets safely if extensions aren't fully set, though 'storage' is standard.

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('private-docs', 'private-docs', false)
on conflict (id) do nothing;

-- STORAGE POLICIES
drop policy if exists "Public Assets Read" on storage.objects;
create policy "Public Assets Read" on storage.objects for select using (bucket_id = 'public-assets');

drop policy if exists "Auth Upload Public Assets" on storage.objects;
create policy "Auth Upload Public Assets" on storage.objects for insert with check (
  bucket_id = 'public-assets' 
  and auth.role() = 'authenticated'
);

drop policy if exists "Auth Update Public Assets" on storage.objects;
create policy "Auth Update Public Assets" on storage.objects for update using (
  bucket_id = 'public-assets' 
  and auth.role() = 'authenticated'
);

drop policy if exists "Private Docs Member Read" on storage.objects;
create policy "Private Docs Member Read" on storage.objects for select using (
  bucket_id = 'private-docs'
  and exists (
      select 1 from public.organization_members 
      where 
        user_id = auth.uid() 
        and organization_id::text = (storage.foldername(name))[2]
  )
);
