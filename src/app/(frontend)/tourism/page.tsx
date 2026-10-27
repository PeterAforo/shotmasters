import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'
import { ParallaxBg } from '@/components/anim/ParallaxBg'
import { IMG } from '@/lib/imagery'
import { mediaUrl } from '@/lib/utils'

export const metadata: Metadata = { title: 'Sports Tourism & Community' }
export const revalidate = 60

const FALLBACK_BLOCKS = [
  { title: 'Sports Tourism', body: 'Cue sports meets Ghanaian culture — music, dance, food and community exchange at every club event.' },
  { title: 'December in GH', body: 'We play our part in Ghana\u2019s December festivities — the December Cue Festival brings cue sports into Accra\u2019s cultural calendar.' },
  { title: 'Community Impact', body: 'Charitable outreach and social interventions through sport — programmes delivered and planned, documented openly.' },
  { title: 'Sustainability', body: 'Responsible events and mindful resource use — documented initiatives and future commitments kept separate and honest.' },
]

export default async function TourismPage() {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({ slug: 'tourism-page' }).catch(() => null)
  const blocks = (page as { blocks?: { title?: string; body?: string; image?: unknown }[] } | null)?.blocks
  const items: { title?: string; body?: string; image?: unknown }[] = blocks?.length ? blocks : FALLBACK_BLOCKS

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <SectionHeading
        eyebrow="Sports Tourism & Community"
        title="SPORT, CULTURE, ACCRA."
        sub={(page as { intro?: string } | null)?.intro || 'Cue sports, Ghanaian music, food and culture — sport as a doorway into the city.'}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((b, i) => {
          const img = mediaUrl(b.image, 'card') || [IMG.hall, IMG.crowd, IMG.balls, IMG.room][i % 4]
          return (
            <Reveal key={i} delay={i * 0.08}>
              <div className="card-surface relative h-72 overflow-hidden">
                <ParallaxBg src={img} scrim="rgba(10,15,30,0.55)" />
                <div className="relative flex h-full flex-col justify-end p-6">
                  <h3 className="font-display text-2xl text-white">{b.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-white/75">{b.body}</p>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
      <Reveal className="mt-12 text-center">
        <TransitionLink href="/contact" className="btn-primary">Partner With Us</TransitionLink>
      </Reveal>
    </div>
  )
}
