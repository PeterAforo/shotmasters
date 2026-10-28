import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { formatDate, formatGHS } from '@/lib/utils'
import { SectionHeading } from '@/components/site/SectionHeading'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'
import { LogoutButton } from './LogoutButton'

export const metadata: Metadata = { title: 'My Account' }
export const dynamic = 'force-dynamic'

const statusStyle: Record<string, string> = {
  confirmed: 'text-green-neon',
  pending_payment: 'text-gold',
  cancelled: 'text-muted',
  completed: 'text-cyan-neon',
  'no-show': 'text-pink-neon',
  active: 'text-green-neon',
  expired: 'text-muted',
}

export default async function AccountPage() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'members') redirect('/login?next=/account')

  const [bookings, subs, entries] = await Promise.all([
    payload.find({
      collection: 'bookings',
      where: { member: { equals: user.id } },
      sort: '-date',
      limit: 20,
      depth: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'membership-subscriptions',
      where: { member: { equals: user.id } },
      sort: '-createdAt',
      limit: 10,
      depth: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'tournament-entries',
      where: { member: { equals: user.id } },
      sort: '-createdAt',
      limit: 10,
      depth: 1,
      overrideAccess: true,
    }),
  ])

  const plan = user.membershipPlan as { name?: string } | null | undefined

  return (
    <>
    <PageHeader title="My Account" crumbs={[{ label: 'My Account' }]} image="/media/img-02.jpg" />
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-16 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading eyebrow="Member Area" title={`HEY, ${(user.nickname || user.name || 'PLAYER').toUpperCase()}`} />
        <LogoutButton />
      </div>

      {/* membership card */}
      <Reveal>
        <div className={`card-surface mb-10 flex flex-wrap items-center justify-between gap-4 p-6 ${user.membershipStatus === 'active' ? 'border-gold/50' : ''}`}>
          <div>
            <div className="eyebrow">Membership</div>
            {user.membershipStatus === 'active' ? (
              <>
                <div className="mt-1 font-display text-2xl text-gold">{plan?.name || 'Active'}</div>
                <div className="text-xs text-muted">Valid until {formatDate(user.membershipExpiresAt)}</div>
              </>
            ) : (
              <div className="mt-1 text-muted">No active membership</div>
            )}
          </div>
          {user.membershipStatus !== 'active' && (
            <TransitionLink href="/membership" className="btn-primary">Join the Club</TransitionLink>
          )}
        </div>
      </Reveal>

      {/* bookings */}
      <Reveal delay={0.05}>
        <h2 className="eyebrow mb-4">My Bookings</h2>
        {bookings.docs.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing booked yet — <TransitionLink href="/book" className="text-cyan-neon hover:underline">grab a table</TransitionLink>.
          </p>
        ) : (
          <div className="card-surface divide-y divide-line overflow-hidden">
            {bookings.docs.map((b) => {
              const t = b.table as { name?: string }
              return (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div>
                    <div className="font-semibold text-ink">{t?.name || 'Table'}</div>
                    <div className="text-xs text-muted">{formatDate(b.date)} · {b.startTime} · {b.durationHours}h</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold uppercase tracking-widest ${statusStyle[b.status as string] ?? 'text-muted'}`}>
                      {String(b.status).replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted">{formatGHS(b.totalPrice)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Reveal>

      {/* tournament entries */}
      <Reveal delay={0.1} className="mt-10">
        <h2 className="eyebrow mb-4">Tournament Entries</h2>
        {entries.docs.length === 0 ? (
          <p className="text-sm text-muted">
            None yet — <TransitionLink href="/tournaments" className="text-cyan-neon hover:underline">enter a tournament</TransitionLink>.
          </p>
        ) : (
          <div className="card-surface divide-y divide-line overflow-hidden">
            {entries.docs.map((e) => {
              const t = e.tournament as { title?: string; slug?: string }
              return (
                <div key={e.id} className="flex items-center justify-between px-6 py-4">
                  <TransitionLink href={`/tournaments/${t?.slug}`} className="font-semibold text-ink hover:text-cyan-neon">
                    {t?.title || 'Tournament'}
                  </TransitionLink>
                  <span className={`text-xs font-bold uppercase tracking-widest ${e.paid ? 'text-green-neon' : 'text-gold'}`}>
                    {e.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Reveal>
    </div>
    </>
  )
}
