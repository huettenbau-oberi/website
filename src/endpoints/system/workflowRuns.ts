import type { PayloadHandler } from 'payload'

import { requireAdmin } from './lib'
import { getWorkflowRuns, isAgentConfigured } from '../../utilities/systemAgent'

export const workflowRuns: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  if (!isAgentConfigured()) {
    return Response.json({ runs: [] })
  }

  const result = await getWorkflowRuns()
  if (!result.ok) {
    return Response.json({ runs: [], error: result.error })
  }

  return Response.json(result.data)
}
