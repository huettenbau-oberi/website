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

export type ContainerResources = {
  // Memory the container is currently using vs. the applied hard limit (bytes).
  memory: { usageBytes: number | null; limitBytes: number | null }
  // CPU the container is currently using vs. the applied limit, expressed in cores
  // (1.0 = one full core).
  cpu: { limitCores: number | null; usageCores: number | null }
}

// cgroup v2 unified hierarchy. Modern Docker gives each container its own cgroup
// namespace, so these paths report *this* container's applied limits — which differ
// per environment (devt vs prod) exactly as configured in the compose deploy limits.
const CGROUP_ROOT = '/sys/fs/cgroup'

async function readCgroup(file: string): Promise<string | null> {
  try {
    return (await fs.readFile(`${CGROUP_ROOT}/${file}`, 'utf8')).trim()
  } catch {
    return null
  }
}

async function readCpuUsageUsec(): Promise<number | null> {
  const stat = await readCgroup('cpu.stat')
  if (!stat) return null
  const m = stat.match(/^usage_usec\s+(\d+)/m)
  return m ? Number(m[1]) : null
}

/**
 * Read the app container's own cgroup (v2) limits and live usage. Every field
 * degrades to `null` when the file is absent (non-Linux local dev) or the resource
 * is uncapped ("max"), so callers can simply hide what isn't available.
 */
export async function getContainerResources(): Promise<ContainerResources> {
  // --- Memory: instantaneous, and the failure mode that matters (OOM kill) ---
  let usageBytes: number | null = null
  let limitBytes: number | null = null
  const current = await readCgroup('memory.current')
  if (current && /^\d+$/.test(current)) usageBytes = Number(current)
  const max = await readCgroup('memory.max')
  if (max && max !== 'max' && /^\d+$/.test(max)) limitBytes = Number(max)

  // --- CPU limit: cpu.max is "quota period" (µs) or "max period" when uncapped ---
  let limitCores: number | null = null
  const cpuMax = await readCgroup('cpu.max')
  if (cpuMax) {
    const [quota, period] = cpuMax.split(/\s+/)
    const q = Number(quota)
    const p = Number(period)
    if (quota !== 'max' && Number.isFinite(q) && p > 0) limitCores = q / p
  }

  // --- CPU usage: derive cores-in-use from the delta of the cumulative counter ---
  let usageCores: number | null = null
  const first = await readCpuUsageUsec()
  if (first != null) {
    const startedAt = Date.now()
    await new Promise((resolve) => setTimeout(resolve, 150))
    const second = await readCpuUsageUsec()
    const elapsedUs = (Date.now() - startedAt) * 1000
    if (second != null && elapsedUs > 0) {
      usageCores = Math.max(0, (second - first) / elapsedUs)
    }
  }

  return {
    memory: { usageBytes, limitBytes },
    cpu: { limitCores, usageCores },
  }
}
