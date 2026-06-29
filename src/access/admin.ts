import type { AccessArgs, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

type AccessFn = (args: AccessArgs<User>) => boolean

// Collection/endpoint-level gate: only users with the admin role pass.
// This is the real privilege boundary for system tools — note that the free-text
// `role` field on Users is only a display label and must NOT be used for access.
export const admin: AccessFn = ({ req: { user } }) => user?.userRole === 'admin'

// Field-level variant, used to lock down who can change the `userRole` field itself
// so a non-admin can never escalate their own privileges.
export const adminFieldAccess: FieldAccess<User> = ({ req: { user } }) =>
  user?.userRole === 'admin'

// Collection-level gate: editor and admin users may create/update/delete content.
// Viewer users are read-only throughout the admin panel.
export const editor: AccessFn = ({ req: { user } }) =>
  user?.userRole === 'editor' || user?.userRole === 'admin'

// Field-level variant for fields that editors (and above) may write.
export const editorFieldAccess: FieldAccess<User> = ({ req: { user } }) =>
  user?.userRole === 'editor' || user?.userRole === 'admin'
