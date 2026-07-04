import type { PayloadRequest } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

import { admin, editor } from '../../access/admin'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// src/endpoints/system -> repo root -> public/media (mounted from the host media volume)
export const MEDIA_DIR = path.resolve(dirname, '../../../public/media')
// next image-optimization cache (the `next_cache` volume in production)
export const IMAGE_CACHE_DIR = path.resolve(dirname, '../../../.next/cache/images')

/**
 * Guard shared by every system endpoint. Returns a Response to short-circuit with
 * (401/403) or `null` when the caller is an authenticated admin.
 */
export function requireAdmin(req: PayloadRequest): Response | null {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // admin() only reads req.user; cast to satisfy the AccessArgs signature.
  if (!admin({ req } as Parameters<typeof admin>[0])) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

/** Like requireAdmin but allows editors (and admins) through. */
export function requireEditor(req: PayloadRequest): Response | null {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!editor({ req } as Parameters<typeof editor>[0])) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export type MediaUsage = {
  fileCount: number
  totalBytes: number
}

/** Recursively sum the size and count of every file under `dir`. */
export async function getMediaUsage(dir: string = MEDIA_DIR): Promise<MediaUsage> {
  let fileCount = 0
  let totalBytes = 0

  async function walk(current: string): Promise<void> {
    let entries: import('fs').Dirent[]
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile()) {
        try {
          const stat = await fs.stat(full)
          fileCount++
          totalBytes += stat.size
        } catch {
          /* file vanished between readdir and stat — ignore */
        }
      }
    }
  }

  await walk(dir)
  return { fileCount, totalBytes }
}

export type FsUsage = {
  totalBytes: number
  freeBytes: number
  availableBytes: number
}

/** Disk usage of the filesystem holding `dir` (the media volume). */
export async function getFsUsage(dir: string = MEDIA_DIR): Promise<FsUsage | null> {
  try {
    const stat = await fs.statfs(dir)
    const bsize = Number(stat.bsize)
    return {
      totalBytes: Number(stat.blocks) * bsize,
      freeBytes: Number(stat.bfree) * bsize,
      availableBytes: Number(stat.bavail) * bsize,
    }
  } catch {
    return null
  }
}
