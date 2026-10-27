import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getAuthMember } from '@/lib/auth'
import { initializeTransaction, paystackConfigured } from '@/lib/paystack'

export async function POST(req: Request) {
  const member = await getAuthMember(req)
  if (!member) {
    return NextResponse.json({ error: 'Please sign in to book a table' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { tableId, date, startTime, durationHours } = body ?? {}
  if (!tableId || !date || !startTime || !durationHours) {
    return NextResponse.json({ error: 'Missing booking details' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const table = await payload.findByID({ collection: 'tables', id: tableId, overrideAccess: true }).catch(() => null)
  if (!table || table.status !== 'available') {
    return NextResponse.json({ error: 'Table unavailable' }, { status: 400 })
  }

  const totalPrice = (table.hourlyRate as number) * durationHours
  const deposit = table.depositAmount as number

  let booking
  try {
    booking = await payload.create({
      collection: 'bookings',
      data: {
        member: member.id,
        table: table.id,
        date: `${date}T00:00:00Z`,
        startTime,
        durationHours,
        totalPrice,
        status: 'pending_payment',
      },
      overrideAccess: true,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not create booking' },
      { status: 409 },
    )
  }

  const reference = `BK-${booking.id}-${Date.now()}`
  await payload.update({
    collection: 'bookings',
    id: booking.id,
    data: { paystackRef: reference },
    overrideAccess: true,
  })

  if (!paystackConfigured()) {
    // Dev fallback — no payment configured, confirm immediately
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: { status: 'confirmed', depositPaid: deposit },
      overrideAccess: true,
    })
    return NextResponse.json({ bookingId: booking.id, devConfirmed: true })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
  const tx = await initializeTransaction({
    email: member.email,
    amountGHS: deposit,
    reference,
    callbackUrl: `${base}/book/confirmed`,
    metadata: { kind: 'booking', docId: booking.id, memberId: member.id },
  })

  return NextResponse.json({
    bookingId: booking.id,
    authorizationUrl: tx.authorizationUrl,
    reference: tx.reference,
    deposit,
  })
}
