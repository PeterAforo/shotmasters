import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getAuthMember } from '@/lib/auth'
import { initializeTransaction, paystackConfigured } from '@/lib/paystack'

export async function POST(req: Request) {
  const member = await getAuthMember(req)
  if (!member) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  const { tournamentId } = await req.json().catch(() => ({}))
  if (!tournamentId) return NextResponse.json({ error: 'tournamentId required' }, { status: 400 })

  const payload = await getPayloadClient()
  const tournament = await payload.findByID({ collection: 'tournaments', id: tournamentId, overrideAccess: true }).catch(() => null)
  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
  if (tournament.status !== 'registration') {
    return NextResponse.json({ error: 'Registration is not open for this tournament' }, { status: 400 })
  }

  const existing = await payload.find({
    collection: 'tournament-entries',
    where: {
      and: [{ tournament: { equals: tournament.id } }, { member: { equals: member.id } }],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length) {
    return NextResponse.json({ error: 'You are already entered in this tournament' }, { status: 409 })
  }

  const { totalDocs } = await payload.count({
    collection: 'tournament-entries',
    where: { tournament: { equals: tournament.id } },
    overrideAccess: true,
  })
  if (tournament.maxPlayers && totalDocs >= (tournament.maxPlayers as number)) {
    return NextResponse.json({ error: 'Tournament is full' }, { status: 409 })
  }

  const fee = (tournament.entryFee as number) || 0
  const entry = await payload.create({
    collection: 'tournament-entries',
    data: {
      tournament: tournament.id,
      member: member.id,
      paid: fee === 0,
    },
    overrideAccess: true,
  })

  if (fee === 0 || !paystackConfigured()) {
    if (fee > 0) {
      await payload.update({ collection: 'tournament-entries', id: entry.id, data: { paid: true }, overrideAccess: true })
    }
    return NextResponse.json({ entryId: entry.id, devConfirmed: fee > 0, free: fee === 0 })
  }

  const reference = `TE-${entry.id}-${Date.now()}`
  await payload.update({ collection: 'tournament-entries', id: entry.id, data: { paystackRef: reference }, overrideAccess: true })

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
  const tx = await initializeTransaction({
    email: member.email,
    amountGHS: fee,
    reference,
    callbackUrl: `${base}/tournaments/${tournament.slug}?entered=1`,
    metadata: { kind: 'tournament', docId: entry.id, memberId: member.id },
  })

  return NextResponse.json({ entryId: entry.id, authorizationUrl: tx.authorizationUrl, reference: tx.reference })
}
