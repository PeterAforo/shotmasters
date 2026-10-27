'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function Counter({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ref.current.textContent = `${value}${suffix}`
      return
    }
    gsap.registerPlugin(ScrollTrigger)
    const obj = { v: 0 }
    const tween = gsap.to(obj, {
      v: value,
      duration: 1.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      onUpdate: () => {
        if (ref.current) ref.current.textContent = `${Math.round(obj.v)}${suffix}`
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [value, suffix])

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}
