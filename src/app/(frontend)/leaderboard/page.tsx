import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { mediaUrl } from '@/lib/utils'

export const metadata: Metadata = { title: 'Leaderboard' }
export const revalidate = 60

const trendIcon = { up: '▲', down: '▼', same: '—' } as const
const trendColor = { up: 'text-green-neon', down: 'text-pink-neon', same: 'text-muted' } as const

export default async function LeaderboardPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'rankings', sort: 'rank', limit: 50 })
    .catch(() => ({ docs: [] }))

  const top3 = docs.slice(0, 3)
  const rest = docs.slice(3)

  return (
    <>
    <PageHeader
      title="Club Leaderboard"
      crumbs={[{ label: 'The Club' }, { label: 'Leaderboard' }]}
      image="/media/img-06.jpg"
      sub="Updated weekly by club staff. Earn points in tournaments and ladder matches."
    />
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8">

      {docs.length === 0 ? (
        <Reveal><p className="text-center text-muted">Rankings publish after our next tournament.</p></Reveal>
      ) : (
        <>
          {/* podium */}
          <div className="mb-14 grid items-end gap-4 sm:grid-cols-3">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((r) => {
              const isFirst = r.rank === 1
              const avatar = mediaUrl(r.avatar, 'thumbnail')
              return (
                <Reveal key={r.id} className={isFirst ? 'sm:-mb-4 sm:order-2' : ''}>
                  <div className={`card-surface p-6 text-center ${isFirst ? 'border-gold/50 shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)]' : ''}`}>
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt={r.playerName} className="mx-auto h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 font-display text-2xl ${isFirst ? 'text-gold' : 'text-ink'}`}>
                        {r.playerName?.slice(0, 1)}
                      </div>
                    )}
                    <div className={`mt-3 font-display text-5xl ${isFirst ? 'text-gold' : 'text-ink/60'}`}>#{r.rank}</div>
                    <div className="mt-1 font-semibold text-ink">{r.playerName}</div>
                    <div className="mt-2 text-xs text-muted">{r.points} pts · HB {r.highBreak}</div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <div className="card-surface overflow-hidden">
            <div className="hidden grid-cols-[3rem_1fr_6rem_6rem_5rem_4rem] gap-4 border-b border-line px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted sm:grid">
              <span>Rank</span><span>Player</span><span>W / L</span><span>High Break</span><span>Points</span><span>Trend</span>
            </div>
            {rest.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.03}>
                <div className="grid grid-cols-[3rem_1fr_5rem] items-center gap-4 border-b border-line px-6 py-4 last:border-0 sm:grid-cols-[3rem_1fr_6rem_6rem_5rem_4rem]">
                  <span className="font-display text-xl text-muted">{r.rank}</span>
                  <span className="font-semibold text-ink">{r.playerName}</span>
                  <span className="hidden text-sm text-muted sm:block">{r.wins} / {r.losses}</span>
                  <span className="hidden text-sm text-cyan-neon sm:block">{r.highBreak}</span>
                  <span className="font-display text-ink">{r.points}</span>
                  <span className={`hidden sm:block ${trendColor[(r.trend as keyof typeof trendColor) || 'same']}`}>
                    {trendIcon[(r.trend as keyof typeof trendIcon) || 'same']}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
    </>
  )
}
