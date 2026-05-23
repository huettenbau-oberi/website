import type { PayloadHandler } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { authenticated } from '../../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const MEDIA_DIR = path.resolve(dirname, '../../../public/media')

function collectDiskFiles(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectDiskFiles(full, base)
    return [path.relative(base, full)]
  })
}

export const cleanupMedia: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!authenticated({ req })) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const knownFiles = new Set<string>()
  let page = 1
  let hasMore = true

  while (hasMore) {
    const result = await req.payload.find({
      collection: 'media',
      limit: 100,
      page,
      req,
    })

    for (const doc of result.docs) {
      if (doc.filename) knownFiles.add(doc.filename as string)
      const sizes = doc.sizes as Record<string, { filename?: string }> | undefined
      if (sizes) {
        for (const size of Object.values(sizes)) {
          if (size?.filename) knownFiles.add(size.filename)
        }
      }
    }

    hasMore = page < result.totalPages
    page++
  }

  const diskFiles = collectDiskFiles(MEDIA_DIR)
  const orphans = diskFiles.filter((f) => !knownFiles.has(f))

  let deletedCount = 0
  let freedBytes = 0
  const errors: string[] = []

  for (const rel of orphans) {
    const full = path.join(MEDIA_DIR, rel)
    try {
      const stat = fs.statSync(full)
      freedBytes += stat.size
      fs.unlinkSync(full)
      deletedCount++
    } catch {
      errors.push(rel)
    }
  }

  return Response.json({ deletedCount, freedBytes, errors })
}
