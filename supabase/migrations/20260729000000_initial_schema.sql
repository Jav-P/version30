-- Versión30 — esquema inicial (Fase 1)
-- Perfiles de usuario, vinculados 1:1 a auth.users
create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Check diario
create table daily_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  date date not null,
  stress_subjective smallint check (stress_subjective between 1 and 10),
  mood smallint check (mood between 1 and 10),
  trained boolean not null default false,
  training_type text,
  training_duration_minutes integer,
  english_attended boolean not null default false,
  english_notes text,
  work_summary text,
  work_competencies_feedback text,
  food_description text,
  food_score smallint check (food_score between 1 and 10),
  food_image_url text,
  ai_feedback text,
  ai_recommendation text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Datos Garmin (sync diario)
create table garmin_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  date date not null,
  stress_avg smallint,
  stress_max smallint,
  steps integer,
  calories integer,
  active_minutes integer,
  sleep_duration_minutes integer,
  sleep_quality text,
  heart_rate_resting smallint,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Proyectos
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  name text not null,
  description text,
  goal text,
  target_date date,
  status text not null default 'active',
  progress smallint not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

-- Hitos de proyectos
create table project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  title text not null,
  target_date date,
  completed boolean not null default false,
  completed_at timestamptz
);

-- Tareas de proyectos
create table project_tasks (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references project_milestones (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending',
  due_date date,
  created_at timestamptz not null default now()
);

-- Fechas importantes (relación)
create table important_dates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  title text not null,
  date date not null,
  recurrent boolean not null default false,
  notes text
);

-- Clases de inglés
create table english_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  date date not null,
  attended boolean not null default true,
  topic text,
  vocabulary text[],
  notes text
);

-- Resúmenes semanales
create table weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  week_start date not null,
  week_end date not null,
  overall_score smallint,
  english_score smallint,
  sport_score smallint,
  food_score smallint,
  work_score smallint,
  stress_score smallint,
  finance_score smallint,
  ai_summary text,
  ai_recommendations text,
  linkedin_post_draft text,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- Row Level Security: cada usuario solo ve/edita sus propios datos.
-- El backend usa la secret key (bypassa RLS); estas políticas protegen
-- el acceso directo desde el frontend con la publishable key + sesión de usuario.
alter table users enable row level security;
alter table daily_checks enable row level security;
alter table garmin_data enable row level security;
alter table projects enable row level security;
alter table project_milestones enable row level security;
alter table project_tasks enable row level security;
alter table important_dates enable row level security;
alter table english_sessions enable row level security;
alter table weekly_summaries enable row level security;

create policy "users manage own row" on users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "owner full access" on daily_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access" on garmin_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access" on important_dates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access" on english_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access" on weekly_summaries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access via project" on project_milestones
  for all using (
    exists (
      select 1 from projects
      where projects.id = project_milestones.project_id
        and projects.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from projects
      where projects.id = project_milestones.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "owner full access via milestone" on project_tasks
  for all using (
    exists (
      select 1 from project_milestones
      join projects on projects.id = project_milestones.project_id
      where project_milestones.id = project_tasks.milestone_id
        and projects.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from project_milestones
      join projects on projects.id = project_milestones.project_id
      where project_milestones.id = project_tasks.milestone_id
        and projects.user_id = auth.uid()
    )
  );
