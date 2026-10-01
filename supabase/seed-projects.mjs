// Siembra los 3 proyectos iniciales del plan original (Finca, Carrera,
// Versión30) con sus primeros hitos. Se puede correr en cualquier momento
// después de que el usuario haya iniciado sesión al menos una vez.
// Uso: node supabase/seed-projects.mjs correo@ejemplo.com

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../packages/backend/.env') });

const email = process.argv[2];
if (!email) {
  console.error('Uso: node supabase/seed-projects.mjs correo@ejemplo.com');
  process.exit(1);
}

const projectRef = new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
const region = process.env.SUPABASE_POOLER_REGION;
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

const projects = [
  {
    name: 'Finca',
    description: 'Llevar tecnología a los cultivos de café y aguacate de mi mamá.',
    goal: 'Modernizar la finca con herramientas simples de monitoreo y riego.',
    milestones: [
      { title: 'Diagnóstico inicial del terreno y necesidades' },
      { title: 'Instalar sistema de riego/sensores básicos' },
      { title: 'Primera cosecha con las mejoras aplicadas' },
    ],
  },
  {
    name: 'Carrera',
    description: 'Cambio de trabajo a un rol remoto internacional.',
    goal: 'Conseguir un trabajo remoto internacional antes de cumplir 30.',
    milestones: [
      { title: 'Actualizar CV y LinkedIn en inglés' },
      { title: 'Practicar inglés técnico para entrevistas' },
      { title: 'Aplicar a posiciones remotas' },
      { title: 'Primera entrevista técnica' },
    ],
  },
  {
    name: 'Versión30',
    description: 'El propio sistema — una meta dentro de la meta.',
    goal: 'Tener la plataforma funcionando como hábito diario real.',
    milestones: [
      {
        title: 'Fase 1 — base funcional (auth, rutina, comida, peso, actividad, check diario)',
        completed: true,
      },
      { title: 'Fase 2 — IA integrada (resumen semanal)' },
      { title: 'Desplegar en producción (Netlify + Railway)' },
    ],
  },
];

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows: userRows } = await client.query('select id from users where email = $1', [email]);
if (userRows.length === 0) {
  console.error(`No se encontró ningún usuario con el correo ${email}. Inicia sesión primero.`);
  await client.end();
  process.exit(1);
}
const userId = userRows[0].id;

const { rows: existing } = await client.query('select 1 from projects where user_id = $1 limit 1', [
  userId,
]);
if (existing.length > 0) {
  console.log('Ya existen proyectos para este usuario; no se vuelve a sembrar.');
  await client.end();
  process.exit(0);
}

for (const project of projects) {
  const { rows } = await client.query(
    'insert into projects (user_id, name, description, goal) values ($1, $2, $3, $4) returning id',
    [userId, project.name, project.description, project.goal],
  );
  const projectId = rows[0].id;

  for (const milestone of project.milestones) {
    await client.query(
      'insert into project_milestones (project_id, title, completed, completed_at) values ($1, $2, $3, $4)',
      [projectId, milestone.title, !!milestone.completed, milestone.completed ? new Date() : null],
    );
  }
}

console.log(`Proyectos sembrados para ${email}.`);
await client.end();
