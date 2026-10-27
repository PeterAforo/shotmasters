/** Normalize CMS navigation into a typed menu tree; auto-groups club pages for legacy flat data. */

export type MenuLeaf = { label: string; href: string }
export type MenuGroup = { label: string; children: MenuLeaf[] }
export type MenuItem = MenuLeaf | MenuGroup

const CLUB_HREFS = ['/membership', '/tournaments', '/leaderboard']
const CLUB_LABEL = 'The Club'

type RawItem = {
  label?: string | null
  href?: string | null
  kind?: string | null
  children?: { label?: string | null; href?: string | null }[] | null
}

export function normalizeNav(raw: RawItem[] | null | undefined, fallback: MenuItem[]): MenuItem[] {
  const items = (raw ?? [])
    .map((r): MenuItem | null => {
      const label = r.label?.trim()
      if (!label) return null
      if (r.kind === 'group') {
        const children = (r.children ?? [])
          .filter((c) => c.label?.trim() && c.href?.trim())
          .map((c) => ({ label: c.label!.trim(), href: c.href!.trim() }))
        return children.length ? { label, children } : null
      }
      return r.href?.trim() ? { label, href: r.href.trim() } : null
    })
    .filter((i): i is MenuItem => !!i)

  const source = items.length ? items : fallback
  if (source.some((i) => 'children' in i && i.label === CLUB_LABEL)) return source

  // Legacy flat data: fold club links into "The Club" at the first matching position
  const members = source.filter((i): i is MenuLeaf => 'href' in i && CLUB_HREFS.includes(i.href))
  const firstIdx = source.findIndex((i) => 'href' in i && CLUB_HREFS.includes((i as MenuLeaf).href))
  if (members.length === 0 || firstIdx === -1) return source
  const group: MenuGroup = { label: CLUB_LABEL, children: members }
  const out = source.filter((i) => !('href' in i && CLUB_HREFS.includes(i.href)))
  out.splice(firstIdx, 0, group)
  return out
}

export function flattenNav(items: MenuItem[]): MenuLeaf[] {
  return items.flatMap((i) => ('children' in i ? i.children : [i]))
}
