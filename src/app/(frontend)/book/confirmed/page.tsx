import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { verifyTransaction, paystackConfigured } from '@/lib/paystack'
import { waLink, waMessages } from '@/lib/whatsapp'
import { formatDate, formatGHS } from '@/lib/utils'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'
import { PageHeader } from '@/components/site/PageHeader'

export const metadata: Metadata = { title: 'Booking Confirmed' }

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; booking?: string; dev?: string }>
}) {
  const sp = await searchParams
  const payload = await getPayloadClient()

  let status: 'confirmed' | 'pending' | 'failed' = 'pending'
  let booking: {
    id?: string | number
    status?: string
    table?: { name?: string } | string | number | null
    date?: string
    startTime?: string
    durationHours?: number
    totalPrice?: number
  } | null = null

  if (sp.reference && paystackConfigured()) {
    const tx = await verifyTransaction(sp.reference).catch(() => null)
    status = tx?.success ? 'confirmed' : 'pending'
    const docId = tx?.metadata?.docId as string | number | undefined
    if (docId) {
      booking = await payload
        .findByID({ collection: 'bookings', id: docId, depth: 1, overrideAccess: true })
        .catch(() => null)
    }
  } else if (sp.booking) {
    booking = await payload
      .findByID({ collection: 'bookings', id: sp.booking, depth: 1, overrideAccess: true })
      .catch(() => null)
    status = booking?.status === 'confirmed' ? 'confirmed' : 'pending'
  }

  const tableName =
    booking?.table && typeof booking.table === 'object' ? booking.table.name : undefined

  return (
    <>
    <PageHeader
      title={status === 'confirmed' ? 'Booking Confirmed' : 'Booking Received'}
      crumbs={[{ label: 'Book a Table', href: '/book' }, { label: 'Confirmation' }]}
      image="/media/img-05.jpg"
    />
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 pb-24 pt-16 text-center sm:px-8">
      <Reveal>
        <div className={`font-display text-6xl sm:text-7xl ${status === 'confirmed' ? 'text-green-neon' : 'text-gold'}`}>
          {status === 'confirmed' ? 'LOCKED IN.' : 'ALMOST THERE.'}
        </div>
        <p className="mt-4 text-muted">
          {status === 'confirmed'
            ? 'Your table is booked. We’ve emailed your confirmation — show it at the desk.'
            : 'We’re waiting on payment confirmation — this usually takes a few seconds. Check your email shortly.'}
        </p>

        {booking && (
          <div className="card-surface mx-auto mt-8 max-w-md p-6 text-left">
            <dl className="space-y-2 text-sm">
              {tableName && <div className="flex justify-between"><dt className="text-muted">Table</dt><dd className="text-ink">{tableName}</dd></div>}
              {booking.date && <div className="flex justify-between"><dt className="text-muted">Date</dt><dd className="text-ink">{formatDate(booking.date)}</dd></div>}
              {booking.startTime && <div className="flex justify-between"><dt className="text-muted">Time</dt><dd className="text-ink">{booking.startTime} · {booking.durationHours}h</dd></div>}
              {booking.totalPrice != null && <div className="flex justify-between"><dt className="text-muted">Total</dt><dd className="text-ink">{formatGHS(booking.totalPrice)}</dd></div>}
            </dl>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <TransitionLink href="/account" className="btn-primary">My Account</TransitionLink>
          <a
            href={waLink(waMessages.booking(tableName || 'a table', formatDate(booking?.date), booking?.startTime || ''))}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            Share on WhatsApp
          </a>
        </div>
      </Reveal>
    </div>
    </>
  )
}
