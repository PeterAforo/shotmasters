import type { GlobalConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Settings' },
  access: { read: publicRead, update: staffWrite },
  fields: [
    { name: 'clubName', type: 'text', required: true, defaultValue: 'Shot Masters Cue Club' },
    { name: 'tagline', type: 'text', defaultValue: 'Accra’s home of championship snooker' },
    { name: 'phone', type: 'text' },
    { name: 'whatsappNumber', type: 'text', admin: { description: 'International format, digits only — e.g. 233551234567' } },
    { name: 'email', type: 'email' },
    { name: 'address', type: 'text' },
    { name: 'city', type: 'text', defaultValue: 'Accra, Ghana' },
    {
      name: 'openingHours',
      type: 'array',
      fields: [
        { name: 'days', type: 'text', required: true },
        { name: 'hours', type: 'text', required: true },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: ['instagram', 'facebook', 'tiktok', 'x', 'youtube', 'snapchat'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'marqueeText',
      type: 'text',
      defaultValue: 'SHOT MASTERS CUE CLUB ✦ CHAMPIONSHIP TABLES ✦ OPEN DAILY ✦ ACCRA',
      admin: { description: 'Scrolling ticker text on the homepage' },
    },
  ],
}
