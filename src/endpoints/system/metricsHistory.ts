import type { PayloadHandler } from 'payload'

import { requireAdmin } from './lib'
import { getMetricsHistory, isAgentConfigured } from '../../utilities/systemAgent'

export const metricsHistory: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  if (!isAgentConfigured()) return Response.json({ samples: [] })

  const result = await getMetricsHistory()
  if (!result.ok) return Response.json({ samples: [] })

  return Response.json(result.data)
}
