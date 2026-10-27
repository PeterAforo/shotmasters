import type { GlobalConfig } from 'payload'
import { publicRead, staffWrite } from '../access'
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: { group: 'Settings' },
  access: { read: publicRead, update: staffWrite },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('navigation', 'max')
        } catch {
          /* outside Next runtime (CLI/codegen) — skip */
        }
      },
    ],
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'link',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Dropdown group', value: 'group' },
          ],
        },
        {
          name: 'href',
          type: 'text',
          admin: { condition: (_, sibling) => sibling?.kind !== 'group' },
        },
        {
          name: 'children',
          type: 'array',
          admin: { condition: (_, sibling) => sibling?.kind === 'group' },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Book a Table' },
    { name: 'ctaHref', type: 'text', defaultValue: '/book' },
  ],
}
