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

  const runs = result.data.runs

  // Build a runId → CMS actorEmail map from audit log entries.
  // Successful ops write the GitHub run URL into `detail`; we extract the run ID from it.
  const cmsActorMap: Record<number, string> = {}
  if (runs.length > 0) {
    try {
      const auditResult = await req.payload.find({
        collection: 'audit-logs',
        where: {
          and: [
            { action: { contains: 'ops:' } },
            { status: { equals: 'success' } },
          ],
        },
        limit: 200,
        sort: '-createdAt',
        overrideAccess: true,
      })
      for (const entry of auditResult.docs) {
        if (!entry.actorEmail || !entry.detail) continue
        const match = /\/runs\/(\d+)/.exec(entry.detail)
        if (match) {
          const runId = parseInt(match[1], 10)
          if (!cmsActorMap[runId]) cmsActorMap[runId] = entry.actorEmail
        }
      }
    } catch {
      // best-effort — don't let a logging failure break the runs response
    }
  }

  const enrichedRuns = runs.map((run) =>
    cmsActorMap[run.id] ? { ...run, cmsActor: cmsActorMap[run.id] } : run,
  )

  return Response.json({ ...result.data, runs: enrichedRuns })
}
