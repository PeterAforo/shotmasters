import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from './AuthForm'
import { PageHeader } from '@/components/site/PageHeader'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <>
      <PageHeader title="Member Sign In" crumbs={[{ label: 'Sign In' }]} image="/media/img-04.jpg" />
      <div className="mx-auto max-w-md px-5 pb-24 pt-16 sm:px-8">
        <div className="card-surface p-8">
          <h2 className="font-display text-3xl text-ink">WELCOME BACK</h2>
          <p className="mt-3 text-sm text-muted">Access bookings, tournaments and your membership.</p>
          <Suspense>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </>
  )
}
