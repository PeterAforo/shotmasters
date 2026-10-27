'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { TransitionLink } from '@/components/anim/PageTransition'
import { Magnetic } from '@/components/anim/Magnetic'
import type { MenuItem } from '@/lib/navigation'

const linkClass = (active: boolean) =>
  `group relative text-[13px] font-medium uppercase tracking-[0.14em] transition-colors ${
    active ? 'text-white' : 'text-white/55 hover:text-white'
  }`

const underline = (active: boolean) =>
  `absolute -bottom-1.5 left-0 h-px bg-linear-to-r from-cyan-neon to-pink-neon transition-all duration-300 ${
    active ? 'w-full' : 'w-0 group-hover:w-full'
  }`

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <TransitionLink href={href} className={linkClass(active)}>
      {label}
      <span className={underline(active)} />
    </TransitionLink>
  )
}

function Dropdown({ label, children, anyActive }: { label: string; children: { label: string; href: string }[]; anyActive: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={`${linkClass(anyActive)} flex items-center gap-1.5`}
      >
        {label}
        <svg className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className={underline(anyActive)} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full mt-4 w-52 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111a33] p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
          >
            {children.map((c) => (
              <TransitionLink
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-[13px] font-medium uppercase tracking-[0.12em] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {c.label}
              </TransitionLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Header({ navItems, cta }: { navItems: MenuItem[]; cta: { label: string; href: string } }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const pathname = usePathname()
  const { scrollY } = useScroll()
  // logo lives outside the nav row — shrinks smoothly 1 → 0.32 over first 300px.
  // On inner pages it's compact immediately (the big float is a home-hero feature).
  const isHome = pathname === '/'
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.32])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false); setOpenGroup(null) }, [pathname])

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <>
      {/* floating logo — aligned to the content container, floats over the hero, shrinks on scroll */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.a
            href="/"
            className="group pointer-events-auto inline-block"
            style={{ scale: isHome ? logoScale : 0.32, transformOrigin: 'top left' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="Shot Masters Cue Club"
              className="h-32 w-auto transition-transform duration-300 group-hover:rotate-[-3deg] lg:h-40"
            />
          </motion.a>
        </div>
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#0a0f1e]/90 backdrop-blur-xl' : 'bg-linear-to-b from-[#0a0f1e]/60 to-transparent'
        }`}
      >
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-end gap-8 px-5 sm:px-8">

          <nav className="hidden items-center gap-8 xl:flex">
            {navItems.map((item) =>
              'children' in item ? (
                <Dropdown
                  key={item.label}
                  label={item.label}
                  children={item.children}
                  anyActive={item.children.some((c) => isActive(c.href))}
                />
              ) : (
                <NavLink key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />
              ),
            )}
          </nav>

          <div className="hidden xl:block">
            <Magnetic strength={0.25}>
              <TransitionLink href={cta.href} className="btn-primary">
                {cta.label}
              </TransitionLink>
            </Magnetic>
          </div>

          <button
            className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-[5px] xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#0a0f1e]/97 px-8 pb-10 pt-40 backdrop-blur-2xl xl:hidden"
          >
            <nav className="flex flex-col gap-6">
              {navItems.map((item) =>
                'children' in item ? (
                  <div key={item.label}>
                    <button
                      onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                      aria-expanded={openGroup === item.label}
                      className="flex w-full items-center justify-between font-display text-3xl text-white"
                    >
                      {item.label}
                      <svg className={`h-5 w-5 transition-transform ${openGroup === item.label ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {openGroup === item.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex flex-col gap-3 border-l-2 border-white/15 pl-5">
                            {item.children.map((c) => (
                              <TransitionLink key={c.href} href={c.href} className="text-lg font-semibold text-white/60 hover:text-white">
                                {c.label}
                              </TransitionLink>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    className={`font-display text-3xl ${isActive(item.href) ? 'text-cyan-neon' : 'text-white'}`}
                  >
                    {item.label}
                  </TransitionLink>
                ),
              )}
              <TransitionLink href={cta.href} className="btn-primary mt-4 w-max">
                {cta.label}
              </TransitionLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
