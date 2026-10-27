process.loadEnvFile('.env')
const { Client } = require('pg')

async function run() {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()
  const t = await c.query(
    "select table_name from information_schema.tables where table_schema='public' and table_name ilike '%tournament%'"
  )
  console.log('tables:', t.rows.map((r) => r.table_name))
  const cols = await c.query(
    "select column_name, data_type from information_schema.columns where table_name='tournaments'"
  )
  console.log('cols:', cols.rows.map((r) => r.column_name + ':' + r.data_type).join(', '))
  const d = await c.query('select id, title, prize_pool from tournaments limit 5').catch(() => null)
  if (d) d.rows.forEach((r) => console.log(r.id, '|', r.title, '|', JSON.stringify(r.prize_pool)))
  await c.end()
}
run().catch((e) => { console.error(e.message); process.exit(1) })
