import type { PayloadHandler } from 'payload'
import path from 'path'
import fs from 'fs/promises'

import { IMAGE_CACHE_DIR, getMediaUsage, requireAdmin } from './lib'
import { writeAudit } from '../../utilities/auditLog'

/**
 * POST /api/system/clear-image-cache — empties the Next.js image-optimization cache
 * (the `next_cache` volume). Next regenerates entries on demand, so this is safe.
 */
export const clearImageCache: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  let deletedCount = 0
  let freedBytes = 0

  try {
    const before = await getMediaUsage(IMAGE_CACHE_DIR)
    freedBytes = before.totalBytes
    deletedCount = before.fileCount

    const entries = await fs.readdir(IMAGE_CACHE_DIR)
    for (const name of entries) {
      await fs.rm(path.join(IMAGE_CACHE_DIR, name), { recursive: true, force: true })
    }
  } catch (err) {
    // ENOENT just means the cache hasn't been created yet — treat as a no-op success.
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      await writeAudit(req, {
        action: 'clear-image-cache',
        status: 'error',
        detail: err instanceof Error ? err.message : 'Unknown error',
      })
      return Response.json({ error: 'Failed to clear image cache' }, { status: 500 })
    }
  }

  await writeAudit(req, {
    action: 'clear-image-cache',
    status: 'success',
    detail: `Removed ${deletedCount} files, freed ${freedBytes} bytes`,
  })

  return Response.json({ deletedCount, freedBytes })
}
