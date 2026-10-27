import { getPayload } from 'payload'
import config from '@payload-config'

import { unstable_cache } from 'next/cache'

export const getPayloadClient = () => getPayload({ config })

export const getSiteSettings = unstable_cache(
  async () => (await getPayloadClient()).findGlobal({ slug: 'site-settings' }),
  ['site-settings'],
  { tags: ['site-settings'] },
)

export const getNavigation = unstable_cache(
  async () => (await getPayloadClient()).findGlobal({ slug: 'navigation' }),
  ['navigation'],
  { tags: ['navigation'] },
)

export const getHomePage = unstable_cache(
  async () => (await getPayloadClient()).findGlobal({ slug: 'home-page' }),
  ['home-page'],
  { tags: ['home-page'] },
)
