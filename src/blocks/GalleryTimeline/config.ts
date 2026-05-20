import type { Block } from 'payload'

export const GalleryTimeline: Block = {
  slug: 'galleryTimeline',
  interfaceName: 'GalleryTimelineBlock',
  imageURL: '/blocks/gallery-timeline.svg',
  labels: {
    singular: 'Gallery Timeline',
    plural: 'Gallery Timelines',
  },
  admin: {
    group: 'Hüttenbau Custom',
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Category',
      admin: {
        description: 'Posts from this category are displayed newest-first along the timeline',
      },
    },
  ],
}
