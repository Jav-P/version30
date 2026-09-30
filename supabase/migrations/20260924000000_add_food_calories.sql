-- Calorías estimadas por comida, para más adelante poder calcular déficit/superávit
-- calórico cruzando esto con las calorías quemadas que traerá la integración de Garmin
-- (garmin_data.calories).

alter table food_logs add column calories integer;
