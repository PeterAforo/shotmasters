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

  const img = mediaUrl(t.coverImage, 'hero') || t.posterUrl || null
  const reg = t.registration
  const external = reg?.method === 'external'
  const longDate = new Date(t.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Accra',
  })
  const details: [string, string | null | undefined, string?][] = [
    ['Date', longDate],
    ['Time', t.time],
    ['Venue', t.venue],
    ['Theme', t.theme],
    ['Format', `International 8-Ball · ${t.format.charAt(0).toUpperCase()}${t.format.slice(1).replace('-', ' ')}`],
    ['Cash prizes', t.prizePool, 'text-gold'],
    ['Spectators', t.spectators],
    ['Players', external ? 'Registration required' : (t.entryFee ?? 0) > 0 ? `Entry ${formatGHS(t.entryFee)}` : 'Free entry'],
    ['Capacity', t.maxPlayers ? `Up to ${t.maxPlayers} players` : null],
  ]

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
            <div className="flex flex-wrap items-center gap-3">
              {t.theme && (
                <span className="bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {t.theme}
                </span>
              )}
              <span className="bg-cyan-neon/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-neon">
                International 8-Ball
              </span>
              <span className="text-xs uppercase tracking-widest text-muted">{formatDate(t.date)}</span>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-8">
            <RichText data={t.description} />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="space-y-6 lg:col-span-2">
          {img && (
            <a href={img} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${t.title} poster`} className="w-full border border-line object-cover" />
            </a>
          )}

          <div className="card-surface p-8">
            <h3 className="font-display text-xl text-ink">EVENT DETAILS</h3>
            <dl className="mt-5 space-y-4 text-sm">
              {details
                .filter(([, v]) => v)
                .map(([k, v, cls]) => (
                  <div key={k} className="flex justify-between gap-6">
                    <dt className="shrink-0 text-muted">{k}</dt>
                    <dd className={`text-right ${cls ?? 'text-ink'}`}>{v}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-8">
              {t.status === 'completed' ? (
                <p className="text-sm text-muted">This tournament has finished.</p>
              ) : external ? (
                <div className="space-y-5">
                  <div className="eyebrow">Player Registration {t.status === 'registration' ? 'Now Open' : ''}</div>
                  {reg?.url && (
                    <a href={reg.url} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center">
                      {reg.label || 'Register Now'}
                    </a>
                  )}
                  {reg?.ussdCode && (
                    <div className="border border-line bg-surface-2/50 p-5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Register via USSD</div>
                      <ol className="mt-3 space-y-2 text-sm text-ink">
                        <li>1. Dial <span className="font-display text-lg text-cyan-neon">{reg.ussdCode}</span></li>
                        {reg.eventCode && (
                          <li>2. Enter event code <span className="font-display text-lg text-gold">{reg.eventCode}</span></li>
                        )}
                        <li>{reg.eventCode ? '3' : '2'}. Choose tickets and approve the MojoPay prompt</li>
                      </ol>
                    </div>
                  )}
                  {!reg?.url && img && (
                    <p className="text-xs text-muted">Or scan the QR code on the event poster to register online.</p>
                  )}
                  {reg?.phone && (
                    <p className="text-sm text-muted">
                      Enquiries:{' '}
                      <a href={`tel:${reg.phone.replace(/\s/g, '')}`} className="font-semibold text-ink hover:text-cyan-neon">
                        {reg.phone}
                      </a>
                    </p>
                  )}
                </div>
              ) : t.status === 'registration' ? (
                <EnterTournament tournamentId={t.id as number} fee={t.entryFee ?? 0} />
              ) : (
                <p className="text-sm text-muted">Registration is not open yet.</p>
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
