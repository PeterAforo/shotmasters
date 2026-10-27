import type { GlobalConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  admin: { group: 'Settings' },
  access: { read: publicRead, update: staffWrite },
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
            admin: { description: 'Cycling slides behind/in the hero — the wild slide animation' },
      fields: [
        { name: 'headline', type: 'text', required: true },
        { name: 'subtext', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaHref', type: 'text' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      admin: { description: 'Animated counters under the hero' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'number', required: true },
        { name: 'suffix', type: 'text' },
      ],
    },
    { name: 'aboutTeaser', type: 'textarea' },
    {
      name: 'sections',
      type: 'group',
      fields: [
        { name: 'showTables', type: 'checkbox', defaultValue: true },
        { name: 'showMembership', type: 'checkbox', defaultValue: true },
        { name: 'showTournaments', type: 'checkbox', defaultValue: true },
        { name: 'showLeaderboard', type: 'checkbox', defaultValue: true },
        { name: 'showGallery', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}
