import type { PayloadHandler, PayloadRequest } from 'payload'

import { requireAdmin } from '../system/lib'
import { writeAudit } from '../../utilities/auditLog'
import {
  buildOtpauthUrl,
  decryptSecret,
  encryptSecret,
  generateSecret,
  qrDataUrl,
  verifyToken,
} from '../../utilities/twoFactor'

/** Short-circuit unauthenticated callers; otherwise return the logged-in user. */
function requireUser(req: PayloadRequest): Response | null {
  if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

async function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  return ((await req.json?.().catch(() => ({}))) as Record<string, unknown>) ?? {}
}

/**
 * POST /api/account/2fa/setup — begins enrollment for the *logged-in* user. Generates a
 * fresh TOTP secret, stashes it (encrypted) as the pending secret, and returns the QR /
 * manual key so the user can add it to their authenticator app. Enrollment is only
 * finalized once /verify confirms a code, so re-running setup simply replaces the pending
 * secret without touching an already-active one.
 */
export const setup: PayloadHandler = async (req) => {
  const denied = requireUser(req)
  if (denied) return denied
  const user = req.user!

  const secret = generateSecret()
  const otpauthUrl = buildOtpauthUrl(user.email ?? String(user.id), secret)
  const qr = await qrDataUrl(otpauthUrl)

  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { twoFactorPendingSecret: encryptSecret(secret) },
    overrideAccess: true,
  })

  await writeAudit(req, { action: '2fa:setup', status: 'pending', detail: 'Started 2FA enrollment' })

  return Response.json({ otpauthUrl, qrDataUrl: qr, secret })
}

/**
 * POST /api/account/2fa/verify — finalizes enrollment for the logged-in user by checking a
 * code against the pending secret. On success the pending secret becomes the active one and
 * 2FA is switched on.
 */
export const verify: PayloadHandler = async (req) => {
  const denied = requireUser(req)
  if (denied) return denied
  const user = req.user!

  const { code } = await readBody(req)
  if (typeof code !== 'string' || !code) {
    return Response.json({ error: 'Code is required' }, { status: 400 })
  }

  const full = await req.payload.findByID({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  })

  const pendingEncrypted = full?.twoFactorPendingSecret
  const secret = decryptSecret(pendingEncrypted)
  if (!secret) {
    return Response.json({ error: 'No 2FA setup in progress. Start setup again.' }, { status: 400 })
  }

  if (!(await verifyToken(secret, code))) {
    return Response.json({ error: 'Invalid code. Please try again.' }, { status: 400 })
  }

  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: {
      twoFactorSecret: pendingEncrypted,
      twoFactorPendingSecret: null,
      twoFactorEnabled: true,
    },
    overrideAccess: true,
  })

  await writeAudit(req, { action: '2fa:enable', status: 'success', detail: '2FA activated' })

  return Response.json({ enabled: true })
}

/**
 * POST /api/account/2fa/disable — turns off 2FA for the logged-in user. Requires a valid
 * current code so a hijacked session can't silently strip the second factor.
 */
export const disable: PayloadHandler = async (req) => {
  const denied = requireUser(req)
  if (denied) return denied
  const user = req.user!

  const { code } = await readBody(req)
  if (typeof code !== 'string' || !code) {
    return Response.json({ error: 'Code is required' }, { status: 400 })
  }

  const full = await req.payload.findByID({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  })

  if (!full?.twoFactorEnabled) {
    return Response.json({ error: '2FA is not enabled.' }, { status: 400 })
  }

  const secret = decryptSecret(full.twoFactorSecret)
  if (!secret || !(await verifyToken(secret, code))) {
    return Response.json({ error: 'Invalid code. Please try again.' }, { status: 400 })
  }

  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorPendingSecret: null,
    },
    overrideAccess: true,
  })

  await writeAudit(req, { action: '2fa:disable', status: 'success', detail: '2FA deactivated' })

  return Response.json({ enabled: false })
}

/**
 * POST /api/account/2fa/admin-reset — admin-only lockout recovery. Clears another user's
 * 2FA so they can log in without a code. `twoFactorEnforced` is intentionally left as-is,
 * so an enforced user is prompted to re-enroll on their next login.
 */
export const adminReset: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  const { userId } = await readBody(req)
  if (typeof userId !== 'string' && typeof userId !== 'number') {
    return Response.json({ error: 'userId is required' }, { status: 400 })
  }
  if (String(userId) === String(req.user!.id)) {
    return Response.json({ error: 'Use the account page to manage your own 2FA.' }, { status: 400 })
  }

  const target = await req.payload.findByID({
    collection: 'users',
    id: userId,
    overrideAccess: true,
    depth: 0,
  })
  if (!target) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  await req.payload.update({
    collection: 'users',
    id: userId,
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorPendingSecret: null,
    },
    overrideAccess: true,
  })

  await writeAudit(req, {
    action: '2fa:admin-reset',
    status: 'success',
    detail: `Reset 2FA for ${target.email ?? userId}`,
    params: { userId },
  })

  return Response.json({ ok: true })
}
