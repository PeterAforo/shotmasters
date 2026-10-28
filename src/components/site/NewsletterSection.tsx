import { Reveal } from '@/components/anim/Reveal'
import { NewsletterForm } from '@/components/site/NewsletterForm'

export function NewsletterSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1e]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 90% at 20% 50%, rgba(37,99,235,0.16), transparent 65%), radial-gradient(40% 60% at 85% 30%, rgba(180,83,9,0.12), transparent 60%)',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-neon" />
            Newsletter
          </span>
          <h2 className="mt-6 font-display text-5xl leading-[0.98] text-white sm:text-6xl">
            NEVER MISS<br />
            <span className="text-cyan-neon">THE BREAK</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-sm leading-relaxed text-white/70">
            Tournament draws, member nights, festival announcements and club news —
            straight to your inbox. No spam, ever.
          </p>
          <div className="mt-6 [&>form]:max-w-none">
            <NewsletterForm />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
