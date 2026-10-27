'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const sp = useSearchParams()
  const next = sp.get('next') || '/account'

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const f = new FormData(e.currentTarget)
    try {
      const url = mode === 'login' ? '/api/members/login' : '/api/members'
      const body =
        mode === 'login'
          ? { email: f.get('email'), password: f.get('password') }
          : { email: f.get('email'), password: f.get('password'), name: f.get('name'), phone: f.get('phone') }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.errors?.[0]?.message || 'Failed')
      window.location.href = next
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Failed')
      setBusy(false)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === 'register' && (
          <>
            <input name="name" required className="input-field" placeholder="Full name" />
            <input name="phone" className="input-field" placeholder="Phone (e.g. 055…)" />
          </>
        )}
        <input name="email" type="email" required className="input-field" placeholder="Email" />
        <input name="password" type="password" required minLength={8} className="input-field" placeholder="Password (min 8 chars)" />
        {err && <p className="text-sm text-pink-neon">{err}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {busy ? 'One sec…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="mt-5 w-full text-center text-xs text-muted hover:text-cyan-neon"
      >
        {mode === 'login' ? 'New here? Create a free account' : 'Have an account? Sign in'}
      </button>
    </>
  )
}
