import type { PayloadHandler } from 'payload'
import { revalidatePath } from 'next/cache'

import { requireAdmin } from './lib'
import { writeAudit } from '../../utilities/auditLog'

/**
 * POST /api/system/revalidate — purges the Next.js full-route cache for the whole site
 * (every route under the root layout). Useful after bulk content/data changes.
 */
export const revalidate: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    // 'layout' scope revalidates the root layout and all nested routes beneath it.
    revalidatePath('/', 'layout')
  } catch (err) {
    await writeAudit(req, {
      action: 'revalidate',
      status: 'error',
      detail: err instanceof Error ? err.message : 'Unknown error',
    })
    return Response.json({ error: 'Failed to revalidate' }, { status: 500 })
  }

  await writeAudit(req, { action: 'revalidate', status: 'success', detail: 'Revalidated / (layout)' })

  return Response.json({ ok: true })
}
