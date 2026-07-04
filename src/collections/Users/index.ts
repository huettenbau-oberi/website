import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { admin, adminFieldAccess } from '../../access/admin'
import { validateTurnstile } from './hooks/validateTurnstile'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: admin,
    delete: admin,
    read: authenticated,
    update: admin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'userRole'],
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
      // Three-tier access gate. Unlike `role` (a display label), this field is
      // enforced by access control. Only an existing admin can change it, so a
      // non-admin cannot escalate their own privileges.
      name: 'userRole',
      type: 'select',
      defaultValue: 'viewer',
      label: 'Access Role',
      options: [
        { label: 'Viewer (read-only)', value: 'viewer' },
        { label: 'Editor', value: 'editor' },
        { label: 'Admin (full access + system tools)', value: 'admin' },
      ],
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
      },
    },
  ],
  timestamps: true,
}
