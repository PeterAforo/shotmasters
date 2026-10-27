import type { GlobalConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const TourismPage: GlobalConfig = {
  slug: 'tourism-page',
  admin: { group: 'Settings' },
  access: { read: publicRead, update: staffWrite },
  fields: [
    { name: 'intro', type: 'textarea', defaultValue: 'Cue sports, Ghanaian music, food and culture — sport as a doorway into Accra.' },
    {
      name: 'blocks',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
