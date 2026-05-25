import type { PayloadHandler } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import { authenticated } from '../../access/authenticated'

const fileUrl = fileURLToPath(import.meta.url)
const dirname = path.dirname(fileUrl)
const MEDIA_DIR = path.resolve(dirname, '../../../public/media')
const MEDIA_URL_BASE = '/media'

export const renameMedia: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!authenticated({ req })) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const id = req.routeParams?.id as string
  const body = await req.json?.().catch(() => null)
  const newBaseName: string = (body?.name ?? '').trim()

  if (!newBaseName || !/^[a-zA-Z0-9._-]+$/.test(newBaseName) || newBaseName.length > 200) {
    return Response.json(
      { error: 'Invalid name. Use only letters, numbers, hyphens, underscores, and dots.' },
      { status: 400 },
    )
  }

  const doc = await req.payload.findByID({ collection: 'media', id, req })

  if (!doc?.filename) {
    return Response.json({ error: 'Media not found' }, { status: 404 })
  }

  const oldFilename = doc.filename as string
  const ext = path.extname(oldFilename)
  const oldBase = path.basename(oldFilename, ext)
  const newFilename = `${newBaseName}${ext}`

  if (newFilename === oldFilename) {
    return Response.json({ filename: oldFilename })
  }

  type SizeName = 'thumbnail' | 'square' | 'small' | 'medium' | 'large' | 'xlarge' | 'og'
  type SizeEntry = { oldFilename: string; newFilename: string; sizeName: SizeName }

  const renames: { old: string; new: string }[] = [{ old: oldFilename, new: newFilename }]
  const sizeEntries: SizeEntry[] = []

  const sizes = doc.sizes as Record<SizeName, { filename?: string | null; url?: string | null }> | undefined
  if (sizes) {
    for (const [sizeName, size] of Object.entries(sizes) as [SizeName, { filename?: string | null }][]) {
      if (!size?.filename) continue
      const sizeOldFilename = size.filename
      const newSizeFilename = sizeOldFilename.startsWith(oldBase)
        ? newBaseName + sizeOldFilename.slice(oldBase.length)
        : sizeOldFilename
      renames.push({ old: sizeOldFilename, new: newSizeFilename })
      sizeEntries.push({ oldFilename: sizeOldFilename, newFilename: newSizeFilename, sizeName })
    }
  }

  // Check for disk conflicts
  for (const rename of renames) {
    if (rename.old !== rename.new && existsSync(path.join(MEDIA_DIR, rename.new))) {
      return Response.json({ error: `A file named "${rename.new}" already exists.` }, { status: 409 })
    }
  }

  // Rename files on disk (with rollback on failure)
  const completed: { old: string; new: string }[] = []
  try {
    for (const rename of renames) {
      if (rename.old === rename.new) continue
      const oldPath = path.join(MEDIA_DIR, rename.old)
      const newPath = path.join(MEDIA_DIR, rename.new)
      if (existsSync(oldPath)) {
        await fs.rename(oldPath, newPath)
        completed.push(rename)
      }
    }
  } catch {
    for (const done of completed.reverse()) {
      try { await fs.rename(path.join(MEDIA_DIR, done.new), path.join(MEDIA_DIR, done.old)) } catch { /* ignore */ }
    }
    return Response.json({ error: 'Failed to rename files on disk.' }, { status: 500 })
  }

  // Build the sizes update object
  const sizesUpdate: Record<string, { filename: string; url: string }> = {}
  for (const entry of sizeEntries) {
    sizesUpdate[entry.sizeName] = {
      filename: entry.newFilename,
      url: `${MEDIA_URL_BASE}/${entry.newFilename}`,
    }
  }

  // Update the database
  try {
    await req.payload.update({
      collection: 'media',
      id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { filename: newFilename, url: `${MEDIA_URL_BASE}/${newFilename}`, sizes: sizesUpdate } as any,
      req,
    })
  } catch {
    // Rollback disk renames
    for (const done of completed.reverse()) {
      try { await fs.rename(path.join(MEDIA_DIR, done.new), path.join(MEDIA_DIR, done.old)) } catch { /* ignore */ }
    }
    return Response.json({ error: 'Failed to update database.' }, { status: 500 })
  }

  return Response.json({ filename: newFilename })
}
