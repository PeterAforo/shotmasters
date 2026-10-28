import { TransitionLink } from '@/components/anim/PageTransition'
import { PageHeader } from '@/components/site/PageHeader'

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page Not Found" crumbs={[{ label: '404' }]} image="/media/img-03.jpg" />
      <div className="flex flex-col items-center justify-center px-5 pb-24 pt-12 text-center">
        <div className="font-display text-[28vw] leading-none text-surface-2 sm:text-[16rem]">404</div>
        <p className="mt-2 text-muted">That shot went wide — the page you want isn&apos;t here.</p>
        <TransitionLink href="/" className="btn-primary mt-8">Back to the Tables</TransitionLink>
      </div>
    </>
  )
}
