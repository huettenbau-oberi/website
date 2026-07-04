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

  // Map workflow filenames to their corresponding ops: action names so we can
  // correlate GitHub runs triggered via the CMS to the actor who initiated them.
  const WORKFLOW_TO_OP: Record<string, string> = {
    'backup.yaml': 'ops:backup',
    'pipeline.yaml': 'ops:redeploy',
    'restore.yaml': 'ops:restore',
    'update.yaml': 'ops:system-update',
  }

  // Build a runId → CMS actorEmail map by time-proximity matching.
  // workflow_dispatch doesn't return a run ID, so we match each manual run to the
  // closest audit log entry for the same op action within a ±5-minute window.
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
      for (const run of runs) {
        if (run.event !== 'workflow_dispatch') continue
        const expectedAction = WORKFLOW_TO_OP[run.workflow as string]
        if (!expectedAction) continue
        const runTime = new Date(run.createdAt as string).getTime()

        let best: { delta: number; email: string } | null = null
        for (const entry of auditResult.docs) {
          if (entry.action !== expectedAction || !entry.actorEmail) continue
          const entryTime = new Date(entry.createdAt as string).getTime()
          const delta = runTime - entryTime // positive = entry before run (expected)
          if (delta < -30_000 || delta > 300_000) continue
          if (!best || Math.abs(delta) < Math.abs(best.delta)) {
            best = { delta, email: entry.actorEmail as string }
          }
        }

        if (best) cmsActorMap[run.id as number] = best.email
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
