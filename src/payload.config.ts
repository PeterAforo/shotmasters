import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'
import { Members } from './collections/Members'
import { Media } from './collections/Media'
import { Tables } from './collections/Tables'
import { Bookings } from './collections/Bookings'
import { MembershipPlans } from './collections/MembershipPlans'
import { MembershipSubscriptions } from './collections/MembershipSubscriptions'
import { Tournaments } from './collections/Tournaments'
import { TournamentEntries } from './collections/TournamentEntries'
import { Rankings } from './collections/Rankings'
import { Posts } from './collections/Posts'
import { GalleryItems } from './collections/GalleryItems'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { HomePage } from './globals/HomePage'
import { TourismPage } from './globals/TourismPage'
import { PartnershipsPage } from './globals/PartnershipsPage'
import { cloudinaryAdapter, cloudinaryConfigured } from './lib/cloudinaryAdapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Shot Masters Cue Club',
      icons: [{ rel: 'icon', url: '/brand/logo.png' }],
    },
    components: {
      graphics: {
        Logo: '@/components/payload/AdminLogo#AdminLogo',
        Icon: '@/components/payload/AdminIcon#AdminIcon',
      },
    },
  },
  collections: [
    Users,
    Members,
    Media,
    Tables,
    Bookings,
    MembershipPlans,
    MembershipSubscriptions,
    Tournaments,
    TournamentEntries,
    Rankings,
    Posts,
    GalleryItems,
  ],
  globals: [SiteSettings, Navigation, HomePage, TourismPage, PartnershipsPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // push the schema directly in dev; switch to migrations for production workflow
    push: true,
  }),
  sharp,
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || 'onboarding@resend.dev',
        defaultFromName: 'Shot Masters Cue Club',
      })
    : undefined,
  plugins: [
    seoPlugin({
      collections: ['posts', 'tournaments'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title?.value || doc?.title || ''} — Shot Masters Cue Club`,
      generateDescription: ({ doc }) => doc?.excerpt?.value || doc?.excerpt || '',
    }),
    ...(cloudinaryConfigured()
      ? [
          cloudStoragePlugin({
            collections: { media: { adapter: cloudinaryAdapter, prefix: 'media' } },
          }),
        ]
      : []),
  ],
})
