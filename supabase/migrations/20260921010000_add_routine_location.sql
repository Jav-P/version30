-- Permite tener dos rutinas independientes por día de la semana: una para
-- gimnasio (la actual) y otra para casa (full body con peso corporal /
-- movilidad), seleccionables desde la app.

alter table routine_days add column location text not null default 'gym' check (location in ('gym', 'home'));

alter table routine_days drop constraint routine_days_user_id_day_of_week_key;
alter table routine_days add constraint routine_days_user_id_day_of_week_location_key unique (user_id, day_of_week, location);
