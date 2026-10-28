import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/payload'
import { SectionHeading } from '@/components/site/SectionHeading'
import { PageHeader } from '@/components/site/PageHeader'
import { Reveal } from '@/components/anim/Reveal'
import { ContactForm } from './ContactForm'
import { waLink, waMessages } from '@/lib/whatsapp'

export const metadata: Metadata = { title: 'Contact' }

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <>
    <PageHeader title="Contact Us" crumbs={[{ label: 'Contact' }]} image="/media/img-04.jpg" />
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8">
      <SectionHeading eyebrow="Get in Touch" title="FIND US. CALL US. CHALLENGE US." />

      <div className="grid gap-12 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="space-y-8">
            <div>
              <h3 className="eyebrow mb-2">Location</h3>
              <p className="text-ink">{settings?.address || 'Accra, Ghana'}</p>
              <p className="text-muted">{settings?.city}</p>
            </div>
            <div>
              <h3 className="eyebrow mb-2">Phone / WhatsApp</h3>
              <p className="text-ink">{settings?.phone || '+233 55 000 0000'}</p>
              <a href={waLink(waMessages.general)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-semibold text-green-neon hover:underline">
                Message us on WhatsApp →
              </a>
            </div>
            <div>
              <h3 className="eyebrow mb-2">Email</h3>
              <p className="text-ink">{settings?.email || 'info@shotmasters.club'}</p>
            </div>
            <div>
              <h3 className="eyebrow mb-2">Hours</h3>
              <ul className="space-y-1 text-sm text-muted">
                {(settings?.openingHours ?? [{ days: 'Mon – Sun', hours: '10:00 – 23:00' }]).map((h, i) => (
                  <li key={i} className="flex gap-4"><span className="w-32">{h.days}</span><span className="text-ink">{h.hours}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-3">
          <div className="card-surface p-8">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
    </>
  )
}
