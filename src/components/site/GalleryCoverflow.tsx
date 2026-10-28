'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TransitionLink } from '@/components/anim/PageTransition'
import { VideoModal } from '@/components/site/VideoLightbox'

export type CoverflowSlide = {
  id: string
  src: string
  title: string
  category: string
  video?: string
}

// visual slot for a slide's distance from the centre (0 = centre)
const SLOTS: Record<number, { x: string; scale: number; z: number; opacity: number }> = {
  0: { x: '0%', scale: 1, z: 30, opacity: 1 },
  1: { x: '68%', scale: 0.82, z: 20, opacity: 1 },
  2: { x: '122%', scale: 0.66, z: 10, opacity: 0.85 },
}

export function GalleryCoverflow({ slides }: { slides: CoverflowSlide[] }) {
  const categories = useMemo(() => ['All', ...Array.from(new Set(slides.map((s) => s.category)))], [slides])
  const [filter, setFilter] = useState('All')
  const [active, setActive] = useState(0)
  const [video, setVideo] = useState<string | null>(null)

  const visible = useMemo(() => (filter === 'All' ? slides : slides.filter((s) => s.category === filter)), [slides, filter])
  const n = visible.length

  const go = useCallback((dir: number) => setActive((a) => (a + dir + n) % n), [n])

  useEffect(() => setActive(Math.floor(visible.length / 2)), [visible.length, filter])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (video) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, video])

  // signed shortest distance from the active slide, wrapping around
  const offsetOf = (i: number) => {
    let d = i - active
    if (d > n / 2) d -= n
    if (d < -n / 2) d += n
    return d
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
              filter === c ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
            }`}
          >
            {c}
          </button>
        ))}
        <TransitionLink
          href="/gallery"
          className="inline-flex items-center gap-2 border border-ink px-5 py-2 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-white"
        >
          View More <span aria-hidden>→</span>
        </TransitionLink>
      </div>

      <motion.div
        className="relative mx-auto mt-14 h-[380px] w-full overflow-hidden sm:h-[460px]"
        onPanEnd={(_, info) => {
          if (info.offset.x < -60) go(1)
          else if (info.offset.x > 60) go(-1)
        }}
      >
        {visible.map((s, i) => {
          const d = offsetOf(i)
          const slot = SLOTS[Math.abs(d)]
          const isCentre = d === 0
          return (
            <motion.button
              key={s.id}
              type="button"
              aria-label={isCentre && s.video ? `Play ${s.title}` : s.title}
              onClick={() => (isCentre ? s.video && setVideo(s.video) : go(d))}
              className="absolute left-1/2 top-1/2 h-[320px] w-[min(280px,62vw)] cursor-pointer overflow-hidden shadow-[0_30px_60px_-25px_rgba(10,15,30,0.55)] sm:h-[400px] sm:w-[320px]"
              initial={false}
              animate={
                slot
                  ? { x: `calc(-50% + ${d < 0 ? '-' : ''}${slot.x})`, y: '-50%', scale: slot.scale, opacity: slot.opacity, zIndex: slot.z }
                  : { x: `calc(-50% + ${d < 0 ? '-' : ''}170%)`, y: '-50%', scale: 0.5, opacity: 0, zIndex: 0 }
              }
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              style={{ pointerEvents: slot ? 'auto' : 'none' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.title} draggable={false} className="h-full w-full select-none object-cover" />
              <span
                className={`absolute inset-0 bg-night/30 transition-opacity duration-500 ${isCentre ? 'opacity-0' : 'opacity-100'}`}
              />
              {s.video && (
                <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-ink"><path d="M8 5v14l11-7z" /></svg>
                </span>
              )}
              {isCentre && (
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-night/80 to-transparent p-5 text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-white/70">{s.category}</span>
                  <span className="mt-1 block font-display text-lg text-white">{s.title}</span>
                </span>
              )}
            </motion.button>
          )
        })}
      </motion.div>

      <div className="mt-10 flex justify-center gap-3">
        {[
          { dir: -1, label: 'Previous', path: 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4-4.6-4.6z' },
          { dir: 1, label: 'Next', path: 'M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z' },
        ].map((b) => (
          <button
            key={b.label}
            onClick={() => go(b.dir)}
            aria-label={b.label}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-ink text-ink transition-colors hover:bg-ink hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d={b.path} /></svg>
          </button>
        ))}
      </div>

      <VideoModal src={video} open={!!video} onClose={() => setVideo(null)} />
    </div>
  )
}
