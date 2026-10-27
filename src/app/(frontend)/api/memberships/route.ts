import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getAuthMember } from '@/lib/auth'
import { initializeTransaction, paystackConfigured } from '@/lib/paystack'

const INTERVAL_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, yearly: 12 }

export async function POST(req: Request) {
  const member = await getAuthMember(req)
  if (!member) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  const { planId } = await req.json().catch(() => ({}))
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

  const payload = await getPayloadClient()
  const plan = await payload.findByID({ collection: 'membership-plans', id: planId, overrideAccess: true }).catch(() => null)
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const startsAt = new Date()
  const expiresAt = new Date(startsAt)
  expiresAt.setMonth(expiresAt.getMonth() + (INTERVAL_MONTHS[plan.interval as string] ?? 1))

  const sub = await payload.create({
    collection: 'membership-subscriptions',
    data: {
      member: member.id,
      plan: plan.id,
      status: 'pending_payment',
      startsAt: startsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    },
    overrideAccess: true,
  })

  const reference = `MS-${sub.id}-${Date.now()}`
  await payload.update({
    collection: 'membership-subscriptions',
    id: sub.id,
    data: { paystackRef: reference },
    overrideAccess: true,
  })

  if (!paystackConfigured()) {
    await payload.update({
      collection: 'membership-subscriptions',
      id: sub.id,
      data: { status: 'active', amountPaid: plan.priceGHS as number },
      overrideAccess: true,
    })
    return NextResponse.json({ subscriptionId: sub.id, devConfirmed: true })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
  const tx = await initializeTransaction({
    email: member.email,
    amountGHS: plan.priceGHS as number,
    reference,
    callbackUrl: `${base}/membership/confirmed`,
    metadata: { kind: 'membership', docId: sub.id, memberId: member.id },
  })

  return NextResponse.json({ subscriptionId: sub.id, authorizationUrl: tx.authorizationUrl, reference: tx.reference })
}
