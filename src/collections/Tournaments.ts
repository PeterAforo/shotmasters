import type { CollectionConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  admin: {
    useAsTitle: 'title',
    group: 'Club',
    defaultColumns: ['title', 'date', 'format', 'status', 'entryFee'],
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'registration',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Registration Open', value: 'registration' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    { name: 'date', type: 'date', required: true },
    { name: 'endDate', type: 'date' },
    {
      name: 'format',
      type: 'select',
      required: true,
      defaultValue: 'knockout',
      options: [
        { label: 'Knockout', value: 'knockout' },
        { label: 'Round Robin', value: 'round-robin' },
        { label: 'League', value: 'league' },
      ],
    },
    { name: 'entryFee', type: 'number', defaultValue: 0, admin: { description: 'GHS — 0 for free entry' } },
    { name: 'prizePool', type: 'text', admin: { description: 'e.g. GHS 2,000 + trophy' } },
    { name: 'maxPlayers', type: 'number', defaultValue: 32 },
    { name: 'venue', type: 'text' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'richText' },
    {
      name: 'results',
      type: 'array',
      admin: { description: 'Final placements — filled after completion' },
      fields: [
        { name: 'placement', type: 'number', required: true },
        { name: 'playerName', type: 'text', required: true },
      ],
    },
  ],
}
