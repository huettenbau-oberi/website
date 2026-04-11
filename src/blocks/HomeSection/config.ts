import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

export const HomeSection: Block = {
  slug: 'homeSection',
  interfaceName: 'HomeSectionBlock',
  labels: {
    plural: 'Home Sections',
    singular: 'Home Section',
  },
  fields: [
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'textLeft',
      label: 'Layout',
      options: [
        { label: 'Text Left, Image Right', value: 'textLeft' },
        { label: 'Text Right, Image Left', value: 'textRight' },
        { label: 'Text Centered (no image)', value: 'centered' },
      ],
      required: true,
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      label: 'Background Theme',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Muted', value: 'muted' },
      ],
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow Text',
      admin: {
        description: 'Small label displayed above the heading',
      },
    },
    {
      name: 'richText',
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
      label: false,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      admin: {
        condition: (_, { layout } = {}) => layout !== 'centered',
      },
    },
  ],
}
