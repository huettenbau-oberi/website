import type { PayloadHandler } from 'payload'

import { requireAdmin } from './lib'
import { getHostMetrics, isAgentConfigured } from '../../utilities/systemAgent'

/**
 * GET /api/system/host-metrics — proxies the sidecar agent's read-only host metrics
 * (disk usage per mount, memory, CPU/load, uptime, container status). Returns 503 when
 * the agent isn't configured (e.g. local dev without the agent running).
 */
export const hostMetrics: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  if (!isAgentConfigured()) {
    return Response.json({ error: 'System agent is not configured', configured: false }, { status: 503 })
  }

  const result = await getHostMetrics()
  if (!result.ok) {
    return Response.json({ error: result.error, configured: true }, { status: result.status })
  }

  return Response.json(result.data)
}
