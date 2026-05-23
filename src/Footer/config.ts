import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'contactButton',
      type: 'group',
      label: 'Contact Button',
      admin: {
        hideGutter: true,
        description: 'Configure the contact button shown in the footer.',
      },
      fields: [
        link({ appearances: false, disableLabel: true }),
      ],
    },
    {
      name: 'legalItems',
      label: 'Legal Links (Below Logo in Footer)',
      type: 'array',
      localized: true,
      fields: [
        link({
          appearances: false,
        }),
      ],
      admin: {
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'navItems',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
