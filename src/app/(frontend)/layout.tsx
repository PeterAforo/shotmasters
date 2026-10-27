import type { Metadata } from 'next'
import { Anton, Space_Grotesk } from 'next/font/google'
import './globals.css'

import { getNavigation, getSiteSettings } from '@/lib/payload'
import { normalizeNav, flattenNav } from '@/lib/navigation'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'
import { Preloader } from '@/components/anim/Preloader'
import { SmoothScroll } from '@/components/anim/SmoothScroll'
import { PageTransition } from '@/components/anim/PageTransition'

const anton = Anton({ weight: '400', variable: '--font-anton', subsets: ['latin'] })
const grotesk = Space_Grotesk({ variable: '--font-grotesk', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Shot Masters Cue Club — Accra',
    template: '%s — Shot Masters Cue Club',
  },
  description:
    'Accra’s premier snooker & pool club. Championship tables, tournaments, memberships and good company.',
  icons: { icon: '/brand/logo.png' },
}

const FALLBACK_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Book a Table', href: '/book' },
  { label: 'The Club', children: [
    { label: 'Membership', href: '/membership' },
    { label: 'Tournaments', href: '/tournaments' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ]},
  { label: 'News', href: '/news' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default async function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [nav, settings] = await Promise.all([
    getNavigation().catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  const navItems = normalizeNav(nav?.navItems ?? null, FALLBACK_NAV)
  const footerNav = flattenNav(navItems)

  return (
    <html lang="en" className={`${anton.variable} ${grotesk.variable}`}>
      <body className="antialiased">
        <Preloader />
        <SmoothScroll>
          <PageTransition>
            <Header
              navItems={navItems}
              cta={{ label: nav?.ctaLabel || 'Book a Table', href: nav?.ctaHref || '/book' }}
            />
            <main>{children}</main>
            <Footer settings={settings} navItems={footerNav} />
            <WhatsAppButton />
          </PageTransition>
        </SmoothScroll>
      </body>
    </html>
  )
}
