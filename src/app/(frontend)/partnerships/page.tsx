import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'
import { ParallaxBg } from '@/components/anim/ParallaxBg'
import { IMG } from '@/lib/imagery'

export const metadata: Metadata = { title: 'Partnerships' }
export const revalidate = 60

const FALLBACK_OPS = [
  { title: 'Tournament Visibility', body: 'Put your brand in front of players and fans at our events — banners, naming rights and on-table presence.' },
  { title: 'Grassroots Engagement', body: 'Support the growth of cue sports in Ghana through coaching clinics, school outreach and community play.' },
  { title: 'Cultural Tourism', body: 'Tie into December in GH and Accra\u2019s sports-tourism story through our festival and club events.' },
]

export default async function PartnershipsPage() {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({ slug: 'partnerships-page' }).catch(() => null)
  const ops = (page as { opportunities?: { title?: string; body?: string }[]; enquiryEmail?: string } | null)?.opportunities
  const items = ops?.length ? ops : FALLBACK_OPS

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <SectionHeading
        eyebrow="Partnerships"
        title="PARTNER WITH SMCC"
        sub={(page as { intro?: string } | null)?.intro || 'Tournament visibility, grassroots engagement and cultural tourism — partner with Ghana\u2019s cue-sports community.'}
      />
      <div className="relative overflow-hidden rounded-2xl">
        <ParallaxBg src={IMG.hall} scrim="rgba(10,15,30,0.6)" />
        <div className="relative grid gap-6 p-8 md:grid-cols-3 md:p-12">
          {items.map((o, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="card-surface h-full bg-surface/95 p-6">
                <h3 className="font-display text-xl text-ink">{o.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{o.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal className="mt-12 flex flex-wrap justify-center gap-4">
        <TransitionLink href="/contact" className="btn-primary">Sponsorship Enquiry</TransitionLink>
        <TransitionLink href="/membership" className="btn-ghost">Join the Club</TransitionLink>
      </Reveal>
    </div>
  )
}
