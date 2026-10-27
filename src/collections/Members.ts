import type { CollectionConfig } from 'payload'
import { memberSelfOrStaff, isStaff, isAdminField } from '../access'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'email',
    group: 'Club',
    defaultColumns: ['name', 'email', 'phone', 'membershipStatus', 'createdAt'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    verify: false,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: memberSelfOrStaff,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      admin: { description: 'Ghana phone number, e.g. 0551234567' },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'membershipPlan',
      type: 'relationship',
      relationTo: 'membership-plans',
      access: { update: isAdminField },
    },
    {
      name: 'membershipStatus',
      type: 'select',
      defaultValue: 'inactive',
      options: [
        { label: 'Inactive', value: 'inactive' },
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
      ],
      access: { update: isAdminField },
    },
    {
      name: 'membershipExpiresAt',
      type: 'date',
      access: { update: isAdminField },
    },
    {
      name: 'isPlayer',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Appears in club rankings/leaderboard' },
    },
    {
      name: 'nickname',
      type: 'text',
      admin: { description: 'Shown on leaderboard instead of full name if set' },
    },
  ],
}
