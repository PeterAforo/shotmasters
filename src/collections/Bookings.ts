import type { CollectionConfig } from 'payload'
import { memberOwnedOrStaff } from '../access'

const HOLD_MS = 15 * 60 * 1000 // unpaid holds release after 15 minutes

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const SLOT_TIMES = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
]

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'id',
    group: 'Club',
    defaultColumns: ['member', 'table', 'date', 'startTime', 'status'],
  },
  access: memberOwnedOrStaff,
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
    },
    {
      name: 'table',
      type: 'relationship',
      relationTo: 'tables',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'dateKey',
      type: 'text',
      index: true,
      admin: { hidden: true, description: 'YYYY-MM-DD derived key for availability queries' },
    },
    {
      name: 'startTime',
      type: 'select',
      required: true,
      options: SLOT_TIMES,
    },
    {
      name: 'durationHours',
      type: 'number',
      required: true,
      min: 1,
      max: 6,
      defaultValue: 1,
    },
    { name: 'totalPrice', type: 'number', required: true },
    { name: 'depositPaid', type: 'number', defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending_payment',
      options: [
        { label: 'Pending Payment', value: 'pending_payment' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
        { label: 'No Show', value: 'no-show' },
      ],
    },
    { name: 'paystackRef', type: 'text', index: true },
    { name: 'notes', type: 'textarea' },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.date) {
          data.dateKey = new Date(data.date).toISOString().slice(0, 10)
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data?.table || !data?.date || !data?.startTime || !data?.durationHours) return data

        const start = toMinutes(data.startTime)
        const end = start + data.durationHours * 60
        if (end > 24 * 60) throw new Error('Booking cannot run past midpaper')

        const dateKey = new Date(data.date).toISOString().slice(0, 10)
        const tableId = typeof data.table === 'object' ? data.table.id : data.table

        const { docs } = await req.payload.find({
          collection: 'bookings',
          where: {
            and: [
              { table: { equals: tableId } },
              { dateKey: { equals: dateKey } },
              { status: { in: ['confirmed', 'pending_payment'] } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 100,
          overrideAccess: true,
        })

        const now = Date.now()
        const conflict = docs.find((b) => {
          // stale unpaid holds don't block
          if (b.status === 'pending_payment' && now - new Date(b.createdAt).getTime() > HOLD_MS) {
            return false
          }
          const bStart = toMinutes(b.startTime as string)
          const bEnd = bStart + (b.durationHours as number) * 60
          return bStart < end && start < bEnd
        })

        if (conflict) {
          throw new Error('That table is already booked for the selected time slot')
        }
        return data
      },
    ],
  },
}
