'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TransitionLink } from '@/components/anim/PageTransition'
import { Magnetic } from '@/components/anim/Magnetic'

type Slide = {
  headline?: string | null
  subtext?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  image?: unknown
}

const DEFAULT_SLIDES: Required<Omit<Slide, 'image'>>[] = [
  {
    headline: 'WHERE LEGENDS',
    subtext: 'Championship snooker in the heart of Accra.',
    ctaLabel: 'Book a Table',
    ctaHref: '/book',
  },
  {
    headline: 'BREAK LIKE A MASTER',
    subtext: 'Weekly tournaments. Real competition. Real glory.',
    ctaLabel: 'See Tournaments',
    ctaHref: '/tournaments',
  },
  {
    headline: 'JOIN THE CLUB',
    subtext: 'Members get priority tables, rates & perks.',
    ctaLabel: 'Membership',
    ctaHref: '/membership',
  },
]

const headlineVariants = {
  enter: { y: '110%', opacity: 0, skewY: 4 },
  center: {
    y: '0%',
    opacity: 1,
    skewY: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { y: '-110%', opacity: 0, skewY: -4, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const } },
}

export function HeroSlider({ slides }: { slides?: Slide[] | null }) {
  const items = (slides?.length ? slides : DEFAULT_SLIDES) as Slide[]
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length])

  useEffect(() => {
    if (paused || items.length <= 1) return
    timer.current = setInterval(next, 6000)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [next, paused, items.length])

  const slide = items[index]

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="w-full">
        <p className="eyebrow mb-6">People · Play · Passion</p>
        <AnimatePresence mode="wait">
          <motion.div key={index} className="overflow-hidden">
            <motion.h1
              variants={headlineVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="font-display text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl"
            >
              {slide?.headline}
            </motion.h1>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.6 } }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
            className="mt-4 max-w-lg text-lg text-white/60"
          >
            {slide?.subtext}
          </motion.p>
        </AnimatePresence>

        <motion.div
          className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          {slide?.ctaHref && (
            <Magnetic>
              <TransitionLink href={slide.ctaHref} className="btn-primary">
                {slide.ctaLabel || 'Book a Table'}
              </TransitionLink>
            </Magnetic>
          )}
          <Magnetic strength={0.25}>
            <TransitionLink href="/leaderboard" className="btn-ghost">
              View Leaderboard
            </TransitionLink>
          </Magnetic>
        </motion.div>

        {/* slide progress dots */}
        <div className="pointer-events-auto mt-12 flex items-center gap-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className="group relative h-1 w-12 overflow-hidden rounded-full bg-white/15"
            >
              <span
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  i === index ? 'w-full bg-linear-to-r from-cyan-neon to-pink-neon' : i < index ? 'w-full bg-white/30' : 'w-0'
                }`}
              />
            </button>
          ))}
          <span className="ml-3 font-display text-sm text-white/50">
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}
