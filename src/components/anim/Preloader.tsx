'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export function Preloader() {
  // Always mounted on first render (server + client markup identical → no hydration
  // mismatch); the session check + exit happen in an effect.
  const [exited, setExited] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('smcc-seen') === '1') {
      setExited(true)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.style.overflow = 'hidden'

    const finish = () => {
      sessionStorage.setItem('smcc-seen', '1')
      document.documentElement.style.overflow = ''
      setExited(true)
    }

    if (reduced) {
      finish()
      return
    }

    const counter = { v: 0 }
    const tl = gsap.timeline()
    tl.fromTo(
      logoRef.current,
      { scale: 0.6, opacity: 0, rotate: -8 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.8)' },
    )
      .to(
        counter,
        {
          v: 100,
          duration: 1.7,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counterRef.current) counterRef.current.textContent = String(Math.round(counter.v))
            if (barRef.current) barRef.current.style.transform = `scaleX(${counter.v / 100})`
          },
        },
        '-=0.3',
      )
      .to(logoRef.current, { scale: 1.06, duration: 0.35, ease: 'power2.out' })
      .to(rootRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.8,
        ease: 'power4.inOut',
        onComplete: finish,
      })

    return () => {
      tl.kill()
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (exited) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#04060d]"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(#1c2644 1px, transparent 1px), linear-gradient(90deg, #1c2644 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 45%, rgba(34,211,238,0.12), transparent 70%)',
        }}
      />
      <div ref={logoRef} className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="Shot Masters Cue Club" className="w-44 sm:w-60" />
      </div>
      <div className="relative mt-10 w-56 sm:w-72">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            ref={barRef}
            className="h-full w-full origin-left"
            style={{
              transform: 'scaleX(0)',
              background:
                'linear-gradient(90deg, #22d3ee, #4ade80, #fbbf24, #f472b6, #fb923c)',
            }}
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between text-xs uppercase tracking-[0.3em] text-white/50">
          <span>Racking up</span>
          <span className="font-display text-2xl tracking-normal text-white">
            <span ref={counterRef}>0</span>%
          </span>
        </div>
      </div>
    </div>
  )
}
