import type { Metadata } from 'next'
import { SectionHeading } from '@/components/site/SectionHeading'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8">
      <SectionHeading eyebrow="Legal" title="PRIVACY POLICY" sub="How Shot Masters Cue Club handles your information" />
      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>Shot Masters Cue Club (SMCC) collects only the information needed to operate the club and this website.</p>
        <h3 className="font-display text-xl text-ink">WHAT WE COLLECT</h3>
        <p>Contact details you submit (name, email, message, enquiry subject); member account details; booking and payment references processed via our payment partner (Paystack); basic site-usage information.</p>
        <h3 className="font-display text-xl text-ink">HOW WE USE IT</h3>
        <p>To respond to enquiries, manage memberships and bookings, process payments, send club communications you ask for, and improve the website. We do not sell your information.</p>
        <h3 className="font-display text-xl text-ink">STORAGE & SHARING</h3>
        <p>Data is stored on secure infrastructure (database hosted on Neon; media on Cloudinary; email via Resend; payments via Paystack). Only authorised club officers access member data.</p>
        <h3 className="font-display text-xl text-ink">YOUR CHOICES</h3>
        <p>You may request a copy, correction or deletion of your personal data at any time via the club email or contact form.</p>
        <h3 className="font-display text-xl text-ink">CONTACT</h3>
        <p>Questions about this policy: reach us through the <a href="/contact" className="text-cyan-neon underline">contact page</a>.</p>
      </div>
    </div>
  )
}
