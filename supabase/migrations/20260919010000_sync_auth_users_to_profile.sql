-- El signup de Supabase Auth solo crea la fila en auth.users; la tabla de
-- perfil `users` de la app se quedaba vacía porque nada la poblaba. Esto
-- rompía cualquier feature que dependa de `users` (como el seed de rutinas
-- por email). Este trigger sincroniza cada alta nueva automáticamente.

create function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
