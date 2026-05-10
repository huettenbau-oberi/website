import type { Block } from 'payload'

import { link } from '@/fields/link'

export const CampGallery: Block = {
  slug: 'campGallery',
  interfaceName: 'CampGalleryBlock',
  imageURL: '/blocks/camp-gallery.svg',
  imageAltText: 'Asymmetric mosaic photo gallery with a centered title',
  admin: { group: 'Hüttenbau Homepage' },
  labels: {
    singular: 'Camp Gallery',
    plural: 'Camp Galleries',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    link({ appearances: false }),
    {
      name: 'images',
      type: 'array',
      label: 'Gallery Images',
      maxRows: 7,
      admin: {
        description: 'Up to 7 images. They fill the mosaic positions from left to right.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'icons',
      type: 'array',
      label: 'Decorative Icons',
      maxRows: 12,
      admin: {
        description: 'Up to 12 icons scattered around the gallery perimeter.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
