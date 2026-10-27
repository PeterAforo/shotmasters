import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/payload'
import { Reveal } from '@/components/anim/Reveal'
import { SectionHeading } from '@/components/site/SectionHeading'
import { TransitionLink } from '@/components/anim/PageTransition'

export const metadata: Metadata = { title: 'About SMCC' }

const MILESTONES = [
  { year: '2024', text: 'The club is formed and hosts its maiden tournament.' },
  { year: '2025', text: 'Successful International 8-Ball league; Two Shots Pool Club rebrands as Shot Masters Cue Club.' },
  { year: '2025', text: 'First anniversary tournament draws the community together.' },
  { year: '2026', text: 'Second anniversary open play — and the December Cue Festival on the horizon.' },
]

const GOVERNANCE = [
  { role: 'President' },
  { role: 'General Secretary' },
  { role: 'Treasurer' },
  { role: 'Executive Committee' },
]

export default async function AboutPage() {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <SectionHeading
        eyebrow="About SMCC"
        title="PEOPLE · PLAY · PASSION"
        sub={settings?.tagline || 'A professional cue-sports club and social community in Accra, Ghana'}
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-5 leading-relaxed text-muted">
            <p>
              Shot Masters Cue Club (SMCC) brings together cue-sports excellence, social
              connection, sustainability and charity — a professional sporting community
              that gives back through sport.
            </p>
            <p>
              Our story began as Two Shots Pool Club — a group of friends and competitors
              bound by the game. As the community grew, so did our ambition: structured
              league play, an anniversary tradition, and a name worthy of it. Shot Masters
              Cue Club is that next chapter.
            </p>
            <p>
              We play recognised International 8-Ball rules and take player education
              seriously — every member, from first-timer to veteran, gets the support to
              grow their game.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { k: 'People', v: 'Community first — friendships built across the felt' },
              { k: 'Play', v: 'Structured competition, coaching and open play' },
              { k: 'Passion', v: 'Love of the game, shared with Accra and beyond' },
            ].map((f) => (
              <div key={f.k} className="card-surface p-6">
                <div className="font-display text-2xl text-cyan-neon">{f.k}</div>
                <div className="mt-2 text-xs leading-relaxed text-muted">{f.v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-20">
        <div className="eyebrow">Key Milestones</div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {MILESTONES.map((m, i) => (
            <div key={i} className="card-surface border-t-2 border-cyan-neon/40 p-6">
              <div className="font-display text-3xl text-gold">{m.year}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-20">
        <div className="eyebrow">Leadership & Governance</div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOVERNANCE.map((g) => (
            <div key={g.role} className="card-surface p-6">
              <div className="font-semibold text-ink">{g.role}</div>
              <p className="mt-1 text-xs text-muted">Executive Committee — details published after approval.</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          <a href="#" className="font-semibold text-cyan-neon underline-offset-4 hover:underline">
            Download the Official Club Profile (PDF) →
          </a>
        </p>
      </Reveal>

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
