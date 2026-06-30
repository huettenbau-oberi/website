import type { PayloadHandler } from 'payload'

import { requireAdmin } from './lib'
import { isAgentConfigured, runOp } from '../../utilities/systemAgent'
import { writeAudit } from '../../utilities/auditLog'

/**
 * Fixed allowlist of operations the agent may run. The agent enforces the same list
 * independently (defense in depth); this is the app-side gate. `destructive` ops
 * additionally require a typed confirmation matching the op name.
 */
const OPS: Record<string, { destructive: boolean }> = {
  'restart-service': { destructive: false },
  redeploy: { destructive: false },
  backup: { destructive: false },
  restore: { destructive: true },
  'system-update': { destructive: true },
}

/**
 * POST /api/system/ops/:name — admin-gated proxy that asks the sidecar agent to run a
 * named, allowlisted operation. Low-risk ops (restart/redeploy/backup) execute on the
 * host; heavy/destructive ops are dispatched by the agent as GitHub Actions workflows.
 * Every attempt is written to the audit log.
 */
export const ops: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  const name = String(req.routeParams?.name ?? '')
  const spec = OPS[name]
  if (!spec) {
    return Response.json({ error: `Unknown operation "${name}"` }, { status: 400 })
  }

  const body = (await req.json?.().catch(() => ({}))) as Record<string, unknown>

  // Destructive ops require the caller to type the op name as confirmation.
  if (spec.destructive && body?.confirm !== name) {
    return Response.json(
      { error: `Confirmation required: type "${name}" to proceed.` },
      { status: 400 },
    )
  }

  // Only forward known parameters — never an arbitrary command.
  const forwarded: Record<string, unknown> = {}
  if (typeof body?.service === 'string') forwarded.service = body.service
  if (typeof body?.path === 'string') forwarded.path = body.path

  // Audit-safe params (no secrets are ever present here).
  const auditParams = { op: name, ...forwarded }

  if (!isAgentConfigured()) {
    await writeAudit(req, { action: `ops:${name}`, status: 'error', detail: 'agent not configured', params: auditParams })
    return Response.json({ error: 'System agent is not configured' }, { status: 503 })
  }

  await writeAudit(req, { action: `ops:${name}`, status: 'pending', params: auditParams })

  const result = await runOp(name, forwarded)

  if (!result.ok) {
    await writeAudit(req, { action: `ops:${name}`, status: 'error', detail: result.error, params: auditParams })
    return Response.json({ error: result.error }, { status: result.status })
  }

  await writeAudit(req, {
    action: `ops:${name}`,
    status: 'success',
    detail: result.data.detail ?? result.data.runUrl,
    params: auditParams,
  })

  return Response.json(result.data)
}
