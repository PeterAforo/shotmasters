import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff, isAdminField } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  access: {
    // First user creation (empty DB) bypasses this automatically
    create: isAdmin,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      access: {
        update: isAdminField,
      },
    },
  ],
}
