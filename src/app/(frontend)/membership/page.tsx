import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { formatGHS } from '@/lib/utils'
import { JoinPlan } from './JoinPlan'

export const metadata: Metadata = { title: 'Membership' }
export const revalidate = 60

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>
}) {
  const sp = await searchParams
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'membership-plans', sort: 'sortOrder', limit: 10 })
    .catch(() => ({ docs: [] }))

  return (
    <>
    <PageHeader title="Membership" crumbs={[{ label: 'Membership' }]} image="/media/img-02.jpg" />
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8">
      {sp.confirmed && (
        <div className="mb-10 rounded-xl border border-green-neon/40 bg-green-neon/10 px-6 py-4 text-sm text-green-neon">
          ⭐ Payment received — your membership is being activated. Check your email shortly.
        </div>
      )}

      <SectionHeading
        eyebrow="Membership"
        title="CHOOSE YOUR TIER"
        sub="Member rates on every table, priority booking windows, free tournament entries and more."
        align="center"
      />

      <div className="grid gap-8 md:grid-cols-3">
        {docs.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.1}>
            <div
              className={`card-surface relative flex h-full flex-col p-8 ${
                p.featured
                  ? 'border-cyan-neon/60 shadow-[0_0_60px_-12px_rgba(34,211,238,0.4)]'
                  : ''
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-linear-to-r from-cyan-neon to-green-neon px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-paper">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-3xl text-ink">{p.name}</h3>
              {p.description && <p className="mt-2 text-sm text-muted">{p.description}</p>}
              <div className="mt-6">
                <span className="font-display text-5xl text-gradient-rainbow">{formatGHS(p.priceGHS)}</span>
                <span className="ml-2 text-sm text-muted">per {p.interval?.replace('ly', '')}</span>
              </div>
              {p.perks?.length ? (
                <ul className="mt-7 flex-1 space-y-3">
                  {p.perks.map((perk, j) => (
                    <li key={j} className="flex gap-3 text-sm text-muted">
                      <span className="text-green-neon">✓</span> {perk.perk}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1" />
              )}
              <div className="mt-8">
                <JoinPlan planId={p.id as number} planName={p.name} price={p.priceGHS ?? 0} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center text-sm text-muted">
        Pay securely with MTN MoMo, Vodafone Cash or card via Paystack.
      </Reveal>

      <div className="mx-auto mt-20 max-w-3xl">
        <Reveal>
          <div className="eyebrow">How to Apply</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Pick a tier above, or send a membership enquiry and we&apos;ll walk you through
            joining. Every application is reviewed by the Club — we&apos;ll get back to you
            within a few days.
          </p>
        </Reveal>
        <Reveal className="mt-10">
          <div className="eyebrow">Frequently Asked</div>
          <div className="mt-5 space-y-3">
            {[
              { q: 'Who can join SMCC?', a: 'Anyone with a love for cue sports — beginners to competitors. All applications go through the Club\u2019s standard review.' },
              { q: 'What are member responsibilities?', a: 'Respect the tables, the rules and each other — our code of conduct keeps the club welcoming for everyone.' },
              { q: 'What rules does the club play?', a: 'Recognised International 8-Ball rules. New members get a walkthrough on their first visit.' },
              { q: 'Can I pause or cancel?', a: 'Yes — memberships are month-to-month after your first term. Talk to the committee to pause or cancel.' },
            ].map((f) => (
              <details key={f.q} className="card-surface group px-6 py-4">
                <summary className="cursor-pointer list-none font-semibold text-ink transition-colors group-open:text-cyan-neon">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
    </>
  )
}
