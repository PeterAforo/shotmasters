'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatGHS } from '@/lib/utils'

type Table = {
  id: number | string
  name: string
  type: string
  hourlyRate: number
  depositAmount: number
  image: string | null
}

type Slot = { time: string; available: boolean; state: string }

const stepVariants = {
  enter: { opacity: 0, x: 40, filter: 'blur(4px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, x: -40, filter: 'blur(4px)', transition: { duration: 0.3 } },
}

const STEPS = ['Table', 'Date & Time', 'Confirm']

export function BookingFlow({ tables }: { tables: Table[] }) {
  const [step, setStep] = useState(0)
  const [table, setTable] = useState<Table | null>(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [slot, setSlot] = useState('')
  const [hours, setHours] = useState(1)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [member, setMember] = useState<{ id: number; email: string; name?: string } | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  // auth check
  useEffect(() => {
    fetch('/api/members/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMember(d?.user ?? null))
      .catch(() => setMember(null))
  }, [])

  const days = useMemo(() => {
    const out: { key: string; label: string; weekday: string }[] = []
    for (let i = 0; i < 14; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      out.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        weekday: i === 0 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' }),
      })
    }
    return out
  }, [])

  useEffect(() => {
    if (!table || !date) return
    setLoadingSlots(true)
    setSlot('')
    fetch(`/api/availability?table=${table.id}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .finally(() => setLoadingSlots(false))
  }, [table, date])

  const total = table ? table.hourlyRate * hours : 0

  const pay = useCallback(async () => {
    if (!table || !slot) return
    setPaying(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tableId: table.id, date, startTime: slot, durationHours: hours }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
        return
      }
      window.location.href = `/book/confirmed?booking=${data.bookingId}&dev=1`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed to start')
      setPaying(false)
    }
  }, [table, slot, date, hours])

  return (
    <div className="card-surface overflow-hidden">
      {/* stepper */}
      <div className="flex border-b border-line">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 px-4 py-4 text-center text-[11px] font-bold uppercase tracking-widest transition-colors ${
              i === step ? 'text-cyan-neon' : i < step ? 'text-green-neon' : 'text-muted'
            }`}
          >
            <span className="mr-2 font-display">{i + 1}</span>
            <span className="hidden sm:inline">{s}</span>
          </div>
        ))}
        <div className="absolute h-px w-full" />
      </div>

      <div className="relative min-h-[420px] p-6 sm:p-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTable(t)
                      setStep(1)
                    }}
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                      table?.id === t.id
                        ? 'border-cyan-neon bg-cyan-neon/10'
                        : 'border-line bg-surface hover:border-cyan-neon/50 hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-neon">{t.type}</span>
                      <span className="text-sm font-bold text-gold">{formatGHS(t.hourlyRate)}/hr</span>
                    </div>
                    <div className="mt-3 font-display text-2xl text-ink">{t.name}</div>
                    <div className="mt-2 text-xs text-muted">Deposit {formatGHS(t.depositAmount)}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && table && (
            <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <div className="mb-6 flex items-center justify-between">
                <button onClick={() => setStep(0)} className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-ink">
                  ← {table.name} · {formatGHS(table.hourlyRate)}/hr
                </button>
              </div>

              <h3 className="eyebrow mb-3">Pick a day</h3>
              <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {days.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDate(d.key)}
                    className={`w-20 shrink-0 rounded-xl border px-3 py-3 text-center transition-all ${
                      date === d.key ? 'border-cyan-neon bg-cyan-neon/10 text-ink' : 'border-line bg-surface text-muted hover:border-cyan-neon/40'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider">{d.weekday}</div>
                    <div className="font-display text-sm">{d.label}</div>
                  </button>
                ))}
              </div>

              {date && (
                <>
                  <h3 className="eyebrow mb-3 mt-8">Pick a start time</h3>
                  {loadingSlots ? (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {Array.from({ length: 13 }).map((_, i) => (
                        <div key={i} className="h-11 animate-pulse rounded-lg bg-surface-2" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {slots.map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setSlot(s.time)}
                          className={`rounded-lg border px-2 py-2.5 font-display text-sm transition-all ${
                            slot === s.time
                              ? 'border-cyan-neon bg-cyan-neon text-paper'
                              : s.available
                                ? 'border-line bg-surface text-ink hover:border-cyan-neon/50'
                                : 'cursor-not-allowed border-line/50 bg-surface/40 text-muted/40 line-through'
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {slot && (
                <>
                  <h3 className="eyebrow mb-3 mt-8">Duration</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((h) => (
                      <button
                        key={h}
                        onClick={() => setHours(h)}
                        className={`rounded-lg border px-5 py-2.5 font-display text-sm transition-all ${
                          hours === h ? 'border-cyan-neon bg-cyan-neon text-paper' : 'border-line bg-surface text-ink hover:border-cyan-neon/50'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={() => setStep(2)} className="btn-primary">
                      Continue — {formatGHS(total)}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && table && (
            <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit">
              <button onClick={() => setStep(1)} className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted hover:text-ink">
                ← Change time
              </button>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="eyebrow mb-4">Summary</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between"><dt className="text-muted">Table</dt><dd className="text-ink">{table.name}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Date</dt><dd className="text-ink">{date}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Time</dt><dd className="text-ink">{slot} · {hours}h</dd></div>
                    <div className="flex justify-between border-t border-line pt-3"><dt className="text-muted">Session total</dt><dd className="font-display text-lg text-ink">{formatGHS(total)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Deposit due now</dt><dd className="font-display text-lg text-cyan-neon">{formatGHS(table.depositAmount)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Balance at club</dt><dd className="text-ink">{formatGHS(total - table.depositAmount)}</dd></div>
                  </dl>
                </div>

                <div>
                  {member === undefined ? (
                    <div className="h-40 animate-pulse rounded-xl bg-surface-2" />
                  ) : member ? (
                    <div>
                      <h3 className="eyebrow mb-4">Paying as</h3>
                      <p className="font-semibold text-ink">{member.name || member.email}</p>
                      <p className="text-sm text-muted">{member.email}</p>
                      <button onClick={pay} disabled={paying} className="btn-primary mt-6 w-full justify-center disabled:opacity-50">
                        {paying ? 'Opening Paystack…' : `Pay Deposit — ${formatGHS(table.depositAmount)}`}
                      </button>
                      <p className="mt-3 text-center text-[11px] text-muted">MoMo &amp; card accepted via Paystack</p>
                    </div>
                  ) : (
                    <InlineAuth onAuthed={(m) => setMember(m)} />
                  )}
                  {error && <p className="mt-4 text-sm text-pink-neon">{error}</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function InlineAuth({ onAuthed }: { onAuthed: (m: { id: number; email: string; name?: string }) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const f = new FormData(e.currentTarget)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: f.get('email'), password: f.get('password'), name: f.get('name'), phone: f.get('phone') }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.errors?.[0]?.message || 'Registration failed')
        onAuthed(data.doc)
        return
      }
      const res = await fetch('/api/members/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.errors?.[0]?.message || 'Login failed')
      onAuthed(data.user)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h3 className="eyebrow mb-4">Sign in to pay</h3>
      <form onSubmit={submit} className="space-y-4">
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
          {busy ? 'One sec…' : mode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}
        </button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="mt-4 w-full text-center text-xs text-muted hover:text-cyan-neon">
        {mode === 'login' ? 'New here? Create a free account' : 'Have an account? Sign in'}
      </button>
    </div>
  )
}
