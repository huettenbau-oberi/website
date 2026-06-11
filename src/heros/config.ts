import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Home',
          value: 'homeHero',
        },
        {
          label: 'Title',
          value: 'lowImpact',
        },
        {
          label: 'Gallery',
          value: 'galleryHero',
        },
      ],
      required: true,
    },
    // ── Home Hero fields ──────────────────────────────────────────
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      admin: {
        condition: (_, { type } = {}) => type === 'homeHero',
        description: 'Small text displayed above the logo (e.g. "Welcome to")',
      },
    },
    {
      name: 'backgroundMedia',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        condition: (_, { type } = {}) => type === 'homeHero',
      },
    },
    // ── Gallery Hero fields ───────────────────────────────────────
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      admin: {
        condition: (_, { type } = {}) => type === 'galleryHero',
        description: 'Italic subtitle displayed below the "Galerie" heading',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Category',
      admin: {
        condition: (_, { type } = {}) => type === 'galleryHero',
        description: 'Posts from this category are used to derive the archive date range',
      },
    },
    // ── Other hero type fields ────────────────────────────────────
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
      admin: {
        condition: (_, { type } = {}) => !['homeHero', 'galleryHero'].includes(type),
      },
    },
    // linkGroup({
    //   overrides: {
    //     maxRows: 2,
    //     admin: {
    //       condition: (_, { type } = {}) => !['homeHero', 'galleryHero'].includes(type),
    //     },
    //   },
    // }),
  ],
  label: false,
}
