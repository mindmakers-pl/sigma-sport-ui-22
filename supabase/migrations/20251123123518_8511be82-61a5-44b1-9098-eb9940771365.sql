-- ============================================
-- PHASE 0: INITIAL DATABASE SCHEMA
-- ============================================

-- 1. CLUBS TABLE
-- ============================================
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  city text,
  disciplines text[],
  coaches jsonb default '[]'::jsonb,
  members_count int default 0,
  created_at timestamptz default now()
);

-- 2. ATHLETES TABLE
-- ============================================
create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  first_name text not null,
  last_name text not null,
  gender text,
  email text,
  phone text,
  coach text,
  discipline text,
  birth_date date,
  birth_year int,
  notes text,
  parent_first_name text,
  parent_last_name text,
  parent_phone text,
  parent_email text,
  archived boolean default false,
  archived_at timestamptz,
  created_at timestamptz default now()
);

-- 3. SESSIONS TABLE (measurement sessions)
-- ============================================
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  date timestamptz not null,
  conditions text,
  in_progress boolean default true,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- 4. SESSION_TASKS TABLE (individual tasks within a session)
-- ============================================
create table public.session_tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  task_type text not null, -- 'six_sigma', 'scan', 'focus', 'memo', 'hrv_baseline', 'hrv_training', 'sigma_feedback'
  task_data jsonb not null,
  created_at timestamptz default now()
);

-- 5. TRAININGS TABLE (standalone training sessions)
-- ============================================
create table public.trainings (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes(id) on delete cascade not null,
  date timestamptz not null,
  task_type text not null,
  results jsonb not null,
  created_at timestamptz default now()
);

-- 6. USER_ROLES TABLE (for role-based access control)
-- ============================================
create type public.app_role as enum ('admin', 'coach', 'viewer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- ============================================
-- SECURITY DEFINER FUNCTION
-- ============================================
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.clubs enable row level security;
alter table public.athletes enable row level security;
alter table public.sessions enable row level security;
alter table public.session_tasks enable row level security;
alter table public.trainings enable row level security;
alter table public.user_roles enable row level security;

-- CLUBS POLICIES
create policy "Authenticated users can view clubs" 
  on public.clubs for select 
  to authenticated 
  using (true);

create policy "Authenticated users can insert clubs" 
  on public.clubs for insert 
  to authenticated 
  with check (true);

create policy "Authenticated users can update clubs" 
  on public.clubs for update 
  to authenticated 
  using (true);

create policy "Authenticated users can delete clubs" 
  on public.clubs for delete 
  to authenticated 
  using (true);

-- ATHLETES POLICIES
create policy "Authenticated users can view athletes" 
  on public.athletes for select 
  to authenticated 
  using (true);

create policy "Authenticated users can insert athletes" 
  on public.athletes for insert 
  to authenticated 
  with check (true);

create policy "Authenticated users can update athletes" 
  on public.athletes for update 
  to authenticated 
  using (true);

create policy "Authenticated users can delete athletes" 
  on public.athletes for delete 
  to authenticated 
  using (true);

-- SESSIONS POLICIES
create policy "Authenticated users can view sessions" 
  on public.sessions for select 
  to authenticated 
  using (true);

create policy "Authenticated users can insert sessions" 
  on public.sessions for insert 
  to authenticated 
  with check (true);

create policy "Authenticated users can update sessions" 
  on public.sessions for update 
  to authenticated 
  using (true);

create policy "Authenticated users can delete sessions" 
  on public.sessions for delete 
  to authenticated 
  using (true);

-- SESSION_TASKS POLICIES
create policy "Authenticated users can view session_tasks" 
  on public.session_tasks for select 
  to authenticated 
  using (true);

create policy "Authenticated users can insert session_tasks" 
  on public.session_tasks for insert 
  to authenticated 
  with check (true);

create policy "Authenticated users can update session_tasks" 
  on public.session_tasks for update 
  to authenticated 
  using (true);

create policy "Authenticated users can delete session_tasks" 
  on public.session_tasks for delete 
  to authenticated 
  using (true);

-- TRAININGS POLICIES
create policy "Authenticated users can view trainings" 
  on public.trainings for select 
  to authenticated 
  using (true);

create policy "Authenticated users can insert trainings" 
  on public.trainings for insert 
  to authenticated 
  with check (true);

create policy "Authenticated users can update trainings" 
  on public.trainings for update 
  to authenticated 
  using (true);

create policy "Authenticated users can delete trainings" 
  on public.trainings for delete 
  to authenticated 
  using (true);

-- USER_ROLES POLICIES (only admins can manage roles)
create policy "Authenticated users can view their own roles" 
  on public.user_roles for select 
  to authenticated 
  using (user_id = auth.uid());

create policy "Admins can manage all roles" 
  on public.user_roles for all 
  to authenticated 
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));