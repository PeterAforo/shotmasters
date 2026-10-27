import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { verifyWebhookSignature } from '@/lib/paystack'
import { sendBookingConfirmation, sendMembershipActive, sendTournamentEntry } from '@/lib/email'
import { formatDate } from '@/lib/utils'

export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string; status?: string; amount?: number; metadata?: Record<string, unknown> } }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 })
  }

  if (event.event !== 'charge.success' || event.data?.status !== 'success') {
    return NextResponse.json({ ok: true })
  }

  const meta = event.data.metadata ?? {}
  const kind = meta.kind as string | undefined
  const docId = meta.docId as string | number | undefined
  const amountGHS = (event.data.amount ?? 0) / 100
  const payload = await getPayloadClient()

  try {
    if (kind === 'booking' && docId) {
      const booking = await payload.update({
        collection: 'bookings',
        id: docId,
        data: { status: 'confirmed', depositPaid: amountGHS },
        overrideAccess: true,
        depth: 1,
      })
      const member = booking.member as { email?: string; name?: string }
      const table = booking.table as { name?: string }
      if (member?.email) {
        await sendBookingConfirmation(member.email, {
          name: member.name || 'Player',
          table: table?.name || 'Table',
          date: formatDate(booking.date as string),
          time: booking.startTime as string,
          hours: booking.durationHours as number,
          total: booking.totalPrice as number,
        })
      }
    } else if (kind === 'membership' && docId) {
      const sub = await payload.update({
        collection: 'membership-subscriptions',
        id: docId,
        data: { status: 'active', amountPaid: amountGHS },
        overrideAccess: true,
        depth: 1,
      })
      const member = sub.member as { email?: string; name?: string }
      const plan = sub.plan as { name?: string }
      if (member?.email) {
        await sendMembershipActive(member.email, {
          name: member.name || 'Member',
          plan: plan?.name || 'Club membership',
          expiresAt: formatDate(sub.expiresAt as string),
        })
      }
    } else if (kind === 'tournament' && docId) {
      const entry = await payload.update({
        collection: 'tournament-entries',
        id: docId,
        data: { paid: true },
        overrideAccess: true,
        depth: 1,
      })
      const member = entry.member as { email?: string; name?: string }
      const tournament = entry.tournament as { title?: string; date?: string }
      if (member?.email) {
        await sendTournamentEntry(member.email, {
          name: member.name || 'Player',
          tournament: tournament?.title || 'Tournament',
          date: formatDate(tournament?.date),
        })
      }
    }
  } catch (err) {
    console.error('[paystack webhook] fulfilment error:', err)
    return NextResponse.json({ error: 'Fulfilment failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
