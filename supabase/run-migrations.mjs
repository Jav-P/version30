import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../packages/backend/.env') });

const projectRef = new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

const migrationsDir = join(__dirname, 'migrations');
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

await client.connect();
console.log(`Connected. Running ${files.length} migration(s)...`);

for (const file of files) {
  console.log(`-> ${file}`);
  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  await client.query(sql);
}

console.log('Done.');
await client.end();
