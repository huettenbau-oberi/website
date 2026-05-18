import type { Block } from 'payload'

export const IframeBlock: Block = {
  slug: 'iframeBlock',
  interfaceName: 'IframeBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'height',
      type: 'number',
      label: 'Height (px)',
      defaultValue: 500,
      min: 100,
    },
    {
      name: 'fullWidth',
      type: 'checkbox',
      label: 'Full Width',
      defaultValue: true,
    },
  ],
}
