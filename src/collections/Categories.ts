import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'urlPrefix',
      type: 'text',
      label: 'URL Prefix',
      admin: {
        description:
          'The URL path segment under which posts in this category live. Defaults to "posts". Example: set to "gallery" for posts to appear at /gallery/[slug].',
        placeholder: 'posts',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
