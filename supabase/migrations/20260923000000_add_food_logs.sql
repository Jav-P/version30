-- Registro de comidas: foto + feedback de IA (score y qué corregir/mantener).
-- Sin foreign key física hacia users, mismo patrón que el resto del esquema.

create table food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null default current_date,
  image_url text not null,
  ai_score smallint check (ai_score between 1 and 10),
  ai_feedback text,
  analyzed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table food_logs enable row level security;

create policy "owner full access" on food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage: bucket público para las fotos de comida (URLs con UUID, no listables).
-- Cada usuario solo puede escribir/gestionar dentro de su propia carpeta
-- (primer segmento del path = su user id).
insert into storage.buckets (id, name, public)
values ('food-photos', 'food-photos', true)
on conflict (id) do nothing;

create policy "food photos: owner manages own folder" on storage.objects
  for all to authenticated
  using (bucket_id = 'food-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'food-photos' and (storage.foldername(name))[1] = auth.uid()::text);
