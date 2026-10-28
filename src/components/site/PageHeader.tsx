import { Fragment } from 'react'
import { ParallaxBg } from '@/components/anim/ParallaxBg'
import { Reveal } from '@/components/anim/Reveal'
import { TransitionLink } from '@/components/anim/PageTransition'

export type Crumb = { label: string; href?: string }

const OVERLAY =
  'linear-gradient(180deg, rgba(10,15,30,0.88) 0%, rgba(10,15,30,0.55) 45%, rgba(10,15,30,0.92) 100%), radial-gradient(60% 80% at 15% 100%, rgba(37,99,235,0.28), transparent 70%)'

/** Inner-page hero: background photo + overlay, title and breadcrumbs. Sits behind the fixed navbar. */
export function PageHeader({
  title,
  crumbs,
  image,
  sub,
}: {
  title: string
  crumbs: Crumb[]
  image: string
  sub?: string
}) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...crumbs]

  return (
    <section className="relative overflow-hidden bg-[#0a0f1e]">
      <ParallaxBg src={image} scrim={OVERLAY} />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-40 sm:px-8 lg:pb-20 lg:pt-48">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              {trail.map((c, i) => {
                const last = i === trail.length - 1
                return (
                  <Fragment key={`${c.label}-${i}`}>
                    <li>
                      {last ? (
                        <span aria-current="page" className="text-cyan-neon">{c.label}</span>
                      ) : c.href ? (
                        <TransitionLink href={c.href} className="transition-colors hover:text-white">{c.label}</TransitionLink>
                      ) : (
                        <span>{c.label}</span>
                      )}
                    </li>
                    {!last && <li aria-hidden className="text-white/30">/</li>}
                  </Fragment>
                )
              })}
            </ol>
          </nav>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">{title}</h1>
          {sub && <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">{sub}</p>}
        </Reveal>
      </div>
    </section>
  )
}
