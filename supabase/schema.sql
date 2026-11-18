-- CityResolve Supabase Schema (with Auth)
-- Run this in your Supabase SQL Editor

create extension if not exists "uuid-ossp";

create type issue_status as enum ('open', 'in_progress', 'resolved', 'rejected');
create type issue_priority as enum ('low', 'medium', 'high', 'critical');
create type issue_category as enum ('roads','sanitation','lighting','parks','water','electricity','noise','other');

-- ── Issues ─────────────────────────────────────────────────────────────────
create table issues (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  description    text not null,
  category       issue_category not null,
  status         issue_status not null default 'open',
  priority       issue_priority not null default 'medium',
  location       text not null,
  latitude       float8,
  longitude      float8,
  votes          int not null default 0,
  reporter_name  text not null,
  reporter_email text not null,
  department     text not null,
  image_url      text,
  reported_by    uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

-- ── Departments ────────────────────────────────────────────────────────────
create table departments (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  categories       issue_category[] not null default '{}',
  head             text,
  email            text,
  open_issues      int not null default 0,
  resolved_issues  int not null default 0
);

-- ── Comments ───────────────────────────────────────────────────────────────
create table comments (
  id          uuid primary key default uuid_generate_v4(),
  issue_id    uuid references issues(id) on delete cascade,
  author      text not null,
  author_role text not null default 'citizen',
  content     text not null,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Profiles (extends auth.users) ─────────────────────────────────────────
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'citizen',  -- citizen | department | admin
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Auto-update updated_at ─────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger issues_updated_at before update on issues
  for each row execute function update_updated_at();

-- ── Increment votes RPC ────────────────────────────────────────────────────
create or replace function increment_votes(issue_id uuid)
returns void language plpgsql as $$
begin
  update issues set votes = votes + 1 where id = issue_id;
end; $$;

-- ── Stats view ────────────────────────────────────────────────────────────
create or replace view stats_overview as
select
  count(*)                                                           as total,
  count(*) filter (where status = 'open')                           as open,
  count(*) filter (where status = 'in_progress')                    as in_progress,
  count(*) filter (where status = 'resolved')                       as resolved,
  round(avg(extract(epoch from
    (coalesce(resolved_at, now()) - created_at)) / 86400)::numeric, 1) as avg_resolution_days,
  94                                                                 as satisfaction
from issues;

-- ── Row-Level Security ────────────────────────────────────────────────────
alter table issues      enable row level security;
alter table comments    enable row level security;
alter table departments enable row level security;
alter table profiles    enable row level security;

-- Anyone can read issues and departments
create policy "Public read issues"       on issues      for select using (true);
create policy "Public read departments"  on departments for select using (true);
create policy "Public read comments"     on comments    for select using (true);

-- Anyone (incl. anonymous) can submit issues
create policy "Anyone can report"        on issues      for insert with check (true);

-- Anyone can upvote (one update per session is enforced in the app)
create policy "Anyone can vote"          on issues
  for update using (true) with check (true);

-- Only authenticated users can add comments
create policy "Auth users comment"       on comments
  for insert with check (auth.uid() is not null);

-- Admins/dept users can update issue status (add your logic here)
create policy "Auth users update status" on issues
  for update using (auth.uid() is not null);

-- Users can read/update their own profile
create policy "Users own profile"        on profiles
  for all using (auth.uid() = id);

-- ── Seed departments ──────────────────────────────────────────────────────
insert into departments (name, categories, head, email, open_issues, resolved_issues) values
  ('Roads & Transport',  '{roads}',              'Rajesh Kapoor', 'roads@city.gov',       18, 142),
  ('Electricity Board',  '{lighting,electricity}','Meena Pillai',  'electricity@city.gov',  9,  87),
  ('Sanitation',         '{sanitation}',         'Arun Nair',     'sanitation@city.gov',  14, 201),
  ('Parks & Recreation', '{parks}',              'Deepa Menon',   'parks@city.gov',        5,  63),
  ('Water Works',        '{water}',              'Suresh Babu',   'water@city.gov',        7,  94);
