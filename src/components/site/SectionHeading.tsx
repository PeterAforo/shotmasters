import { Reveal } from '@/components/anim/Reveal'

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'left',
  tone = 'light',
}: {
  eyebrow: string
  title: string
  sub?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
}) {
  const dark = tone === 'dark'
  return (
    <Reveal className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}>
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className={`font-display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl ${dark ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 max-w-xl ${dark ? 'text-white/60' : 'text-muted'} ${align === 'center' ? 'mx-auto' : ''}`}>{sub}</p>
      )}
    </Reveal>
  )
}
