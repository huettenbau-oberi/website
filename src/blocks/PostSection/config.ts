import type { Block } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { MediaBlock } from '../MediaBlock/config'
import { HtmlBlock } from '../HtmlBlock/config'
import { IframeBlock } from '../IframeBlock/config'

export const PostSection: Block = {
  slug: 'postSection',
  interfaceName: 'PostSectionBlock',
  imageURL: '/blocks/post-section.svg',
  imageAltText:
    'Example of a Post Section block with an eyebrow, title, subtitle, and rich text content.',
  admin: {
    group: 'Hüttenbau Custom',
  },
  labels: {
    singular: 'Post Section',
    plural: 'Post Sections',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      localized: true,
      admin: {
        width: '33%',
        description: 'Small label above the title (e.g. "Tag", "Kapitel")',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      localized: true,
      admin: { width: '33%' },
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      localized: true,
      admin: {
        width: '33%',
        description: 'Smaller text below the title (e.g. a date "03.06")',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlocksFeature({ blocks: [MediaBlock, HtmlBlock, IframeBlock] }),
        ],
      }),
    },
  ],
}
