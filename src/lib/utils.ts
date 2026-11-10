export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Split a CMS phone field ("0264338227 / 0544949022") into display + tel: pairs. */
export function phoneList(raw: string | null | undefined): { display: string; tel: string }[] {
  return (raw ?? '')
    .split(/[\/,;|]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((display) => ({ display, tel: display.replace(/[^\d+]/g, '') }))
}

export function formatGHS(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Resolve a Payload media field (populated doc or id) to a URL. */
export function mediaUrl(media: unknown, size?: string): string | null {
  if (!media || typeof media !== 'object') return null
  const m = media as { url?: string; sizes?: Record<string, { url?: string }> }
  if (size && m.sizes?.[size]?.url) return m.sizes[size].url
  return m.url ?? null
}
