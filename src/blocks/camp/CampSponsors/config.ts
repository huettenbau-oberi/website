import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../../fields/linkGroup'

const sponsorFields = [
  {
    name: 'image',
    type: 'upload' as const,
    relationTo: 'media' as const,
    required: false,
    label: 'Logo',
  },
  {
    name: 'name',
    type: 'text' as const,
    label: 'Name',
    required: true,
  },
  {
    name: 'url',
    type: 'text' as const,
    label: 'Website URL',
    required: false,
    admin: {
      description: 'Optional link to sponsor website',
    },
  },
]

export const CampSponsors: Block = {
  imageURL: '/blocks/camp-sponsors.svg',
  imageAltText: 'Sponsor sections with main sponsors, sponsors and patrons',
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
      label: 'Text Above Sponsors',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'mainSponsors',
      type: 'array',
      label: 'Main Sponsors (Hauptsponsoren)',
      admin: {
        components: {
          RowLabel: '@/blocks/camp/CampSponsors/SponsorRowLabel#SponsorRowLabel',
        },
      },
      fields: sponsorFields,
    },
    {
      name: 'sponsors',
      type: 'array',
      label: 'Sponsors (Sponsoren)',
      admin: {
        components: {
          RowLabel: '@/blocks/camp/CampSponsors/SponsorRowLabel#SponsorRowLabel',
        },
      },
      fields: sponsorFields,
    },
    {
      name: 'outroText',
      type: 'richText',
      label: 'Text Below Sponsors',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        label: 'Buttons',
        maxRows: 4,
      },
    }),
  ],
}
