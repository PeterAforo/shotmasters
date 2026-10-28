'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const TransitionContext = createContext<{ navigate: (href: string) => void }>({
  navigate: () => {},
})

export const useTransitionNavigate = () => useContext(TransitionContext)

const EASE = [0.76, 0, 0.24, 1] as const
const WIPE_BG =
  'linear-gradient(120deg, #0a0f1e 60%, #111a33), repeating-linear-gradient(90deg, transparent 0 46px, rgba(34,211,238,0.05) 46px 48px)'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  // 'idle' | 'cover' | 'reveal' — one overlay stays mounted across both phases
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle')
  const pendingHref = useRef<string | null>(null)
  const firstMount = useRef(true)

  const navigate = useCallback(
    (href: string) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href)
        return
      }
      pendingHref.current = href
      setPhase('cover')
    },
    [router],
  )

  // New page mounted → flip the same overlay to reveal
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false
      return
    }
    setPhase((p) => (p === 'cover' ? 'reveal' : p))
  }, [pathname])

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            key="wipe"
            className="fixed inset-0 z-[90]"
            style={{ background: WIPE_BG }}
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={
              phase === 'cover'
                ? { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.5, ease: EASE } }
                : { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.6, ease: EASE, delay: 0.05 } }
            }
            onAnimationComplete={() => {
              if (phase === 'cover') {
                if (pendingHref.current) {
                  router.push(pendingHref.current)
                  pendingHref.current = null
                } else {
                  setPhase('reveal')
                }
              } else {
                setPhase('idle')
              }
            }}
          >
            <div className="flex h-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="" className="w-36 opacity-40 sm:w-48" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  )
}

export function TransitionLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
}) {
  const { navigate } = useTransitionNavigate()
  const pathname = usePathname()

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
        if (href === pathname) return
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) {
          window.location.href = href
          return
        }
        navigate(href)
      }}
    >
      {children}
    </a>
  )
}
