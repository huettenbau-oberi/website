import { APIError } from 'payload'
import type { CollectionBeforeLoginHook } from 'payload'

import { decryptSecret, verifyToken } from '../../../utilities/twoFactor'
import { TWO_FACTOR_REQUIRED } from '../../../utilities/twoFactorConstants'

/**
 * Runs after the password has been verified but before a session token is issued.
 * For users who have activated 2FA it demands a valid TOTP code (sent as `otp` in the
 * login request body) — throwing here aborts the login so no cookie is set until the
 * second factor checks out. Users without 2FA pass straight through; enforcement of
 * *un-enrolled* users is handled after login by the TwoFactorGate.
 */
export const enforceTwoFactor: CollectionBeforeLoginHook = async ({ req, user }) => {
  // Re-read with hidden fields so we can see the (encrypted) secret, which is never
  // exposed through normal access control.
  const fullUser = await req.payload.findByID({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  })

  if (!fullUser?.twoFactorEnabled) return

  const secret = decryptSecret(fullUser.twoFactorSecret)
  if (!secret) {
    // Enabled but the secret can't be read — fail closed rather than let the user in.
    throw new APIError('Two-factor authentication is misconfigured. Contact an administrator.', 401, undefined, true)
  }

  const otp = typeof req.data?.otp === 'string' ? req.data.otp : ''
  if (!otp) {
    throw new APIError(TWO_FACTOR_REQUIRED, 401, undefined, true)
  }

  const valid = await verifyToken(secret, otp)
  if (!valid) {
    throw new APIError('Invalid authentication code. Please try again.', 401, undefined, true)
  }
}
