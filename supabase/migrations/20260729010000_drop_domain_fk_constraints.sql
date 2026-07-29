-- Las relaciones entre las tablas de dominio (daily_checks, garmin_data,
-- projects, project_milestones, project_tasks, important_dates,
-- english_sessions, weekly_summaries) quedan conceptuales, no físicas:
-- las columnas *_id se mantienen, pero sin foreign key constraint ni
-- ON DELETE CASCADE. La integridad referencial la maneja el backend
-- (NestJS), no Postgres.
--
-- Se mantiene la FK de users -> auth.users: es el vínculo estándar de
-- Supabase entre el perfil de la app y la identidad de autenticación.

alter table daily_checks drop constraint daily_checks_user_id_fkey;
alter table garmin_data drop constraint garmin_data_user_id_fkey;
alter table projects drop constraint projects_user_id_fkey;
alter table project_milestones drop constraint project_milestones_project_id_fkey;
alter table project_tasks drop constraint project_tasks_milestone_id_fkey;
alter table important_dates drop constraint important_dates_user_id_fkey;
alter table english_sessions drop constraint english_sessions_user_id_fkey;
alter table weekly_summaries drop constraint weekly_summaries_user_id_fkey;
