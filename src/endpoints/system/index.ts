import type { Endpoint } from 'payload'

import { appStats } from './appStats'
import { clearImageCache } from './clearImageCache'
import { hostMetrics } from './hostMetrics'
import { ops } from './ops'
import { revalidate } from './revalidate'

// Config-level endpoints served under the API route (default `/api`).
// All handlers enforce the admin gate via `requireAdmin`.
export const systemEndpoints: Endpoint[] = [
  { path: '/system/app-stats', method: 'get', handler: appStats },
  { path: '/system/host-metrics', method: 'get', handler: hostMetrics },
  { path: '/system/clear-image-cache', method: 'post', handler: clearImageCache },
  { path: '/system/revalidate', method: 'post', handler: revalidate },
  { path: '/system/ops/:name', method: 'post', handler: ops },
]
