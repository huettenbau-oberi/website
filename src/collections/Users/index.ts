import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { adminFieldAccess } from '../../access/admin'
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
    {
      // Real privilege boundary for the dashboard system tools. Unlike `role`
      // (a display label), this flag is enforced by access control. Only an
      // existing admin can grant or revoke it, so a non-admin cannot escalate.
      name: 'isAdmin',
      type: 'checkbox',
      defaultValue: false,
      label: 'Administrator',
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
      },
      admin: {
        description:
          'Grants access to the dashboard system tools (storage, health, maintenance and operations). Only administrators can change this.',
      },
    },
  ],
  timestamps: true,
}
