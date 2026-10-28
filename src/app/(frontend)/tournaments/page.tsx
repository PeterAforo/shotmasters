import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'
import { formatDate, formatGHS, mediaUrl } from '@/lib/utils'

export const metadata: Metadata = { title: 'Tournaments' }
export const revalidate = 60

const statusLabel: Record<string, string> = {
  upcoming: 'Upcoming',
  registration: 'Registration Open',
  ongoing: 'Live Now',
  completed: 'Completed',
}
const statusStyle: Record<string, string> = {
  upcoming: 'bg-surface-2 text-muted',
  registration: 'bg-green-neon/15 text-green-neon',
  ongoing: 'bg-pink-neon/15 text-pink-neon animate-glow-pulse',
  completed: 'bg-surface-2 text-muted',
}

export default async function TournamentsPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'tournaments', sort: '-date', limit: 40, depth: 1 })
    .catch(() => ({ docs: [] }))

  const upcoming = docs.filter((t) => t.status !== 'completed')
  const archive = docs.filter((t) => t.status === 'completed')

  const card = (t: (typeof docs)[number], i: number) => {
    const img = mediaUrl(t.coverImage, 'card')
    return (
      <Reveal key={t.id} delay={(i % 2) * 0.08}>
        <TransitionLink href={`/tournaments/${t.slug}`} className="card-surface group flex h-full gap-6 overflow-hidden p-6">
          <div className="hidden w-32 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:block">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={t.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-3xl text-line">🏆</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusStyle[t.status as string] ?? statusStyle.upcoming}`}>
                {statusLabel[t.status as string] ?? t.status}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted">{t.format}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl text-ink group-hover:text-cyan-neon">{t.title}</h3>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
              <span>📅 {formatDate(t.date)}</span>
              {(t.entryFee ?? 0) > 0 ? <span>Entry {formatGHS(t.entryFee)}</span> : <span className="text-green-neon">Free entry</span>}
              {t.prizePool && <span className="text-gold">🏆 {t.prizePool}</span>}
            </div>
          </div>
        </TransitionLink>
      </Reveal>
    )
  }

  return (
    <>
    <PageHeader title="Competitions & Events" crumbs={[{ label: 'The Club' }, { label: 'Tournaments' }]} image="/media/img-03.jpg" />
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8">
      <SectionHeading
        eyebrow="Competition"
        title="UPCOMING EVENTS"
        sub="Knockouts, leagues and open nights. Enter online — pay your entry with MoMo."
      />

      {docs.length === 0 ? (
        <Reveal><p className="text-muted">New events are being racked up. Check back soon.</p></Reveal>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">{upcoming.map(card)}</div>
          )}

          {archive.length > 0 && (
            <div className="mt-16">
              <Reveal><h3 className="font-display text-2xl text-ink">PAST EVENTS</h3></Reveal>
              <div className="mt-6 grid gap-6 md:grid-cols-2">{archive.map(card)}</div>
            </div>
          )}
        </>
      )}

      <Reveal className="mt-16">
        <div className="card-surface p-8 md:p-10">
          <div className="eyebrow">Rules Education</div>
          <h3 className="mt-3 font-display text-2xl text-ink">INTERNATIONAL 8-BALL, EXPLAINED</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            SMCC plays recognised International 8-Ball rules. New to the game? Start with the
            official rules and our beginner clinics — every member gets a walkthrough on their
            first visit.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a href="https://www.wpa-pool.com/rbi/index.asp" target="_blank" rel="noreferrer" className="btn-ghost text-xs">
              Official WPA Rules →
            </a>
            <TransitionLink href="/book" className="btn-ghost text-xs">Book a Coaching Session →</TransitionLink>
          </div>
        </div>
      </Reveal>
    </div>
    </>
  )
}
