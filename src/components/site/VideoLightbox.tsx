'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

export function VideoLightbox({ poster, src, alt }: { poster: string; src: string; alt: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border-4 border-paper text-left shadow-[0_30px_60px_-20px_rgba(10,15,30,0.45)]"
        aria-label={`Play video: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt={alt} className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute inset-0 flex items-center justify-center bg-night/30">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </span>
      </button>

      {mounted && createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-night/85 p-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl"
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <video src={src} controls autoPlay playsInline className="aspect-video w-full bg-black" />
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-night/70 text-white transition hover:bg-night"
                aria-label="Close video"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" /></svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  )
}
