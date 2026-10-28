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
import { GalleryCoverflow } from '@/components/site/GalleryCoverflow'

const GALLERY_CATEGORY: Record<string, string> = {
  club: 'The Club',
  events: 'Events',
  tournaments: 'Tournaments',
  'trick-shots': 'Trick Shots',
}

export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [home, settings, tables, tournaments, gallery, posts] = await Promise.all([
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
    payload
      .find({ collection: 'posts', where: { status: { equals: 'published' } }, sort: '-publishedAt', limit: 3 })
      .catch(() => ({ docs: [] })),
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
            { k: 'People', d: 'Friendship, sportsmanship and a community where every player belongs.', ball: 'radial-gradient(circle at 32% 28%, #ff8a8f, #c1282d 55%, #6e1216)' },
            { k: 'Play', d: 'Structured International 8-Ball — leagues, tournaments, coaching and open play.', ball: 'radial-gradient(circle at 32% 28%, #7da4ff, #2456c8 55%, #12275e)' },
            { k: 'Passion', d: 'The love of the game that built us — shared with Accra and beyond.', ball: 'radial-gradient(circle at 32% 28%, #ffb3d4, #e26a9a 55%, #8a2d55)' },
          ].map((f, i) => (
            <Reveal key={f.k} delay={i * 0.1}>
              <div className="card-surface flex h-full items-start gap-4 p-5">
                <span
                  aria-hidden
                  className="mt-0.5 block h-11 w-11 shrink-0 rounded-full"
                  style={{
                    background: f.ball,
                    boxShadow: 'inset -5px -7px 9px rgba(0,0,0,0.35), inset 3px 4px 7px rgba(255,255,255,0.35), 0 5px 12px rgba(10,15,30,0.3)',
                  }}
                />
                <div>
                  <h3 className="font-display text-lg text-ink">{f.k}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.d}</p>
                </div>
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

      {/* ── LATEST NEWS ─────────────────────────────── */}
      {posts.docs.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <SectionHeading
            eyebrow="News & Announcements"
            title="LATEST FROM THE CLUB"
            sub="Club news, results and announcements."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {posts.docs.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <TransitionLink href={`/news/${p.slug}`} className="card-surface group flex h-full flex-col p-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-neon">{p.category || 'News'}</div>
                  <h3 className="mt-3 font-display text-xl text-ink transition-colors group-hover:text-cyan-neon">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{p.excerpt}</p>}
                  <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-widest text-muted">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </TransitionLink>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <TransitionLink href="/news" className="text-sm font-semibold text-cyan-neon hover:underline">
              All news →
            </TransitionLink>
          </Reveal>
        </section>
      )}

      {/* ── GALLERY COVERFLOW ────────────────────────── */}
      {sections.showGallery !== false && (
        <section className="overflow-hidden bg-white py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal className="mx-auto max-w-xl text-center">
              <div className="eyebrow">Gallery</div>
              <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">THE VIBE</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Inside the club through our lens — tournament nights, big breaks and the
                community, in photos and videos.
              </p>
            </Reveal>
            <Reveal className="mt-10">
              <GalleryCoverflow
                slides={[
                  ...gallery.docs.map((g, i) => ({
                    id: String(g.id),
                    src: mediaUrl(g.image, 'card') || GALLERY_FALLBACKS[i % GALLERY_FALLBACKS.length],
                    title: g.title,
                    category: GALLERY_CATEGORY[g.category ?? 'club'] ?? 'The Club',
                    video: g.type === 'video' && g.videoUrl?.endsWith('.mp4') ? g.videoUrl : undefined,
                  })),
                  { id: 'v1', src: IMG.crowd, title: 'Club Night Highlights', category: 'Videos', video: '/media/video-01.mp4' },
                  { id: 'v2', src: IMG.hall, title: 'On the Table', category: 'Videos', video: '/media/video-02.mp4' },
                ]}
              />
            </Reveal>
          </div>
        </section>
      )}

    </>
  )
}
