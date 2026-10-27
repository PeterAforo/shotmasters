export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
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
