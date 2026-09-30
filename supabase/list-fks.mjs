import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../packages/backend/.env') });

const projectRef = new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@aws-0-${process.env.SUPABASE_POOLER_REGION}.pooler.supabase.com:6543/postgres`;

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();
const res = await client.query(`
  select conname, conrelid::regclass as table_name, confrelid::regclass as references_table
  from pg_constraint
  where contype = 'f' and connamespace = 'public'::regnamespace
  order by conrelid::regclass::text
`);
console.table(res.rows);
await client.end();
