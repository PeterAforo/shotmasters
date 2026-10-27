'use client'

import dynamic from 'next/dynamic'

/** Lazy-loaded 3D snooker hero — keeps three.js out of the initial bundle. */
const SnookerPractice = dynamic(() => import('./SnookerPractice').then((m) => m.SnookerPractice), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="aspect-[2/1] w-full max-w-md animate-pulse rounded-lg border-8 border-[#3d2417] bg-felt" />
    </div>
  ),
})

export function HeroBallCanvas() {
  return (
    <div className="absolute inset-0">
      <SnookerPractice />
    </div>
  )
}
