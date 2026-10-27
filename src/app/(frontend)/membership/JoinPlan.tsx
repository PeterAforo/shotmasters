'use client'

import { useState } from 'react'
import { formatGHS } from '@/lib/utils'

export function JoinPlan({ planId, planName, price }: { planId: number | string; planName: string; price: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  async function join() {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login?next=/membership'
          return
        }
        throw new Error(data.error || 'Could not start checkout')
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
        return
      }
      if (data.devConfirmed) {
        window.location.href = '/membership?confirmed=1'
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  return (
    <div>
      <button onClick={join} disabled={state === 'loading'} className="btn-primary w-full justify-center disabled:opacity-50">
        {state === 'loading' ? 'Starting…' : `Join ${planName} — ${formatGHS(price)}`}
      </button>
      {error && <p className="mt-3 text-sm text-pink-neon">{error}</p>}
    </div>
  )
}
