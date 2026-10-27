import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { BookingFlow } from './BookingFlow'
import { mediaUrl } from '@/lib/utils'

export const metadata: Metadata = { title: 'Book a Table' }

export default async function BookPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'tables', where: { status: { equals: 'available' } }, sort: 'sortOrder', limit: 20, depth: 1 })
    .catch(() => ({ docs: [] }))

  const tables = docs.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    hourlyRate: t.hourlyRate,
    depositAmount: t.depositAmount,
    image: mediaUrl(t.image, 'card'),
  }))

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <SectionHeading
        eyebrow="Reserve"
        title="BOOK A TABLE"
        sub="Pick your table, lock your slot, pay a small deposit with MoMo or card — the rest at the bar."
      />
      <BookingFlow tables={tables} />
    </div>
  )
}
