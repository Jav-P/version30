# Versión30 — Sistema de coaching de vida personal

## Visión del proyecto

Versión30 es una plataforma personal de seguimiento de vida para Javier Andres Perez Piñeros (27 años, Bogotá). Su objetivo: llegar a los 30 siendo su mejor versión en todas las áreas de su vida. El sistema monitorea hábitos, avances, proyectos y bienestar diario, y usa IA para generar recomendaciones proactivas.

Visión futura: si el producto funciona bien para Javier, escala como "Norte" — una plataforma de coaching de vida para otras personas.

---

## Usuarios actuales

- **Javier** (admin, usuario principal)
- **Zaira** (pareja, acceso futuro)
- **Familia** (acceso futuro, vista limitada)

---

## Stack tecnológico

### Frontend
- **Angular** (versión más reciente)
- Desplegado en **Netlify** (Javier ya tiene cuenta)
- PWA para uso desde celular

### Backend
- **NestJS** (stack principal de Javier)
- **Supabase** (Postgres + Auth + Storage + Realtime)
- Desplegado en **Railway** (~$5-10 USD/mes cuando escale)

### IA
- **Claude API** (Sonnet 4.6) para:
  - Análisis de fotos de comida
  - Coaching diario personalizado
  - Generación de posts para LinkedIn
  - Recomendaciones de ejercicio según estrés
  - Evaluación de competencias laborales

### Integraciones
- **Garmin Connect** (Forerunner 165) — estrés, actividad, sueño, frecuencia cardíaca
  - Librería: `python-garminconnect` (no oficial, extrae datos de Garmin Connect)
  - Script Python corriendo en Railway como servicio separado
- **App de finanzas personales** (proyecto paralelo de Javier) — score financiero vía API interna
- **LinkedIn** — publicación de posts generados por IA

---

## Módulos del sistema

### 1. Check diario (2-3 minutos)
El usuario llena un formulario rápido cada día con:
- Nivel de estrés subjetivo (1-10)
- Comida del día (foto o descripción)
- ¿Entrenó hoy? (sí/no + tipo + duración)
- ¿Asistió a inglés? (sí/no + qué aprendió)
- Informe breve de trabajo (qué hizo, qué logró)
- Estado de ánimo general (1-10)

La IA procesa este input y genera:
- Evaluación del día
- Una recomendación concreta para mañana
- Alerta si detecta patrón de estrés alto o hábitos negativos

### 2. Dashboard principal
Vista general del estado actual en todas las áreas:

| Área | Métrica principal | Fuente |
|---|---|---|
| Inglés | Días de asistencia / meta semanal | Check diario |
| Deporte | Actividad semanal vs meta | Garmin + check diario |
| Alimentación | Score de alimentación semanal | Claude API (análisis de fotos) |
| Trabajo/carrera | Competencias evaluadas, avance de metas | Check diario + IA |
| Estrés | Nivel promedio semanal | Garmin + subjetivo |
| Finanzas | Score financiero | App finanzas (API externa) |
| Proyectos | Avance de objetivos activos | Módulo de proyectos |
| Relación | Fechas importantes próximas, planes pendientes | Módulo de relación |

### 3. Resumen semanal (automático cada domingo)
Generado por IA con:
- Logros de la semana en cada área
- Áreas con mejor y peor desempeño
- Recomendaciones para la semana siguiente
- Borrador de post para LinkedIn basado en lo que aprendió/logró
- Ajuste de rutina de ejercicio según nivel de estrés promedio

### 4. Módulo de proyectos
Para proyectos de mediano/largo plazo como la finca, la búsqueda de trabajo, emprendimientos, etc.

Cada proyecto tiene:
- Nombre y descripción
- Objetivo final con fecha
- Lista de hitos (milestones)
- Tareas con estado (pendiente / en progreso / completado)
- Notas y aprendizajes
- Score de avance calculado automáticamente

Proyectos iniciales:
- **Finca** — llevar tecnología a los cultivos de café y aguacate de su mamá
- **Carrera** — cambio de trabajo a rol remoto internacional
- **Versión30** — el propio sistema (meta dentro del meta)

### 5. Módulo de relación
- Fechas importantes: cumpleaños de Zaira, aniversarios, momentos especiales
- Alerta automática 7 días antes de cada fecha
- Sugerencias de planes según presupuesto disponible y época del año
- Registro de planes realizados juntos

### 6. Módulo de inglés
- Registro de clases asistidas
- Resumen de lo que aprendió en cada sesión
- Vocabulario técnico acumulado
- Progreso hacia nivel conversacional para entrevistas
- Streak de días consecutivos practicando

### 7. Módulo de alimentación
- Foto o descripción de comidas del día
- Claude API analiza y da score de cada comida
- Patrones de alimentación semanal
- Alertas si detecta hábitos negativos recurrentes

### 8. Módulo de deporte/bienestar
- Sincronización con Garmin Forerunner 165:
  - Estrés diario (0-100)
  - Actividad: pasos, calorías, distancia
  - Sueño: duración y calidad
  - Frecuencia cardíaca en reposo
- Registro manual si no tiene Garmin ese día
- Recomendación de intensidad de entrenamiento según nivel de estrés:
  - Estrés alto (>70) → descanso o ejercicio suave
  - Estrés medio (40-70) → entrenamiento moderado
  - Estrés bajo (<40) → entrenamiento fuerte

---

## Modelo de datos (esquema inicial Supabase)

```sql
-- Usuarios
users (id, name, email, role, created_at)

-- Check diario
daily_checks (
  id, user_id, date,
  stress_subjective, mood,
  trained, training_type, training_duration,
  english_attended, english_notes,
  work_summary, work_competencies_feedback,
  food_description, food_score, food_image_url,
  ai_feedback, ai_recommendation,
  created_at
)

-- Datos Garmin (sync diario)
garmin_data (
  id, user_id, date,
  stress_avg, stress_max,
  steps, calories, active_minutes,
  sleep_duration, sleep_quality,
  heart_rate_resting
)

-- Proyectos
projects (id, user_id, name, description, goal, target_date, status, progress, created_at)

-- Hitos de proyectos
project_milestones (id, project_id, title, target_date, completed, completed_at)

-- Tareas de proyectos
project_tasks (id, milestone_id, title, description, status, due_date, created_at)

-- Fechas importantes (relación)
important_dates (id, user_id, title, date, recurrent, notes)

-- Clases de inglés
english_sessions (id, user_id, date, attended, topic, vocabulary, notes)

-- Resúmenes semanales
weekly_summaries (
  id, user_id, week_start, week_end,
  overall_score,
  english_score, sport_score, food_score,
  work_score, stress_score, finance_score,
  ai_summary, ai_recommendations,
  linkedin_post_draft,
  created_at
)
```

---

## Flujo de datos del check diario

```
Usuario llena check diario
        ↓
NestJS recibe el formulario
        ↓
Si hay foto de comida → Claude API analiza y devuelve score + feedback
        ↓
Claude API evalúa las competencias del día (informe de trabajo)
        ↓
Se consultan datos de Garmin del día (sincronización automática previa)
        ↓
Claude API genera feedback consolidado del día + recomendación para mañana
        ↓
Se guarda todo en Supabase
        ↓
El dashboard se actualiza en tiempo real
```

---

## Plan de implementación por fases

### Fase 1 — Base funcional (Semana 1-2)
- [ ] Crear proyecto en Supabase (base de datos + auth)
- [ ] Scaffolding de NestJS en Railway
- [ ] Scaffolding de Angular en Netlify
- [ ] Auth con Supabase (login Javier)
- [ ] Check diario básico (sin IA aún)
- [ ] Dashboard con datos del check diario
- [ ] Módulo de inglés básico

### Fase 2 — IA integrada (Semana 3-4)
- [ ] Integrar Claude API para análisis de comida (foto)
- [ ] Integrar Claude API para feedback del día
- [ ] Integrar Claude API para evaluación de competencias laborales
- [ ] Resumen semanal automático con IA
- [ ] Generación de borrador de post LinkedIn

### Fase 3 — Garmin + Proyectos (Semana 5-6)
- [ ] Script Python para sincronizar datos de Garmin Connect
- [ ] Módulo de proyectos con hitos y tareas
- [ ] Recomendación de ejercicio según estrés Garmin
- [ ] Módulo de relación con fechas importantes

### Fase 4 — Multi-usuario + Finanzas (Mes 2)
- [ ] Agregar usuarios (Zaira, familia)
- [ ] Roles y permisos
- [ ] Integración con app de finanzas (API externa)
- [ ] Score financiero en dashboard

### Fase 5 — Escalar a Norte (Futuro)
- [ ] Rediseño para múltiples usuarios no relacionados
- [ ] Onboarding configurable por área de vida
- [ ] Planes de suscripción
- [ ] Dominio propio

---

## Costo estimado

| Servicio | Plan inicial | Costo |
|---|---|---|
| Supabase | Free tier | $0 |
| Railway | Free tier | $0 (luego ~$5 USD/mes) |
| Netlify | Free tier | $0 |
| Claude API | Pay per use | ~$2-5 USD/mes |
| Dominio (futuro) | .com | ~$12 USD/año |
| **Total inicial** | | **$0-5 USD/mes** |

---

## Contexto personal de Javier (para que la IA personalice bien)

- 27 años, vive en Bogotá con Zaira y su perro
- Tech Lead en Orafa (ecommerce de joyería)
- Meta: cambiar a trabajo remoto internacional antes de los 30
- Deuda activa por compra de apartamento → flujo de caja ajustado
- Patrón histórico: empieza proyectos con energía pero pierde consistencia
- Motivación principal: ser próspero Y exitoso, no solo para otros sino para sí mismo
- Garmin Forerunner 165 (datos de estrés, sueño, actividad)
- Carrera de running en 8 días (24km)
- Vacaciones: 36 días disponibles, Bloque 1 planificado para julio

---

## Cómo usar este documento

Cuando abras un chat nuevo para trabajar en Versión30, empieza con:

> "Tengo este contexto del proyecto Versión30: [pega el contenido de este archivo]. Quiero continuar con [fase/módulo específico]."

Esto garantiza que cada sesión de desarrollo arranque con todo el contexto necesario.
