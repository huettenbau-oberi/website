import type { PayloadHandler } from 'payload'

import { requireAdmin } from './lib'
import { getBackups, isAgentConfigured } from '../../utilities/systemAgent'

export const backups: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  if (!isAgentConfigured()) {
    return Response.json({ error: 'System agent is not configured', configured: false }, { status: 503 })
  }

  const result = await getBackups()
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status })
  }

  return Response.json(result.data)
}
