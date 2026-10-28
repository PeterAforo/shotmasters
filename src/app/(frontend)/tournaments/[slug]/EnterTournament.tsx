'use client'

import { useState } from 'react'
import { formatGHS } from '@/lib/utils'

export function EnterTournament({ tournamentId, fee }: { tournamentId: number | string; fee: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function enter() {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/tournament-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tournamentId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(data.error || 'Could not enter')
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
        return
      }
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'done') {
    return <p className="font-semibold text-green-neon">✓ You&apos;re entered!</p>
  }

  return (
    <div>
      <button onClick={enter} disabled={state === 'loading'} className="btn-primary w-full justify-center disabled:opacity-50">
        {state === 'loading' ? 'Processing…' : fee > 0 ? `Enter — ${formatGHS(fee)}` : 'Enter Free'}
      </button>
      {error && <p className="mt-3 text-sm text-pink-neon">{error}</p>}
      {fee > 0 && <p className="mt-3 text-center text-[11px] text-muted">MoMo &amp; card accepted via Paystack</p>}
    </div>
  )
}
