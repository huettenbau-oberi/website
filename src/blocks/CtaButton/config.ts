import type { Block } from 'payload'
import { link } from '@/fields/link'

export const CtaButton: Block = {
  slug: 'ctaButton',
  interfaceName: 'CtaButtonBlock',
  fields: [
    link({
      appearances: ['default', 'outline'],
    }),
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
