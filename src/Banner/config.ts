import type { GlobalConfig } from 'payload'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidateBanner } from './hooks/revalidateBanner'

export const Banner: GlobalConfig = {
  slug: 'banner',
  label: 'Banner',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'text',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [...rootFeatures, FixedToolbarFeature()],
      }),
    },
    {
      name: 'showFrom',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'showUntil',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateBanner],
  },
}
