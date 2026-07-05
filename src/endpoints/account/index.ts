import type { Endpoint } from 'payload'

import { adminReset, disable, setup, verify } from './twoFactor'

// Self-service account endpoints served under the API route (default `/api`). The 2FA
// handlers derive the target from `req.user` and never accept a user id — only the
// admin-gated reset takes a `userId`.
export const accountEndpoints: Endpoint[] = [
  { path: '/account/2fa/setup', method: 'post', handler: setup },
  { path: '/account/2fa/verify', method: 'post', handler: verify },
  { path: '/account/2fa/disable', method: 'post', handler: disable },
  { path: '/account/2fa/admin-reset', method: 'post', handler: adminReset },
]
