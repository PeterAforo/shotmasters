import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/payload'
import { Reveal } from '@/components/anim/Reveal'
import { SectionHeading } from '@/components/site/SectionHeading'
import { TransitionLink } from '@/components/anim/PageTransition'

export const metadata: Metadata = { title: 'About' }

export default async function AboutPage() {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <SectionHeading
        eyebrow="Our Story"
        title="BUILT FOR THE LOVE OF THE GAME"
        sub={settings?.tagline || 'Accra’s home of championship snooker'}
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-5 text-muted leading-relaxed">
            <p>
              Shot Masters Cue Club opened its doors with a simple obsession: bring
              world-class cue sports to Accra. Not a side-room afterthought — a dedicated
              arena with championship-grade tables, pro lighting and cloth that plays true.
            </p>
            <p>
              Whether you&apos;re a first-timer learning your stance or a shark running a
              century break, there&apos;s a table — and a community — waiting for you.
              Weekly tournaments, coaching sessions, and member nights keep the felt busy
              every single week.
            </p>
            <p>
              This is more than a pool hall. It&apos;s where Accra&apos;s cue sports scene lives.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: 'Championship tables', v: 'Snooker & pool' },
              { k: 'Weekly events', v: 'Tournaments & nights' },
              { k: 'Member rates', v: 'Priority booking' },
              { k: 'Open daily', v: '10:00 – 23:00' },
            ].map((f, i) => (
              <div key={i} className="card-surface p-6">
                <div className="text-xs uppercase tracking-widest text-cyan-neon">{f.k}</div>
                <div className="mt-2 font-display text-lg text-ink">{f.v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-20">
        <div className="card-surface flex flex-col items-start justify-between gap-6 p-10 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-3xl text-ink">COME SEE THE TABLES</h3>
            <p className="mt-2 text-muted">{settings?.address || 'Accra, Ghana'}</p>
          </div>
          <TransitionLink href="/book" className="btn-primary">Book a Table</TransitionLink>
        </div>
      </Reveal>
    </div>
  )
}
