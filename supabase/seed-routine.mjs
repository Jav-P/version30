// Siembra dos rutinas independientes para el usuario indicado: una de
// gimnasio (hipertrofia 6 días, Push/Pull/Legs x2) y una de casa (full body
// con peso corporal + movilidad, igual los 6 días). Se puede correr en
// cualquier momento después de que esa persona haya iniciado sesión al menos
// una vez (necesita su fila en `users`).
// Uso: node supabase/seed-routine.mjs correo@ejemplo.com

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../packages/backend/.env') });

const email = process.argv[2];
if (!email) {
  console.error('Uso: node supabase/seed-routine.mjs correo@ejemplo.com');
  process.exit(1);
}

const projectRef = new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
const region = process.env.SUPABASE_POOLER_REGION;
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

const gymRoutine = [
  {
    day: 1,
    name: 'Empuje A (pecho/hombro/tríceps)',
    exercises: [
      ['Press banca con barra', 4, '6-8', 'https://www.youtube.com/watch?v=GeLq8cMODLc'],
      ['Press militar sentado', 3, '8-10', 'https://www.youtube.com/watch?v=5CtaciJn9uY'],
      ['Press inclinado con mancuernas', 3, '10-12', 'https://www.youtube.com/watch?v=oTD5g77GgSA'],
      ['Elevaciones laterales', 3, '12-15', 'https://www.youtube.com/watch?v=b6KtNTSHA54'],
      ['Fondos en paralelas', 3, '10-12', 'https://www.youtube.com/watch?v=gMrHeqWTikc'],
      ['Extensión de tríceps en polea', 3, '12-15', 'https://www.youtube.com/watch?v=HAS8uy73HqM'],
    ],
  },
  {
    day: 2,
    name: 'Tracción A (espalda/bíceps)',
    exercises: [
      ['Peso muerto convencional', 4, '5-6', 'https://www.youtube.com/watch?v=44iTFW8f2HE'],
      ['Dominadas o jalón al pecho', 4, '8-10', 'https://www.youtube.com/watch?v=myYYGyQKLz8'],
      ['Remo con barra', 3, '8-10', 'https://www.youtube.com/watch?v=12AQkpfSN9E'],
      ['Face pull', 3, '15', 'https://www.youtube.com/watch?v=X-xCQ1gh-kA'],
      ['Curl con barra Z', 3, '10-12', 'https://www.youtube.com/watch?v=jkwxFce71ao'],
      ['Curl martillo', 3, '12', 'https://www.youtube.com/watch?v=K6Go66ZjAjc'],
    ],
  },
  {
    day: 3,
    name: 'Pierna A (cuádriceps)',
    exercises: [
      ['Sentadilla con barra', 4, '6-8', 'https://www.youtube.com/watch?v=dsCuiccYNGs'],
      ['Prensa de piernas', 3, '10-12', 'https://www.youtube.com/watch?v=hl-EJUQ2yuc'],
      ['Zancadas caminando', 3, '12 por pierna', 'https://www.youtube.com/watch?v=EPARQLIYrZU'],
      ['Extensión de cuádriceps', 3, '12-15', 'https://www.youtube.com/watch?v=ndnA6yvGoqQ'],
      ['Elevación de talones de pie', 4, '15', 'https://www.youtube.com/watch?v=_R3TOH-vnF8'],
    ],
  },
  {
    day: 4,
    name: 'Empuje B (hombro/pecho/tríceps)',
    exercises: [
      ['Press militar de pie con barra', 4, '6-8', 'https://www.youtube.com/watch?v=WREUHExSxDc'],
      ['Press inclinado con barra', 3, '8-10', 'https://www.youtube.com/watch?v=RkveusFgV30'],
      ['Aperturas en polea o máquina', 3, '12-15', 'https://www.youtube.com/watch?v=W7Nc-p7wR4Q'],
      ['Elevaciones laterales', 4, '15', 'https://www.youtube.com/watch?v=b6KtNTSHA54'],
      ['Press francés', 3, '10-12', 'https://www.youtube.com/watch?v=BIca6STWIXQ'],
      ['Press cerrado en banca', 3, '8-10', 'https://www.youtube.com/watch?v=dlA8DTO-Zro'],
    ],
  },
  {
    day: 5,
    name: 'Tracción B (espalda/bíceps)',
    exercises: [
      ['Dominadas lastradas o jalón agarre ancho', 4, '8-10', 'https://www.youtube.com/watch?v=myYYGyQKLz8'],
      ['Remo en máquina o remo en T', 4, '10-12', 'https://www.youtube.com/watch?v=2anoS6A5DrU'],
      ['Remo con mancuerna a una mano', 3, '10-12', 'https://www.youtube.com/watch?v=fZYGcNtMWSc'],
      ['Face pull o pájaro', 3, '15', 'https://www.youtube.com/watch?v=X-xCQ1gh-kA'],
      ['Curl en banco Scott', 3, '10-12', 'https://www.youtube.com/watch?v=ur1BZ7zAZvA'],
      ['Curl concentrado', 3, '12', 'https://www.youtube.com/watch?v=8B0mY3gknoc'],
    ],
  },
  {
    day: 6,
    name: 'Pierna B (isquios/glúteo)',
    exercises: [
      ['Peso muerto rumano', 4, '8-10', 'https://www.youtube.com/watch?v=ZiO69NlLlYo'],
      ['Curl femoral', 4, '10-12', 'https://www.youtube.com/watch?v=9xbBr5Ytl8c'],
      ['Hip thrust', 4, '10-12', 'https://www.youtube.com/watch?v=aMntMBkmv0g'],
      ['Zancada búlgara', 3, '10 por pierna', 'https://www.youtube.com/watch?v=imWey1JId4g'],
      ['Elevación de talones sentado', 4, '15', 'https://www.youtube.com/watch?v=Hq7ZnmkuZWM'],
    ],
  },
  { day: 7, name: 'Descanso', restDay: true, exercises: [] },
];

// Mismo split que el gimnasio (Empuje/Tracción/Pierna x2), pero con
// sustitutos de peso corporal o cosas fáciles de tener en casa (mochila con
// libros, botellas/garrafas de agua, una silla).
const homeRoutine = [
  {
    day: 1,
    name: 'Empuje A en casa (pecho/hombro/tríceps)',
    exercises: [
      ['Flexiones de pecho', 3, '12-15', 'https://www.youtube.com/watch?v=hbGR_wq7wzo'],
      ['Flexiones pike (hombro)', 3, '8-10', 'https://www.youtube.com/watch?v=xMvv9gFxCBM'],
      ['Fondos en silla (tríceps)', 3, '10-12', 'https://www.youtube.com/watch?v=R9TzSqoDMBw'],
      ['Flexiones con manos elevadas', 3, '12-15', 'https://www.youtube.com/watch?v=oKrqpvZd6hI'],
      ['Elevaciones laterales con botellas', 3, '12-15', 'https://www.youtube.com/watch?v=b6KtNTSHA54'],
      ['Extensión de tríceps con mochila', 3, '12-15', 'https://www.youtube.com/watch?v=tBvA2q2WaPE'],
    ],
  },
  {
    day: 2,
    name: 'Tracción A en casa (espalda/bíceps)',
    exercises: [
      ['Remo invertido bajo la mesa', 4, '8-10', 'https://www.youtube.com/watch?v=NdA9f8YnyGA'],
      ['Superman (zona lumbar)', 3, '12', 'https://www.youtube.com/watch?v=vxaPBQdVaQg'],
      ['Remo con mochila a dos manos', 3, '10-12', 'https://www.youtube.com/watch?v=pHEzSV5CjbQ'],
      ['Pájaro o face pull con banda', 3, '15', 'https://www.youtube.com/watch?v=X-xCQ1gh-kA'],
      ['Curl de bíceps con botellas', 3, '12-15', 'https://www.youtube.com/watch?v=jkwxFce71ao'],
      ['Curl martillo con garrafas', 3, '12', 'https://www.youtube.com/watch?v=K6Go66ZjAjc'],
    ],
  },
  {
    day: 3,
    name: 'Pierna A en casa (cuádriceps)',
    exercises: [
      ['Sentadilla con peso corporal', 3, '15-20', 'https://www.youtube.com/shorts/j6BfCjVjgSA'],
      ['Sentadilla búlgara con silla', 3, '10 por pierna', 'https://www.youtube.com/watch?v=imWey1JId4g'],
      ['Zancadas caminando', 3, '12 por pierna', 'https://www.youtube.com/watch?v=Xcfs_3DMKlc'],
      ['Sentadilla isométrica en pared', 3, '30-45 seg', 'https://www.youtube.com/watch?v=Bp78LCnPJ_k'],
      ['Elevación de talones de pie', 4, '20', 'https://www.youtube.com/watch?v=_R3TOH-vnF8'],
    ],
  },
  {
    day: 4,
    name: 'Empuje B en casa (hombro/pecho/tríceps)',
    exercises: [
      ['Flexiones diamante (tríceps)', 3, '8-10', 'https://www.youtube.com/watch?v=yzU8tE28ePE'],
      ['Flexiones pike (hombro)', 3, '8-10', 'https://www.youtube.com/watch?v=xMvv9gFxCBM'],
      ['Flexiones de pecho', 3, '12-15', 'https://www.youtube.com/watch?v=hbGR_wq7wzo'],
      ['Elevaciones laterales con botellas', 4, '15', 'https://www.youtube.com/watch?v=b6KtNTSHA54'],
      ['Fondos en silla (tríceps)', 3, '12', 'https://www.youtube.com/watch?v=R9TzSqoDMBw'],
      ['Press de hombro con mochila', 3, '10-12', 'https://www.youtube.com/watch?v=5CtaciJn9uY'],
    ],
  },
  {
    day: 5,
    name: 'Tracción B en casa (espalda/bíceps)',
    exercises: [
      ['Remo invertido agarre ancho', 4, '8-10', 'https://www.youtube.com/watch?v=NdA9f8YnyGA'],
      ['Superman brazos extendidos', 3, '15', 'https://www.youtube.com/watch?v=vxaPBQdVaQg'],
      ['Remo con mochila a una mano', 3, '10-12 por lado', 'https://www.youtube.com/watch?v=pHEzSV5CjbQ'],
      ['Pájaro con botellas', 3, '15', 'https://www.youtube.com/watch?v=X-xCQ1gh-kA'],
      ['Curl concentrado con garrafa', 3, '12', 'https://www.youtube.com/watch?v=8B0mY3gknoc'],
      ['Curl con botellas en silla', 3, '12', 'https://www.youtube.com/watch?v=jkwxFce71ao'],
    ],
  },
  {
    day: 6,
    name: 'Pierna B en casa (isquios/glúteo)',
    exercises: [
      ['Peso muerto rumano a una pierna', 3, '10 por pierna', 'https://www.youtube.com/watch?v=QOVR8nOpK30'],
      ['Puente de glúteo', 3, '15-20', 'https://www.youtube.com/watch?v=v_9dS-l3GWU'],
      ['Hip thrust con apoyo en silla', 3, '12-15', 'https://www.youtube.com/watch?v=aMntMBkmv0g'],
      ['Zancada búlgara con silla', 3, '10 por pierna', 'https://www.youtube.com/watch?v=imWey1JId4g'],
      ['Elevación de talones sentado', 4, '20', 'https://www.youtube.com/watch?v=Hq7ZnmkuZWM'],
    ],
  },
  { day: 7, name: 'Descanso', restDay: true, exercises: [] },
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

async function seedLocation(location, days) {
  const { rows: existing } = await client.query(
    'select 1 from routine_days where user_id = $1 and location = $2 limit 1',
    [userId, location],
  );
  if (existing.length > 0) {
    console.log(`Ya existe una rutina de "${location}" para este usuario; no se vuelve a sembrar.`);
    return;
  }

  for (const { day, name, exercises, restDay } of days) {
    const { rows } = await client.query(
      'insert into routine_days (user_id, day_of_week, name, is_rest_day, location) values ($1, $2, $3, $4, $5) returning id',
      [userId, day, name, !!restDay, location],
    );
    const dayId = rows[0].id;

    for (let i = 0; i < exercises.length; i++) {
      const [exName, sets, reps, videoUrl] = exercises[i];
      await client.query(
        'insert into routine_exercises (routine_day_id, sort_order, name, sets, reps, video_url) values ($1, $2, $3, $4, $5, $6)',
        [dayId, i + 1, exName, sets, reps, videoUrl ?? null],
      );
    }
  }

  console.log(`Rutina de "${location}" sembrada para ${email}.`);
}

await seedLocation('gym', gymRoutine);
await seedLocation('home', homeRoutine);
await client.end();
