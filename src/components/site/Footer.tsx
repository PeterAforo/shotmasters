import { waLink, waMessages } from '@/lib/whatsapp'
import { NewsletterForm } from '@/components/site/NewsletterForm'

type Settings = {
  clubName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  whatsappNumber?: string | null
  openingHours?: { days?: string | null; hours?: string | null }[] | null
  socials?: { platform?: string | null; url?: string | null }[] | null
}

export function Footer({ settings, navItems }: { settings: Settings | null; navItems: { label: string; href: string }[] }) {
  const name = settings?.clubName || 'Shot Masters Cue Club'
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a0f1e]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(70% 60% at 50% 100%, rgba(14,92,63,0.18), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt={name} className="h-16 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {settings?.address || 'Accra, Ghana'} — championship tables, cold drinks,
              and the finest cue sports community in the city.
            </p>
            {settings?.socials && settings.socials.length > 0 && (
              <div className="mt-6 flex gap-4">
                {settings.socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold uppercase tracking-widest text-white/60 transition-colors hover:text-cyan-neon"
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="eyebrow mb-5">Explore</h3>
            <ul className="space-y-3">
              {navItems.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Hours & Contact</h3>
            <ul className="space-y-2 text-sm text-white/60">
              {(settings?.openingHours ?? [{ days: 'Mon – Sun', hours: '10:00 – 23:00' }]).map((h, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{h.days}</span>
                  <span className="text-white">{h.hours}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 text-sm">
              {settings?.phone && <p className="text-white/60">{settings.phone}</p>}
              {settings?.email && <p className="text-white/60">{settings.email}</p>}
              <a
                href={waLink(waMessages.general)}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-semibold text-green-neon hover:underline"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3">
          <h3 className="eyebrow">Stay in the loop</h3>
          <NewsletterForm />
        </div>

        <div className="mt-16 overflow-hidden">
          <div className="select-none font-display text-[8.5vw] leading-[0.9] text-white/5 md:text-[6vw]">
            SHOT&nbsp;MASTERS<br />CUE&nbsp;CLUB
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {name}. All rights reserved.</span>
          <span className="flex gap-5">
            <a href="/privacy" className="transition-colors hover:text-white">Privacy Policy</a>
            <span>
              Developed by{' '}
              <a href="https://www.mcaforo.com" target="_blank" rel="noreferrer" className="font-semibold text-cyan-neon transition-colors hover:underline">
                McAforo
              </a>
            </span>
            <span>Accra · Ghana 🇬🇭</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
