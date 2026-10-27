import { TransitionLink } from '@/components/anim/PageTransition'

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
      <div className="font-display text-[28vw] leading-none text-surface-2 sm:text-[16rem]">404</div>
      <p className="mt-2 text-muted">That shot went wide — the page you want isn&apos;t here.</p>
      <TransitionLink href="/" className="btn-primary mt-8">Back to the Tables</TransitionLink>
    </div>
  )
}
