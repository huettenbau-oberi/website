import type { Endpoint } from 'payload'

import { appStats } from './appStats'
import { backups } from './backups'
import { clearImageCache } from './clearImageCache'
import { deepCleanup } from './deepCleanup'
import { hostMetrics } from './hostMetrics'
import { metricsHistory } from './metricsHistory'
import { ops } from './ops'
import { revalidate } from './revalidate'
import { workflowRuns } from './workflowRuns'

// Config-level endpoints served under the API route (default `/api`).
// All handlers enforce the admin gate via `requireAdmin`.
export const systemEndpoints: Endpoint[] = [
  { path: '/system/app-stats', method: 'get', handler: appStats },
  { path: '/system/host-metrics', method: 'get', handler: hostMetrics },
  { path: '/system/metrics-history', method: 'get', handler: metricsHistory },
  { path: '/system/workflow-runs', method: 'get', handler: workflowRuns },
  { path: '/system/backups', method: 'get', handler: backups },
  { path: '/system/clear-image-cache', method: 'post', handler: clearImageCache },
  { path: '/system/revalidate', method: 'post', handler: revalidate },
  { path: '/system/ops/:name', method: 'post', handler: ops },
  { path: '/system/deep-media-cleanup', method: 'post', handler: deepCleanup },
]
