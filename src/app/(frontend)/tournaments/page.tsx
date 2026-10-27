import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
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

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <SectionHeading
        eyebrow="Competition"
        title="TOURNAMENTS & EVENTS"
        sub="Knockouts, leagues and open nights. Enter online — pay your entry with MoMo."
      />

      {docs.length === 0 ? (
        <Reveal><p className="text-muted">New events are being racked up. Check back soon.</p></Reveal>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {docs.map((t, i) => {
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
          })}
        </div>
      )}
    </div>
  )
}
