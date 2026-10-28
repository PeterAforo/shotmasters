import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'
import { formatDate, mediaUrl } from '@/lib/utils'

export const metadata: Metadata = { title: 'News' }
export const revalidate = 60

export default async function NewsPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'posts', where: { status: { equals: 'published' } }, sort: '-publishedAt', limit: 30 })
    .catch(() => ({ docs: [] }))

  return (
    <>
    <PageHeader title="News & Announcements" crumbs={[{ label: 'The Club' }, { label: 'News' }]} image="/media/img-06.jpg" />
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8">
      <SectionHeading eyebrow="Club News" title="FROM THE FELT" sub="Match reports, announcements and club stories." />

      {docs.length === 0 ? (
        <Reveal><p className="text-muted">No posts yet — the first story is being inked up.</p></Reveal>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((p, i) => {
            const img = mediaUrl(p.coverImage, 'card')
            return (
              <Reveal key={p.id} delay={(i % 3) * 0.08}>
                <TransitionLink href={`/news/${p.slug}`} className="card-surface group block h-full overflow-hidden">
                  <div className="relative h-52 overflow-hidden bg-surface-2">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-5xl text-line">SMCC</div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-paper/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-pink-neon backdrop-blur">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="text-[11px] uppercase tracking-widest text-muted">{formatDate(p.publishedAt)}</div>
                    <h3 className="mt-2 font-display text-xl leading-tight text-ink group-hover:text-cyan-neon">{p.title}</h3>
                    {p.excerpt && <p className="mt-3 line-clamp-3 text-sm text-muted">{p.excerpt}</p>}
                  </div>
                </TransitionLink>
              </Reveal>
            )
          })}
        </div>
      )}
    </div>
    </>
  )
}
