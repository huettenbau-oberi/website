import type { Block } from 'payload'

export const GalleryGrid: Block = {
  slug: 'galleryGrid',
  interfaceName: 'GalleryGridBlock',
  imageURL: '/blocks/gallery-grid.svg',
  imageAltText: 'Two-column gallery grid with zoomable images',
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
      label: 'Column Alignment',
      required: true,
      defaultValue: 'middle',
      options: [
        { label: 'Top-aligned', value: 'beginning' },
        { label: 'Space between', value: 'middle' },
        { label: 'Bottom-aligned', value: 'end' },
      ],
      admin: {
        description:
          'Controls how images are distributed vertically within each column. "Top-aligned" piles images at the top, "Space between" spreads them evenly, "Bottom-aligned" anchors them at the bottom.',
      },
    },
    {
      name: 'leftImages',
      type: 'array',
      label: 'Left Column Images',
      minRows: 1,
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
      name: 'rightImages',
      type: 'array',
      label: 'Right Column Images',
      minRows: 1,
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
