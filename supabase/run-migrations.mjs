import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../packages/backend/.env') });

const projectRef = new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
const region = process.env.SUPABASE_POOLER_REGION;
if (!region) {
  throw new Error(
    'Falta SUPABASE_POOLER_REGION en .env (ej. us-east-2). Se ve en el connection string del pooler en Supabase > Connect > Direct.',
  );
}
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

const migrationsDir = join(__dirname, 'migrations');
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

// Migraciones que ya se aplicaron a mano antes de que este script llevara
// registro de qué archivos corrió. Solo se marcan como aplicadas sin
// re-ejecutar si el esquema ya existe en este proyecto (para no saltárselas
// en un proyecto nuevo que nunca las corrió).
const legacyMigrations = [
  '20260729000000_initial_schema.sql',
  '20260729010000_drop_domain_fk_constraints.sql',
];

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

await client.connect();

await client.query(`
  create table if not exists schema_migrations (
    filename text primary key,
    applied_at timestamptz not null default now()
  )
`);

const { rows: usersTable } = await client.query("select to_regclass('public.users') as reg");
if (usersTable[0].reg) {
  for (const file of legacyMigrations) {
    await client.query(
      'insert into schema_migrations (filename) values ($1) on conflict do nothing',
      [file],
    );
  }
}

const { rows: applied } = await client.query('select filename from schema_migrations');
const appliedSet = new Set(applied.map((r) => r.filename));
const pending = files.filter((f) => !appliedSet.has(f));

console.log(`Connected. ${pending.length} pending migration(s) of ${files.length} total.`);

for (const file of pending) {
  console.log(`-> ${file}`);
  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  await client.query(sql);
  await client.query('insert into schema_migrations (filename) values ($1)', [file]);
}

console.log('Done.');
await client.end();
