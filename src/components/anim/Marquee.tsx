'use client'

export function Marquee({ text, className }: { text: string; className?: string }) {
  const items = Array.from({ length: 6 }, () => text)
  return (
    <div className={`overflow-hidden border-y border-[#b45309]/30 bg-[#e8b91e] py-4 ${className ?? ''}`}>
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="mx-6 font-display text-lg tracking-wider text-[#101528] sm:text-xl"
          >
            {t}
            <span className="mx-6 text-[#0e5c3f]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
