import type { CollectionConfig } from 'payload'
import { memberOwnedOrStaff } from '../access'

export const TournamentEntries: CollectionConfig = {
  slug: 'tournament-entries',
  admin: {
    group: 'Club',
    defaultColumns: ['tournament', 'member', 'paid', 'placement'],
  },
  access: memberOwnedOrStaff,
  fields: [
    { name: 'tournament', type: 'relationship', relationTo: 'tournaments', required: true },
    { name: 'member', type: 'relationship', relationTo: 'members', required: true },
    { name: 'paid', type: 'checkbox', defaultValue: false },
    { name: 'paystackRef', type: 'text', index: true },
    { name: 'seed', type: 'number' },
    { name: 'placement', type: 'number' },
    { name: 'notes', type: 'textarea' },
  ],
}
