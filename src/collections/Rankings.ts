import type { CollectionConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const Rankings: CollectionConfig = {
  slug: 'rankings',
  admin: {
    useAsTitle: 'playerName',
    group: 'Club',
    defaultColumns: ['rank', 'playerName', 'wins', 'losses', 'highBreak', 'points'],
  },
  defaultSort: 'rank',
  access: {
    read: publicRead,
    create: staffWrite,
    update: staffWrite,
    delete: staffWrite,
  },
  fields: [
    { name: 'rank', type: 'number', required: true, min: 1 },
    { name: 'playerName', type: 'text', required: true },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      admin: { description: 'Optional link to a registered member' },
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'wins', type: 'number', defaultValue: 0, min: 0 },
    { name: 'losses', type: 'number', defaultValue: 0, min: 0 },
    { name: 'highBreak', type: 'number', defaultValue: 0, min: 0 },
    { name: 'points', type: 'number', defaultValue: 0 },
    { name: 'trend', type: 'select', defaultValue: 'same', options: [
      { label: 'Up', value: 'up' },
      { label: 'Down', value: 'down' },
      { label: 'Same', value: 'same' },
    ] },
  ],
}
