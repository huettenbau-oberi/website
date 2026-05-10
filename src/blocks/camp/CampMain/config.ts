import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const CampMain: Block = {
  slug: 'campMain',
  interfaceName: 'CampMainBlock',
  imageURL: '/blocks/camp-main.svg',
  imageAltText: 'Two-column layout with text on the left and an image on the right',
  admin: { group: 'Hüttenbau Homepage' },
  labels: {
    plural: 'Camp Mains',
    singular: 'Camp Main',
  },
  fields: [
    {
      name: 'richText1',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'First Text Content',
      required: true,
    },
    {
      name: 'image1',
      type: 'upload',
      relationTo: 'media',
      label: 'First Image',
      required: true,
      admin: {
        width: '50%',
        description: 'Image displayed right to the text',
      },
    },
    {
      name: 'richText2',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Second Text Content',
      required: true,
    },
    {
      name: 'image2',
      type: 'upload',
      relationTo: 'media',
      label: 'Second Image',
      required: true,
      admin: {
        width: '50%',
        description: 'Image displayed right to the text',
      },
    },
  ],
}
