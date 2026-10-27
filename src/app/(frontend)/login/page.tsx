import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from './AuthForm'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 pb-24 pt-36 sm:px-8">
      <div className="card-surface p-8">
        <h1 className="font-display text-4xl text-ink">MEMBER<br />SIGN IN</h1>
        <p className="mt-3 text-sm text-muted">Access bookings, tournaments and your membership.</p>
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}
