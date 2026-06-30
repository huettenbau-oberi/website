import type { CollectionConfig } from 'payload'

import { admin } from '../../access/admin'

// Append-only audit trail for privileged dashboard actions (maintenance + OS/infra
// operations). Rows are written only server-side via `writeAudit` with overrideAccess;
// the admin UI can read them but nobody can create/edit/delete through the API.
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: {
    singular: 'Audit Log',
    plural: 'Audit Logs',
  },
  access: {
    read: admin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    group: 'System',
    useAsTitle: 'action',
    defaultColumns: ['action', 'status', 'actorEmail', 'createdAt'],
  },
  fields: [
    {
      name: 'action',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'success',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Pending', value: 'pending' },
      ],
      admin: { readOnly: true },
    },
    {
      // Relationship for convenience, plus a denormalized email so the entry stays
      // meaningful even if the user is later deleted.
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'actorEmail',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'detail',
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'params',
      type: 'json',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
