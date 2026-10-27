'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Newsletter signup',
        email: form.get('email'),
        subject: 'newsletter',
        message: 'Please add me to the SMCC newsletter list.',
        website: form.get('website'),
      }),
    })
    setStatus(res.ok ? 'done' : 'error')
  }

  if (status === 'done') {
    return <p className="text-sm font-semibold text-green-neon">You&apos;re on the list — see you at the table.</p>
  }

  return (
    <form onSubmit={onSubmit} className="relative flex max-w-sm gap-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input
        name="email"
        type="email"
        required
        placeholder="you@email.com"
        className="h-11 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-white/40 focus:border-cyan-neon focus:outline-none"
      />
      <button type="submit" disabled={status === 'sending'} className="btn-primary h-11 px-5 text-xs disabled:opacity-50">
        {status === 'sending' ? '…' : 'Join'}
      </button>
      {status === 'error' && <p className="absolute -bottom-6 left-0 text-xs text-pink-neon">Try again — or message us on WhatsApp.</p>}
    </form>
  )
}
