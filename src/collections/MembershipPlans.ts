import type { CollectionConfig } from 'payload'
import { publicRead, staffWrite } from '../access'

export const MembershipPlans: CollectionConfig = {
  slug: 'membership-plans',
  admin: {
    useAsTitle: 'name',
    group: 'Club',
    defaultColumns: ['name', 'priceGHS', 'interval', 'featured'],
  },
  access: {
    read: publicRead,
    create: staffWrite,
    update: staffWrite,
    delete: staffWrite,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'priceGHS', type: 'number', required: true },
    {
      name: 'interval',
      type: 'select',
      required: true,
      defaultValue: 'monthly',
      options: [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Yearly', value: 'yearly' },
      ],
    },
    {
      name: 'perks',
      type: 'array',
      fields: [{ name: 'perk', type: 'text', required: true }],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'description', type: 'textarea' },
  ],
}
