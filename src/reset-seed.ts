// One-off: clear seeded content collections (keeps users/members), then `npm run seed` repopulates cleanly.
import './loadenv'
import { getPayload } from 'payload'
import config from './payload.config'

const CONTENT = ['tournament-entries', 'bookings', 'tournaments', 'posts', 'gallery-items', 'rankings', 'tables', 'membership-plans', 'membership-subscriptions']

const run = async () => {
  const payload = await getPayload({ config })
  for (const slug of CONTENT) {
    const { docs } = await payload.find({ collection: slug as never, limit: 500, overrideAccess: true })
    for (const d of docs as { id: number | string }[]) {
      await payload.delete({ collection: slug as never, id: d.id, overrideAccess: true })
    }
    console.log(`cleared ${slug}: ${docs.length}`)
  }
  process.exit(0)
}

run()
