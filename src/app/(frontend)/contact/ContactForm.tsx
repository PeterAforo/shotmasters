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
        subject: form.get('subject'),
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
        <label className="eyebrow mb-2 block">Subject</label>
        <select name="subject" required className="input-field" defaultValue="">
          <option value="" disabled>Choose a topic…</option>
          <option value="general">General enquiry</option>
          <option value="membership">Membership</option>
          <option value="events">Events & registration</option>
          <option value="sponsorship">Sponsorship & partnerships</option>
        </select>
      </div>
      <div>
        <label className="eyebrow mb-2 block">Message</label>
        <textarea name="message" required rows={5} className="input-field" placeholder="What's on your mind?" />
      </div>
      <label className="flex items-start gap-3 text-xs text-muted">
        <input type="checkbox" required className="mt-0.5 accent-[#2563eb]" />
        I consent to SMCC storing my details to respond to this enquiry.
      </label>
      {status === 'error' && <p className="text-sm text-pink-neon">Something went wrong — try WhatsApp instead.</p>}
      <button type="submit" disabled={status === 'sending'} className="btn-primary disabled:opacity-50">
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
