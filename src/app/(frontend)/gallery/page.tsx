import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/anim/Reveal'
import { mediaUrl } from '@/lib/utils'
import { GALLERY_FALLBACKS } from '@/lib/imagery'

export const metadata: Metadata = { title: 'Gallery' }
export const revalidate = 60

export default async function GalleryPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload
    .find({ collection: 'gallery-items', sort: 'sortOrder', limit: 60 })
    .catch(() => ({ docs: [] }))

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <SectionHeading
        eyebrow="Gallery"
        title="INSIDE THE CLUB"
        sub="The felt, the lights, the moments — straight from the floor."
      />

      {docs.length === 0 ? (
        <Reveal><p className="text-muted">Photos dropping soon — check back after our next event night.</p></Reveal>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {docs.map((g, i) => {
            const img = mediaUrl(g.image) || GALLERY_FALLBACKS[i % GALLERY_FALLBACKS.length]
            return (
              <Reveal key={g.id} delay={(i % 3) * 0.07} className="break-inside-avoid">
                <figure className="card-surface group overflow-hidden">
                  {g.type === 'video' && g.videoUrl ? (
                    <div className="aspect-video">
                      <iframe src={g.videoUrl} className="h-full w-full" allow="autoplay; fullscreen" title={g.title} />
                    </div>
                  ) : img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={g.title} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-surface-2 font-display text-4xl text-line">
                      {g.title?.slice(0, 2)}
                    </div>
                  )}
                  {(g.title || g.caption) && (
                    <figcaption className="p-4">
                      <div className="font-semibold text-ink">{g.title}</div>
                      {g.caption && <p className="mt-1 text-xs text-muted">{g.caption}</p>}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            )
          })}
        </div>
      )}

      <Reveal className="mt-16">
        <h3 className="font-display text-2xl text-ink">VIDEO HIGHLIGHTS</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {['/media/video-01.mp4', '/media/video-02.mp4'].map((src) => (
            <figure key={src} className="card-surface overflow-hidden">
              <video src={src} controls playsInline preload="metadata" className="aspect-video w-full bg-night object-cover" />
            </figure>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
