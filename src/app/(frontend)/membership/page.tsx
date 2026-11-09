import type { Metadata } from 'next'
import { SectionHeading } from '@/components/site/SectionHeading'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'

export const metadata: Metadata = { title: 'Membership' }

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>
}) {
  const sp = await searchParams

  return (
    <>
    <PageHeader title="Membership" crumbs={[{ label: 'Membership' }]} image="/media/img-02.jpg" />
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8">
      {sp.confirmed && (
        <div className="mb-10 rounded-xl border border-green-neon/40 bg-green-neon/10 px-6 py-4 text-sm text-green-neon">
          ⭐ Payment received — your membership is being activated. Check your email shortly.
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Membership" title="BECOME PART OF SMCC" />
        <Reveal>
          <div className="space-y-5 text-base leading-relaxed text-muted">
            <p>
              Membership at Shot Masters Cue Club is about more than access to the tables. It
              is a place in a growing community of players who share a love for cue sports —
              from first-timers learning their stance to seasoned competitors chasing their
              next title. Members take part in structured International 8-Ball league play,
              club tournaments, coaching sessions and open nights, building friendships and
              sportsmanship along the way.
            </p>
            <p>
              As a member you help shape the club&apos;s future, from our anniversary events
              and the December Cue Festival to the community and charity work we do through
              sport. Membership categories and benefits are currently being finalised by the
              Club, and full details will be published here soon. In the meantime, we would
              love to hear from you — send us an enquiry and we&apos;ll keep you informed.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <Reveal>
          <div className="eyebrow">How to Apply</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Send a membership enquiry and we&apos;ll walk you through joining. Every
            application is reviewed by the Club — we&apos;ll get back to you within a few days.
          </p>
          <TransitionLink href="/contact" className="btn-primary mt-6">Make an Enquiry</TransitionLink>
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
