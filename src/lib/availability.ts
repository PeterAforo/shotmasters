import { getPayloadClient } from './payload'
import { SLOT_TIMES } from '../collections/Bookings'

const HOLD_MS = 15 * 60 * 1000

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** All bookable slots for a table+date: each marked free/held/booked. */
export async function getTableAvailability(tableId: string | number, dateKey: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { table: { equals: tableId } },
        { dateKey: { equals: dateKey } },
        { status: { in: ['confirmed', 'pending_payment'] } },
      ],
    },
    limit: 100,
    overrideAccess: true,
  })

  const now = Date.now()
  const blocked: { start: number; end: number; status: string }[] = docs
    .filter((b) => {
      if (b.status === 'confirmed') return true
      return now - new Date(b.createdAt as string).getTime() <= HOLD_MS
    })
    .map((b) => ({
      start: toMinutes(b.startTime as string),
      end: toMinutes(b.startTime as string) + (b.durationHours as number) * 60,
      status: b.status as string,
    }))

  const todayKey = new Date().toISOString().slice(0, 10)
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  return SLOT_TIMES.map((time) => {
    const start = toMinutes(time)
    const hit = blocked.find((b) => start >= b.start && start < b.end)
    const past = dateKey === todayKey && start <= nowMinutes
    return {
      time,
      available: !hit && !past,
      state: past ? 'past' : hit ? (hit.status === 'confirmed' ? 'booked' : 'held') : 'free',
    }
  })
}
