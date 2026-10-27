'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

/** Scroll-parallax section background — image drifts ±8% as the section crosses the viewport. */
export function ParallaxBg({ src, scrim, className }: { src: string; scrim: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={src}
        alt=""
        className="absolute -top-[10%] h-[120%] w-full object-cover"
        style={reduced ? undefined : { y }}
      />
      <div className="absolute inset-0" style={{ background: scrim }} />
    </div>
  )
}
