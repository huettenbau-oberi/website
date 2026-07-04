import type { PayloadHandler } from 'payload'

import { requireAdmin } from './lib'
import { writeAudit } from '../../utilities/auditLog'

type OrphanEntry = {
  id: string
  filename: string
  filesize: number
  alt: string | null
  createdAt: string
}

export const deepCleanup: PayloadHandler = async (req) => {
  const denied = requireAdmin(req)
  if (denied) return denied

  const url = new URL(req.url ?? '/', 'http://app')
  const isDryRun = url.searchParams.get('dry_run') === 'true'

  if (isDryRun) {
    let allContent = ''

    for (let page = 1; ; page++) {
      const r = await req.payload.find({ collection: 'pages', limit: 100, page, depth: 0, req })
      allContent += JSON.stringify(r.docs)
      if (page >= r.totalPages) break
    }
    for (let page = 1; ; page++) {
      const r = await req.payload.find({ collection: 'posts', limit: 100, page, depth: 0, req })
      allContent += JSON.stringify(r.docs)
      if (page >= r.totalPages) break
    }

    const allMedia: Array<{ id: number; filename?: string; filesize?: number; alt?: string; createdAt: string }> = []
    for (let page = 1; ; page++) {
      const r = await req.payload.find({ collection: 'media', limit: 100, page, depth: 0, req })
      allMedia.push(...(r.docs as typeof allMedia))
      if (page >= r.totalPages) break
    }

    const orphans: OrphanEntry[] = allMedia
      .filter((m) => {
        const referencedById = new RegExp(`\\b${m.id}\\b`).test(allContent)
        const referencedByFilename = m.filename ? allContent.includes(m.filename) : false
        return !referencedById && !referencedByFilename
      })
      .map((m) => ({
        id: String(m.id),
        filename: m.filename ?? '',
        filesize: m.filesize ?? 0,
        alt: m.alt ?? null,
        createdAt: m.createdAt,
      }))

    await writeAudit(req, {
      action: 'deep-media-cleanup:scan',
      status: 'success',
      detail: `Found ${orphans.length} orphaned media records`,
    })

    return Response.json({ orphans })
  }

  // Delete phase
  const body = (await req.json?.().catch(() => ({}))) as { ids?: unknown }
  const ids = Array.isArray(body?.ids) ? (body.ids as unknown[]).filter((v): v is string => typeof v === 'string') : []

  if (ids.length === 0) {
    return Response.json({ error: 'No IDs provided' }, { status: 400 })
  }

  let deletedCount = 0
  let freedBytes = 0
  const errors: string[] = []

  for (const id of ids) {
    try {
      const doc = await req.payload.findByID({ collection: 'media', id: Number(id), req })
      freedBytes += (doc.filesize as number | undefined) ?? 0
      await req.payload.delete({ collection: 'media', id: Number(id), req })
      deletedCount++
    } catch (err) {
      errors.push(`${id}: ${err instanceof Error ? err.message : 'failed'}`)
    }
  }

  await writeAudit(req, {
    action: 'deep-media-cleanup:delete',
    status: errors.length === ids.length ? 'error' : 'success',
    detail: `Deleted ${deletedCount}/${ids.length}, freed ${freedBytes} bytes`,
    params: { count: ids.length },
  })

  return Response.json({ deletedCount, freedBytes, errors })
}
