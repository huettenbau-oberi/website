import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { validateTurnstile } from './hooks/validateTurnstile'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  hooks: {
    beforeOperation: [validateTurnstile],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description:
          'Role shown below the author name in post headers (e.g. "Vorstand", "Webseite")',
      },
    },
  ],
  timestamps: true,
}
