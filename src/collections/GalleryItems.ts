import type { CollectionConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'type', 'category', 'featured'],
  },
  access: {
    read: publicRead,
    create: staffWrite,
    update: staffWrite,
    delete: staffWrite,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'photo',
      options: [
        { label: 'Photo', value: 'photo' },
        { label: 'Video (external URL)', value: 'video' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (data) => data?.type === 'photo' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (data) => data?.type === 'video',
        description: 'YouTube/Vimeo embed URL or direct mp4 link',
      },
    },
    { name: 'caption', type: 'textarea' },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'club',
      options: [
        { label: 'The Club', value: 'club' },
        { label: 'Events', value: 'events' },
        { label: 'Tournaments', value: 'tournaments' },
        { label: 'Trick Shots', value: 'trick-shots' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}
