import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { admin, adminFieldAccess } from '../../access/admin'
import { validateTurnstile } from './hooks/validateTurnstile'
import { enforceTwoFactor } from './hooks/enforceTwoFactor'

// Managed exclusively by the /account/2fa endpoints (via overrideAccess) — no one
// may flip these through the normal API, so a stolen session can't silently toggle 2FA.
const denyWrite = () => false

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
    beforeLogin: [enforceTwoFactor],
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
    // --- Two-factor authentication ---------------------------------------------
    {
      // Admin-controlled: when set, the user is forced into 2FA setup on their next
      // login (enforced by TwoFactorGate) and cannot use the panel until enrolled.
      name: 'twoFactorEnforced',
      type: 'checkbox',
      defaultValue: false,
      label: 'Require Two-Factor Authentication',
      admin: {
        description:
          'When enabled, this user must set up an authenticator app the next time they log in before they can use the admin panel.',
      },
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
      },
    },
    {
      // Whether the user has completed 2FA setup. Read-only in the UI; only the
      // /account/2fa endpoints change it.
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Two-Factor Authentication Active',
      admin: {
        readOnly: true,
      },
      access: {
        create: denyWrite,
        update: denyWrite,
      },
    },
    {
      // Active TOTP secret, AES-encrypted at rest. Never exposed through the API.
      name: 'twoFactorSecret',
      type: 'text',
      hidden: true,
      access: {
        read: denyWrite,
        create: denyWrite,
        update: denyWrite,
      },
    },
    {
      // Encrypted secret held while the user is setting up 2FA, before their first
      // code is verified. Promoted to twoFactorSecret on successful verification.
      name: 'twoFactorPendingSecret',
      type: 'text',
      hidden: true,
      access: {
        read: denyWrite,
        create: denyWrite,
        update: denyWrite,
      },
    },
    {
      // Renders the self-service 2FA panel in the account/edit view.
      name: 'twoFactorUI',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/TwoFactorSettings',
        },
      },
    },
  ],
  timestamps: true,
}
