'use client'

import { useState } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        message: form.get('message'),
      }),
    })
    setStatus(res.ok ? 'sent' : 'error')
  }

  if (status === 'sent') {
    return (
      <div className="py-10 text-center">
        <div className="font-display text-3xl text-green-neon">MESSAGE SENT</div>
        <p className="mt-3 text-muted">We&apos;ll get back to you within a day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="eyebrow mb-2 block">Name</label>
        <input name="name" required className="input-field" placeholder="Your name" />
      </div>
      <div>
        <label className="eyebrow mb-2 block">Email</label>
        <input name="email" type="email" required className="input-field" placeholder="you@email.com" />
      </div>
      <div>
        <label className="eyebrow mb-2 block">Message</label>
        <textarea name="message" required rows={5} className="input-field" placeholder="What's on your mind?" />
      </div>
      {status === 'error' && <p className="text-sm text-pink-neon">Something went wrong — try WhatsApp instead.</p>}
      <button type="submit" disabled={status === 'sending'} className="btn-primary disabled:opacity-50">
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
