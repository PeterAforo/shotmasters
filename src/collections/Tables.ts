import type { CollectionConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const Tables: CollectionConfig = {
  slug: 'tables',
  admin: {
    useAsTitle: 'name',
    group: 'Club',
    defaultColumns: ['name', 'type', 'hourlyRate', 'status'],
  },
  access: {
    read: publicRead,
    create: staffWrite,
    update: staffWrite,
    delete: staffWrite,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Snooker', value: 'snooker' },
        { label: 'Pool', value: 'pool' },
      ],
    },
    {
      name: 'hourlyRate',
      type: 'number',
      required: true,
      admin: { description: 'GHS per hour' },
    },
    {
      name: 'depositAmount',
      type: 'number',
      required: true,
      admin: { description: 'GHS deposit taken online to confirm a booking' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      fields: [{ name: 'feature', type: 'text', required: true }],
      admin: { description: 'e.g. Championship cloth, Aramith balls, LED lighting' },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'description', type: 'textarea' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}
