// Repair seeded strings corrupted at seed time: '???'/'??' runs were mangled
// multibyte chars (₵/—/•/✦/’). Scan all text/jsonb columns and restore.
process.loadEnvFile('.env')
const { Client } = require('pg')

const fix = (s) =>
  s
    .replace(/GH\?{2,}/g, 'GH₵')
    .replace(/\?{3,}/g, ' — ')
    .replace(/\?\?/g, ' — ')
    .replace(/\s+—\s+([0-9])/g, ' — $1')

async function run() {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()

  const { rows: cols } = await c.query(`
    select table_name, column_name from information_schema.columns
    where table_schema = 'public' and data_type in ('text','character varying','jsonb','json')
  `)

  let patched = 0
  for (const { table_name: t, column_name: col } of cols) {
    const { rows } = await c.query(
      `select id, "${col}" as v from "${t}" where "${col}"::text ~ '\\?\\?'`
    )
    for (const r of rows) {
      const nv = fix(typeof r.v === 'string' ? r.v : JSON.stringify(r.v))
      const out = typeof r.v === 'string' ? nv : nv
      await c.query(`update "${t}" set "${col}" = $1 where id = $2`, [out, r.id])
      patched++
    }
  }
  console.log(`patched ${patched} cells`)
  await c.end()
}
run().catch((e) => { console.error(e); process.exit(1) })
