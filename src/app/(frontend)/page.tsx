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
import { VideoLightbox } from '@/components/site/VideoLightbox'

export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [home, settings, tables, tournaments, gallery] = await Promise.all([
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

      {/* ── 03 OUR CLUB — intro (mockup layout) ─────── */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        {/* headline row: left title, right dual text columns */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-neon" />
                About Us
              </span>
              <h2 className="mt-6 font-display text-5xl leading-[1.02] sm:text-6xl">
                <span className="text-cyan-neon">Welcome To</span>
                <br />
                <span className="text-ink">Shot Masters!</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-6 text-sm leading-relaxed text-muted sm:grid-cols-2 sm:pt-16">
              <p>
                Shot Masters Cue Club is a professional cue-sports club and social community
                in Accra, Ghana. Born from Two Shots Pool Club, we&apos;ve grown into structured
                International 8-Ball league play, anniversary tournaments and open nights.
              </p>
              <p>
                Beyond the tables we invest in community — charitable outreach, sports tourism
                and a welcoming home for anyone who loves the game, from first-timers to veterans.
              </p>
            </div>
          </Reveal>
        </div>

        {/* feature cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { k: 'People', d: 'Friendship, sportsmanship and a community where every player belongs.', icon: 'M16 19c-2.5 0-4.5-2-4.5-4.5S13.5 10 16 10s4.5 2 4.5 4.5S18.5 19 16 19Zm-8 0c-2.5 0-4.5-2-4.5-4.5S5.5 10 8 10s4.5 2 4.5 4.5S10.5 19 8 19Zm4-13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', accent: 'bg-cyan-neon' },
            { k: 'Play', d: 'Structured International 8-Ball — leagues, tournaments, coaching and open play.', icon: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-14a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', accent: 'bg-ink' },
            { k: 'Passion', d: 'The love of the game that built us — shared with Accra and beyond.', icon: 'M12 21s-7.5-4.6-9.8-9.2C.6 8.4 2.5 5 6 5c2.2 0 3.6 1.2 4.4 2.4h3.2C14.4 6.2 15.8 5 18 5c3.5 0 5.4 3.4 3.8 6.8C19.5 16.4 12 21 12 21Z', accent: 'bg-cyan-neon' },
          ].map((f, i) => (
            <Reveal key={f.k} delay={i * 0.1}>
              <div className="card-surface h-full p-7">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${f.accent}`}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white"><path d={f.icon} /></svg>
                </div>
                <h3 className="mt-5 font-display text-xl text-ink">{f.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* image + overlapping video card */}
        <div className="relative mt-16 pb-12">
          <Reveal>
            <div className="h-[420px] w-[68%] overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/img-01.jpg" alt="SMCC club night" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="absolute -bottom-10 right-0 w-[45%] min-w-[280px]">
            <VideoLightbox poster="/media/img-04.jpg" src="/media/video-01.mp4" alt="Watch SMCC highlights" />
          </Reveal>
        </div>
      </section>

      {/* ── TABLES ───────────────────────────────────── */}
      {sections.showTables !== false && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
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
