-- Rutinas de entrenamiento — plan semanal simple con checklist diario.
-- Sin foreign keys físicas hacia users/routine_days, siguiendo el patrón
-- establecido en 20260729010000_drop_domain_fk_constraints.sql: la
-- integridad referencial la maneja el backend/frontend, no Postgres.

create table routine_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day_of_week smallint not null check (day_of_week between 1 and 7), -- 1 = lunes ... 7 = domingo
  name text not null,
  is_rest_day boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, day_of_week)
);

create table routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null,
  sort_order smallint not null default 0,
  name text not null,
  sets smallint,
  reps text,
  notes text,
  created_at timestamptz not null default now()
);

create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  routine_day_id uuid,
  completed_exercise_ids uuid[] not null default '{}',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table routine_days enable row level security;
alter table routine_exercises enable row level security;
alter table workout_logs enable row level security;

create policy "owner full access" on routine_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner full access via routine day" on routine_exercises
  for all using (
    exists (
      select 1 from routine_days
      where routine_days.id = routine_exercises.routine_day_id
        and routine_days.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from routine_days
      where routine_days.id = routine_exercises.routine_day_id
        and routine_days.user_id = auth.uid()
    )
  );

create policy "owner full access" on workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- El seed de la rutina de Javier vive en supabase/seed-routine.mjs, no aquí:
-- depende de que su fila en `users` ya exista (requiere haber iniciado sesión
-- al menos una vez), lo cual no se puede garantizar en el momento en que
-- corren las migraciones de esquema.
