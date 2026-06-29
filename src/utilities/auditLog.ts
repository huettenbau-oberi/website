import type { PayloadRequest } from 'payload'

export type AuditStatus = 'success' | 'error' | 'pending'

export type AuditInput = {
  action: string
  status: AuditStatus
  detail?: string
  // Sanitized parameters only — never pass secrets (agent secret, tokens) in here.
  params?: unknown
}

/**
 * Append a row to the `audit-logs` collection. Best-effort: a logging failure must
 * never break the action being audited, so errors are swallowed (and logged).
 *
 * Note we intentionally do NOT pass `req` to `create` so the audit row persists on its
 * own and isn't rolled back if the surrounding request later fails.
 */
export async function writeAudit(req: PayloadRequest, input: AuditInput): Promise<void> {
  try {
    await req.payload.create({
      collection: 'audit-logs',
      data: {
        action: input.action,
        status: input.status,
        actor: req.user?.id ?? undefined,
        actorEmail: req.user?.email ?? undefined,
        detail: input.detail,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: (input.params ?? undefined) as any,
      },
      overrideAccess: true,
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: `Failed to write audit log for action "${input.action}"` })
  }
}
