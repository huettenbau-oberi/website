import type { PayloadHandler } from 'payload'

import { getFsUsage, getMediaUsage, requireEditor } from './lib'

type PoolLike = {
  query: (text: string) => Promise<{ rows: Array<Record<string, unknown>> }>
}

// Collections to report record counts for on the dashboard.
const COUNTED_COLLECTIONS = ['pages', 'posts', 'media', 'categories', 'users'] as const

/**
 * GET /api/system/app-stats — read-only application metrics the container can gather
 * on its own: Postgres database size + largest tables, per-collection record counts,
 * media-volume disk usage + footprint, and the app process's own memory/uptime.
 */
export const appStats: PayloadHandler = async (req) => {
  const denied = requireEditor(req)
  if (denied) return denied

  // --- Database size + largest tables (raw SQL via the pg pool) ---
  let databaseBytes: number | null = null
  let tables: Array<{ name: string; bytes: number }> = []
  const pool = (req.payload.db as unknown as { pool?: PoolLike }).pool
  if (pool) {
    try {
      const sizeRes = await pool.query('SELECT pg_database_size(current_database()) AS size')
      databaseBytes = Number(sizeRes.rows[0]?.size ?? 0)

      const tableRes = await pool.query(`
        SELECT c.relname AS name, pg_total_relation_size(c.oid) AS bytes
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
        ORDER BY pg_total_relation_size(c.oid) DESC
        LIMIT 8
      `)
      tables = tableRes.rows.map((r) => ({ name: String(r.name), bytes: Number(r.bytes) }))
    } catch (err) {
      req.payload.logger.error({ err, msg: 'app-stats: database size query failed' })
    }
  }

  // --- Per-collection record counts ---
  const counts: Record<string, number> = {}
  await Promise.all(
    COUNTED_COLLECTIONS.map(async (collection) => {
      try {
        const res = await req.payload.count({ collection, req })
        counts[collection] = res.totalDocs
      } catch {
        /* collection may not exist in some envs — skip */
      }
    }),
  )

  // --- Media volume usage ---
  const [mediaUsage, fsUsage] = await Promise.all([getMediaUsage(), getFsUsage()])

  // --- App process metrics ---
  const mem = process.memoryUsage()

  return Response.json({
    database: {
      sizeBytes: databaseBytes,
      tables,
    },
    counts,
    media: {
      fileCount: mediaUsage.fileCount,
      footprintBytes: mediaUsage.totalBytes,
      volume: fsUsage,
    },
    process: {
      uptimeSeconds: Math.round(process.uptime()),
      rssBytes: mem.rss,
      heapUsedBytes: mem.heapUsed,
      nodeVersion: process.version,
    },
  })
}
