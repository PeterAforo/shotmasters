import type { GlobalConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const PartnershipsPage: GlobalConfig = {
  slug: 'partnerships-page',
  admin: { group: 'Settings' },
  access: { read: publicRead, update: staffWrite },
  fields: [
    { name: 'intro', type: 'textarea', defaultValue: 'Tournament visibility, grassroots sporting engagement and cultural tourism in Accra.' },
    {
      name: 'opportunities',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
    { name: 'enquiryEmail', type: 'email' },
  ],
}
