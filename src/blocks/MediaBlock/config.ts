import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'widthPercent',
      type: 'number',
      label: 'Width (%)',
      min: 1,
      max: 100,
      admin: {
        description: 'Image width as a percentage of the container.',
      },
    },
    {
      name: 'maxWidth',
      type: 'number',
      label: 'Max Width (px)',
      min: 1,
      admin: {
        description: 'Maximum image width in pixels.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
    {
      name: 'showMediaCaption',
      type: 'checkbox',
      label: 'Show original image caption',
      defaultValue: false,
    },
  ],
}
