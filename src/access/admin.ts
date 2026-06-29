import type { AccessArgs, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean

// Collection/endpoint-level gate: only users flagged as admins may pass.
// This is the real privilege boundary for system tools — note that the free-text
// `role` field on Users is only a display label and must NOT be used for access.
export const admin: isAdmin = ({ req: { user } }) => {
  return Boolean(user?.isAdmin)
}

// Field-level variant, used to lock down who can set the `isAdmin` flag itself
// so a non-admin can never escalate their own privileges.
export const adminFieldAccess: FieldAccess<User> = ({ req: { user } }) => {
  return Boolean(user?.isAdmin)
}
