import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const CampSponsors: Block = {
  imageURL: '/blocks/camp-sponsors.svg',
  imageAltText: 'Scattered sponsor logos with title and intro/outro text',
  admin: { group: 'Hüttenbau Homepage' },
  slug: 'campSponsors',
  interfaceName: 'CampSponsorsBlock',
  labels: {
    singular: 'Camp Sponsors',
    plural: 'Camp Sponsors',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'introText',
      type: 'richText',
      label: 'Text Above Images',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'sponsors',
      type: 'array',
      label: 'Sponsor Logos',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          label: 'Sponsor Name',
        },
      ],
    },
    {
      name: 'outroText',
      type: 'richText',
      label: 'Text Below Images',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
