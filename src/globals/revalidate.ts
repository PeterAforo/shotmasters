import type { GlobalAfterChangeHook } from 'payload'

/** Clear the Next.js data-cache tag for a global after it is saved in the CMS. */
export const revalidateGlobal =
  (tag: string): GlobalAfterChangeHook =>
  async () => {
    try {
      const { revalidateTag } = await import('next/cache')
      revalidateTag(tag, 'max')
    } catch {
      /* outside Next runtime (CLI/codegen) — skip */
    }
  }
