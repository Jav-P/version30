-- Peso corporal: es la única métrica de "salud" que no la va a traer Garmin
-- (el reloj no pesa), así que se registra a mano. El resto (sueño, estrés,
-- actividad) espera a la sincronización real con Garmin en vez de simularse.

create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null default current_date,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table weight_logs enable row level security;

create policy "owner full access" on weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
