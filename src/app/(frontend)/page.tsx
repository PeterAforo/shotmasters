import { getPayloadClient, getHomePage, getSiteSettings } from '@/lib/payload'
import { formatGHS, mediaUrl } from '@/lib/utils'
import { HeroBallCanvas } from '@/components/three/HeroBallCanvas'
import { ParallaxBg } from '@/components/anim/ParallaxBg'
import { IMG, TABLE_FALLBACKS, GALLERY_FALLBACKS } from '@/lib/imagery'
import { HeroSlider } from '@/components/site/HeroSlider'
import { Marquee } from '@/components/anim/Marquee'
import { Reveal } from '@/components/anim/Reveal'
import { TiltCard } from '@/components/anim/TiltCard'
import { SectionHeading } from '@/components/site/SectionHeading'
import { TransitionLink } from '@/components/anim/PageTransition'

export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [home, settings, tables, tournaments, rankings, gallery] = await Promise.all([
    getHomePage().catch(() => null),
    getSiteSettings().catch(() => null),
    payload
      .find({ collection: 'tables', where: { status: { equals: 'available' } }, sort: 'sortOrder', limit: 6 })
      .catch(() => ({ docs: [] })),
    payload
      .find({
        collection: 'tournaments',
        where: { status: { in: ['upcoming', 'registration', 'ongoing'] } },
        sort: 'date',
        limit: 3,
      })
      .catch(() => ({ docs: [] })),
    payload.find({ collection: 'rankings', sort: 'rank', limit: 5 }).catch(() => ({ docs: [] })),
    payload.find({ collection: 'gallery-items', sort: 'sortOrder', limit: 8 }).catch(() => ({ docs: [] })),
  ])

  const sections = home?.sections ?? {}

  return (
    <>
      {/* ── HERO: dark navy, caption + playable snooker table ── */}
      <section className="relative overflow-hidden bg-[#0a0f1e]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 55% at 30% 20%, rgba(34,211,238,0.10), transparent 65%), radial-gradient(45% 40% at 85% 80%, rgba(244,114,182,0.08), transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[45%] opacity-25 lg:block"
          style={{ backgroundImage: `url(${IMG.hall})`, backgroundSize: 'cover', backgroundPosition: 'center', maskImage: 'linear-gradient(90deg, black, transparent)' }}
        />
        <div className="relative mx-auto grid min-h-[calc(100svh-100px)] max-w-7xl items-end gap-10 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[38%_1fr] lg:gap-12 lg:pt-36">
          <HeroSlider slides={home?.heroSlides} />
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] lg:aspect-auto lg:h-[68vh]">
            <HeroBallCanvas />
          </div>
        </div>
      </section>

      <Marquee text={settings?.marqueeText || 'SHOT MASTERS CUE CLUB • CHAMPIONSHIP TABLES • OPEN DAILY • ACCRA'} />

      {/* ── 03 OUR CLUB — intro ─────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <Reveal>
          <div className="eyebrow">Our Club</div>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Shot Masters Cue Club is a professional cue-sports club and social community in
            Accra, Ghana. Born from Two Shots Pool Club, we&apos;ve grown into structured
            International 8-Ball league play, anniversary tournaments and open nights that
            bring together players, families and fans. Beyond the tables we invest in
            community — charitable outreach, sports tourism and a welcoming home for anyone
            who loves the game.
          </p>
          <TransitionLink href="/about" className="mt-8 inline-block btn-ghost">
            About SMCC →
          </TransitionLink>
        </Reveal>
      </section>

      {/* ── TABLES ───────────────────────────────────── */}
      {sections.showTables !== false && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <SectionHeading
            eyebrow="The Arena"
            title="CHAMPIONSHIP TABLES"
            sub="Tournament-grade cloth, Aramith balls, and lighting tuned for the perfect sight line."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tables.docs.map((t, i) => {
              const img = mediaUrl(t.image, 'card') || TABLE_FALLBACKS[i % TABLE_FALLBACKS.length]
              return (
                <Reveal key={t.id} delay={i * 0.07}>
                  <TiltCard className="card-surface group h-full overflow-hidden">
                    <div className="relative h-48 overflow-hidden bg-surface-2">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={t.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-display text-6xl text-surface-2">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-paper/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-neon backdrop-blur">
                        {t.type}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-display text-xl text-ink">{t.name}</h3>
                        <span className="text-sm font-bold text-gold">{formatGHS(t.hourlyRate)}/hr</span>
                      </div>
                      {t.features?.length ? (
                        <ul className="mt-3 space-y-1">
                          {t.features.slice(0, 3).map((f, j) => (
                            <li key={j} className="text-xs text-muted">— {f.feature}</li>
                          ))}
                        </ul>
                      ) : null}
                      <TransitionLink href="/book" className="mt-5 inline-block text-xs font-bold uppercase tracking-widest text-cyan-neon hover:underline">
                        Book this table →
                      </TransitionLink>
                    </div>
                  </TiltCard>
                </Reveal>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 05 UPCOMING EVENTS ─────────────────────── */}
      {sections.showTournaments !== false && tournaments.docs.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <SectionHeading
            eyebrow="Competitions & Events"
            title="UPCOMING EVENTS"
            sub="Knockouts, leagues and open nights — bring your A game."
          />
          <div className="space-y-4">
            {tournaments.docs.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08}>
                <TransitionLink
                  href={`/tournaments/${t.slug}`}
                  className="card-surface group flex flex-col gap-4 p-6 transition-all duration-300 hover:border-cyan-neon/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="font-display text-4xl text-surface-2 transition-colors group-hover:text-cyan-neon sm:text-5xl">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-ink">{t.title}</h3>
                      <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                        {t.format} · {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {t.prizePool && <span className="text-sm font-bold text-gold">{t.prizePool}</span>}
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      t.status === 'registration' ? 'bg-green-neon/15 text-green-neon' : 'bg-pink-neon/15 text-pink-neon'
                    }`}>
                      {t.status === 'registration' ? 'Open' : t.status}
                    </span>
                  </div>
                </TransitionLink>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <TransitionLink href="/tournaments" className="text-sm font-semibold text-cyan-neon hover:underline">
              All events →
            </TransitionLink>
          </Reveal>
        </section>
      )}

      {/* ── 06 PEOPLE · PLAY · PASSION ────────────────── */}
      <section className="relative bg-[#0d3b2e] py-20">
        <ParallaxBg src={IMG.crowd} scrim="rgba(13,59,46,0.82)" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="Our Values" title="PEOPLE · PLAY · PASSION" align="center" tone="dark" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { k: 'People', d: 'Friendship, sportsmanship and a community where every player belongs.' },
              { k: 'Play', d: 'Structured International 8-Ball — leagues, tournaments, coaching and open play.' },
              { k: 'Passion', d: 'The love of the game that built us — shared with Accra and beyond.' },
            ].map((v, i) => (
              <Reveal key={v.k} delay={i * 0.1}>
                <div className="card-surface h-full bg-surface/95 p-8 text-center">
                  <div className="font-display text-4xl text-cyan-neon">{v.k}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 SPORTS TOURISM & COMMUNITY teaser ─────── */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-20">
        <ParallaxBg src={IMG.hall} scrim="rgba(10,15,30,0.82)" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-5 text-center sm:px-8">
          <Reveal>
            <div className="eyebrow">Sports Tourism & Community</div>
            <h2 className="mt-4 font-display text-4xl text-white sm:text-5xl">MORE THAN A GAME</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Cue sports meet Ghanaian culture — music, food, community and December in GH.
              Our programmes invest in charity, sustainability and the next generation of players.
            </p>
            <TransitionLink href="/tourism" className="btn-ghost mt-8 inline-block text-white/80">
              Explore Community →
            </TransitionLink>
          </Reveal>
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ──────────────────────── */}
      {sections.showLeaderboard !== false && rankings.docs.length > 0 && (
        <section className="relative bg-[#0a0f1e] py-24">
          <ParallaxBg src={IMG.room} scrim="rgba(10,15,30,0.84)" />
          <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
            <SectionHeading eyebrow="The Order" title="CLUB LEADERBOARD" align="center" tone="dark" />
            <div className="card-surface overflow-hidden">
              {rankings.docs.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.05}>
                  <div className="flex items-center gap-5 border-b border-line px-6 py-4 last:border-0">
                    <span className={`font-display w-10 text-2xl ${i === 0 ? 'text-gold' : i === 1 ? 'text-ink' : i === 2 ? 'text-orange-neon' : 'text-muted'}`}>
                      {r.rank}
                    </span>
                    <span className="flex-1 font-semibold text-ink">{r.playerName}</span>
                    <span className="hidden text-xs text-muted sm:block">{r.wins}W · {r.losses}L</span>
                    <span className="text-xs text-muted">HB <span className="text-cyan-neon">{r.highBreak}</span></span>
                    <span className="font-display text-lg text-ink">{r.points}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-8 text-center">
              <TransitionLink href="/leaderboard" className="btn-ghost">Full Leaderboard</TransitionLink>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── GALLERY STRIP ────────────────────────────── */}
      {sections.showGallery !== false && gallery.docs.length > 0 && (
        <section className="relative bg-[#fdf1f6] py-24">
          <ParallaxBg src={IMG.bokeh} scrim="rgba(253,241,246,0.86)" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading eyebrow="Inside the Club" title="THE VIBE" />
          </div>
          <div className="relative flex gap-4 overflow-x-auto px-5 pb-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.docs.map((g, i) => {
              const img = mediaUrl(g.image, 'card') || GALLERY_FALLBACKS[i % GALLERY_FALLBACKS.length]
              return (
                <Reveal key={g.id} delay={i * 0.05} className="shrink-0">
                  <div className="card-surface h-64 w-72 overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={g.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-surface-2 font-display text-4xl text-line">
                        {g.title?.slice(0, 2)}
                      </div>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
          <div className="relative px-5 pt-6 sm:px-8">
            <TransitionLink href="/gallery" className="text-sm font-semibold text-cyan-neon hover:underline">
              Full gallery →
            </TransitionLink>
          </div>
        </section>
      )}

    </>
  )
}
