process.loadEnvFile('.env')
const { Client } = require('pg')

async function run() {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()
  const res = await c.query("select 'GH₵ test — dash' as v")
  console.log('returned:', JSON.stringify(res.rows[0].v))
  console.log('codes:', [...res.rows[0].v].map((ch) => ch.codePointAt(0).toString(16)).join(' '))
  await c.end()
}
run().catch((e) => { console.error(e.message); process.exit(1) })
