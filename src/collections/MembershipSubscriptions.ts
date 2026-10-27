import type { CollectionConfig } from 'payload'
import { memberOwnedOrStaff } from '../access'

export const MembershipSubscriptions: CollectionConfig = {
  slug: 'membership-subscriptions',
  admin: {
    group: 'Club',
    defaultColumns: ['member', 'plan', 'status', 'expiresAt'],
  },
  access: memberOwnedOrStaff,
  fields: [
    { name: 'member', type: 'relationship', relationTo: 'members', required: true },
    { name: 'plan', type: 'relationship', relationTo: 'membership-plans', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending_payment',
      options: [
        { label: 'Pending Payment', value: 'pending_payment' },
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    { name: 'amountPaid', type: 'number', defaultValue: 0 },
    { name: 'paystackRef', type: 'text', index: true },
    { name: 'startsAt', type: 'date' },
    { name: 'expiresAt', type: 'date' },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // When a subscription activates, upgrade the member
        if (doc.status === 'active') {
          const memberId = typeof doc.member === 'object' ? doc.member.id : doc.member
          const planId = typeof doc.plan === 'object' ? doc.plan.id : doc.plan
          await req.payload.update({
            collection: 'members',
            id: memberId,
            data: {
              membershipPlan: planId,
              membershipStatus: 'active',
              membershipExpiresAt: doc.expiresAt,
            },
            overrideAccess: true,
          })
        }
      },
    ],
  },
}
