import type { Block } from 'payload'

export const GalleryGrid: Block = {
  slug: 'galleryGrid',
  interfaceName: 'GalleryGridBlock',
  imageURL: '/blocks/gallery-grid.svg',
  imageAltText: 'Mosaic gallery grid — beginning, middle, and end block variants',
  admin: {
    group: 'Hüttenbau Custom',
  },
  labels: {
    singular: 'Gallery Grid',
    plural: 'Gallery Grids',
  },
  fields: [
    {
      name: 'layout',
      type: 'select',
      label: 'Layout',
      required: true,
      defaultValue: 'middle',
      options: [
        { label: 'Beginning Block', value: 'beginning' },
        { label: 'Beginning Block w/ tall Image', value: 'beginningTall' },
        { label: 'Middle Block', value: 'middle' },
        { label: 'Middle Block w/ tall Image', value: 'middleTall' },
        { label: 'End Block', value: 'end' },
        { label: 'End Block w/ tall Image', value: 'endTall' },
      ],
      admin: {
        description:
          'Chain Beginning → Middle(s) → End to build a flowing gallery section. Beginning/End blocks have a staggered column offset.',
      },
    },
    {
      name: 'flip',
      type: 'checkbox',
      label: 'Flip Columns',
      defaultValue: false,
      admin: {
        description: 'Swap the left and right columns.',
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      maxRows: 5,
      admin: {
        description:
          'Images are placed top-left to bottom-right. Most layouts use 5 images; End Block w/ tall Image uses 4.',
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
  ],
}
