import type { CollectionConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
  },
  defaultSort: '-publishedAt',
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      return { status: { equals: 'published' } }
    },
    create: staffWrite,
    update: staffWrite,
    delete: staffWrite,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ data, value }) =>
            value ||
            (data?.title
              ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              : value),
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'news',
      options: [
        { label: 'Club News', value: 'news' },
        { label: 'Match Report', value: 'match-report' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Tips & Coaching', value: 'tips' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'excerpt', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },
    { name: 'publishedAt', type: 'date' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
}
