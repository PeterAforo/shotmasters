import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { RichText } from '@/components/RichText'
import { formatDate, formatGHS, mediaUrl } from '@/lib/utils'
import { EnterTournament } from './EnterTournament'
import { waLink, waMessages } from '@/lib/whatsapp'

export const revalidate = 60

async function getTournament(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'tournaments',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const t = await getTournament(slug).catch(() => null)
  return t ? { title: t.title } : {}
}

export default async function TournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ entered?: string }>
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const t = await getTournament(slug)
  if (!t) notFound()

  const payload = await getPayloadClient()
  const entries = await payload
    .find({ collection: 'tournament-entries', where: { tournament: { equals: t.id } }, limit: 100, depth: 1, overrideAccess: true })
    .catch(() => ({ docs: [], totalDocs: 0 }))

  const img = mediaUrl(t.coverImage, 'hero')

  return (
    <>
    <PageHeader
      title={t.title}
      crumbs={[{ label: 'The Club' }, { label: 'Tournaments', href: '/tournaments' }, { label: t.title }]}
      image={img || '/media/img-03.jpg'}
    />
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8">
      {sp.entered && (
        <div className="mb-8 rounded-xl border border-green-neon/40 bg-green-neon/10 px-6 py-4 text-sm text-green-neon">
          ✅ Entry confirmed — see you at the table. Check your email for details.
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-cyan-neon/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-neon">
                {t.format}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted">{formatDate(t.date)}</span>
            </div>
          </Reveal>

          {img && (
            <Reveal delay={0.1} className="mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={t.title} className="w-full rounded-2xl border border-line object-cover" />
            </Reveal>
          )}

          <Reveal delay={0.15} className="mt-8">
            <RichText data={t.description} />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-2">
          <div className="card-surface sticky top-28 p-8">
            <h3 className="font-display text-xl text-ink">DETAILS</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Date</dt><dd className="text-ink">{formatDate(t.date)}</dd></div>
              {t.endDate && <div className="flex justify-between"><dt className="text-muted">Ends</dt><dd className="text-ink">{formatDate(t.endDate)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Format</dt><dd className="capitalize text-ink">{t.format}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Entry fee</dt><dd className="text-ink">{(t.entryFee ?? 0) > 0 ? formatGHS(t.entryFee) : 'Free'}</dd></div>
              {t.prizePool && <div className="flex justify-between"><dt className="text-muted">Prize pool</dt><dd className="text-gold">{t.prizePool}</dd></div>}
              {t.venue && <div className="flex justify-between"><dt className="text-muted">Venue</dt><dd className="text-ink">{t.venue}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Spots</dt><dd className="text-ink">{entries.totalDocs}/{t.maxPlayers || '8'}</dd></div>
            </dl>

            <div className="mt-8">
              {t.status === 'registration' ? (
                <EnterTournament tournamentId={t.id as number} fee={t.entryFee ?? 0} />
              ) : (
                <p className="text-sm text-muted">
                  {t.status === 'completed' ? 'This tournament has finished.' : 'Registration is not open yet.'}
                </p>
              )}
            </div>

            <a
              href={waLink(waMessages.tournament(t.title))}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-center text-xs font-semibold text-green-neon hover:underline"
            >
              Ask about this event on WhatsApp →
            </a>
          </div>
        </Reveal>
      </div>

      {/* entrants */}
      {entries.docs.length > 0 && (
        <div className="mt-20">
          <SectionHeading eyebrow="Draw" title="ENTERED PLAYERS" />
          <div className="flex flex-wrap gap-3">
            {entries.docs.map((e) => {
              const m = e.member as { name?: string; nickname?: string }
              return (
                <span key={e.id} className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink">
                  {m?.nickname || m?.name || 'Player'}
                  {e.paid ? '' : ' (unpaid)'}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* results */}
      {t.results && t.results.length > 0 && (
        <div className="mt-20">
          <SectionHeading eyebrow="Final Standings" title="RESULTS" />
          <div className="card-surface overflow-hidden">
            {t.results.map((r, i) => (
              <div key={i} className="flex items-center gap-5 border-b border-line px-6 py-4 last:border-0">
                <span className={`font-display text-2xl ${r.placement === 1 ? 'text-gold' : 'text-muted'}`}>#{r.placement}</span>
                <span className="font-semibold text-ink">{r.playerName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
