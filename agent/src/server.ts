/**
 * Hüttenbau system agent — internal-only sidecar.
 *
 * Exposes a tiny HTTP API on the internal Docker network (never via Traefik) that the
 * Next.js app calls server-side with a shared secret:
 *   GET  /healthz            — unauthenticated liveness probe
 *   GET  /metrics            — read-only host metrics (disk, memory, cpu, containers)
 *   POST /ops/:name          — run ONE of a fixed allowlist of operations
 *
 * Security model:
 *   - Every request except /healthz must carry a matching `x-agent-secret` (timing-safe).
 *   - Container reads go through a read-only docker-socket-proxy (DOCKER_PROXY_URL);
 *     the raw Docker socket is never mounted here.
 *   - Heavy/destructive operations are delegated to existing GitHub Actions workflows
 *     via workflow_dispatch — this process holds only a fine-grained token and never
 *     runs a shell. `execFile`/`exec` are intentionally never imported.
 */
import http from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import { readFile, statfs } from 'node:fs/promises'
import os from 'node:os'

const PORT = Number(process.env.AGENT_PORT ?? 8080)
const SECRET = process.env.AGENT_SECRET ?? ''
const DOCKER_PROXY_URL = (process.env.DOCKER_PROXY_URL ?? '').replace(/\/$/, '')
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const GITHUB_REPO = process.env.GITHUB_REPO ?? '' // owner/repo
const GITHUB_REF = process.env.GITHUB_REF ?? 'main'
const ALLOWED_CONTAINERS = (process.env.ALLOWED_CONTAINERS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const DISK_PATHS = (process.env.DISK_PATHS ?? '/')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const MEMINFO_PATH = process.env.MEMINFO_PATH ?? '/proc/meminfo'
const BACKUP_RETENTION_DAYS = process.env.BACKUP_RETENTION_DAYS ?? '30'
// Host paths are bind-mounted read-only under this prefix (e.g. /host) so we can
// statfs them; strip it for display so the UI shows the real mount point.
const HOST_MOUNT_PREFIX = process.env.HOST_MOUNT_PREFIX ?? '/host'

function displayMount(mount: string): string {
  if (mount === HOST_MOUNT_PREFIX) return '/'
  if (mount.startsWith(`${HOST_MOUNT_PREFIX}/`)) return mount.slice(HOST_MOUNT_PREFIX.length)
  return mount
}

if (SECRET.length < 16) {
  console.error('FATAL: AGENT_SECRET is missing or shorter than 16 chars. Refusing to start.')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function secretMatches(provided: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(SECRET)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(payload)
}

async function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > 64 * 1024) throw new Error('Request body too large')
    chunks.push(chunk as Buffer)
  }
  if (!chunks.length) return {}
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// metrics
// ---------------------------------------------------------------------------
async function getDisks() {
  const disks: Array<{ mount: string; totalBytes: number; usedBytes: number; availableBytes: number }> = []
  for (const mount of DISK_PATHS) {
    try {
      const s = await statfs(mount)
      const bsize = Number(s.bsize)
      const total = Number(s.blocks) * bsize
      const free = Number(s.bfree) * bsize
      const available = Number(s.bavail) * bsize
      disks.push({ mount: displayMount(mount), totalBytes: total, usedBytes: total - free, availableBytes: available })
    } catch {
      /* path not mounted in this container — skip */
    }
  }
  return disks
}

async function getMemory() {
  try {
    const text = await readFile(MEMINFO_PATH, 'utf8')
    const read = (key: string): number | null => {
      const m = text.match(new RegExp(`^${key}:\\s+(\\d+)\\s+kB`, 'm'))
      return m ? Number(m[1]) * 1024 : null
    }
    const total = read('MemTotal')
    const available = read('MemAvailable')
    if (total !== null && available !== null) {
      return { totalBytes: total, freeBytes: available, usedBytes: total - available }
    }
  } catch {
    /* fall back to os module */
  }
  const total = os.totalmem()
  const free = os.freemem()
  return { totalBytes: total, freeBytes: free, usedBytes: total - free }
}

type DockerContainer = { Names?: string[]; State?: string; Status?: string }

async function getContainers() {
  if (!DOCKER_PROXY_URL) return []
  try {
    const res = await fetch(`${DOCKER_PROXY_URL}/containers/json?all=1`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const arr = (await res.json()) as DockerContainer[]
    return arr.map((c) => ({
      name: (c.Names?.[0] ?? '').replace(/^\//, ''),
      state: c.State ?? '',
      status: c.Status ?? '',
    }))
  } catch {
    return []
  }
}

async function getMetrics() {
  const [disks, memory, containers] = await Promise.all([getDisks(), getMemory(), getContainers()])
  return {
    disks,
    memory,
    cpu: { count: os.cpus().length, loadavg: os.loadavg() },
    uptimeSeconds: Math.round(os.uptime()),
    containers,
  }
}

// ---------------------------------------------------------------------------
// operations
// ---------------------------------------------------------------------------
type OpResult = { ok: true; detail: string; runUrl?: string }

async function dispatchWorkflow(workflowFile: string, inputs: Record<string, string>): Promise<string> {
  if (!GITHUB_TOKEN || !GITHUB_REPO) throw new Error('GitHub dispatch is not configured on the agent')
  const url = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflowFile}/dispatches`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
      'user-agent': 'huettenbau-system-agent',
    },
    body: JSON.stringify({ ref: GITHUB_REF, inputs }),
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status !== 204) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub dispatch failed (${res.status}): ${text.slice(0, 300)}`)
  }
  return `https://github.com/${GITHUB_REPO}/actions/workflows/${workflowFile}`
}

async function restartContainer(name: string): Promise<OpResult> {
  if (!ALLOWED_CONTAINERS.includes(name)) throw new Error(`Container "${name}" is not in the allowlist`)
  if (!DOCKER_PROXY_URL) throw new Error('Docker proxy is not configured on the agent')
  const res = await fetch(`${DOCKER_PROXY_URL}/containers/${encodeURIComponent(name)}/restart`, {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
  })
  if (res.status !== 204) {
    const text = await res.text().catch(() => '')
    throw new Error(`Restart failed (${res.status}): ${text.slice(0, 200)}`)
  }
  return { ok: true, detail: `Restarted container "${name}"` }
}

async function runOp(name: string, body: Record<string, unknown>): Promise<OpResult> {
  switch (name) {
    case 'restart-service': {
      const service = typeof body.service === 'string' ? body.service : ''
      if (!service) throw new Error('Missing "service"')
      return restartContainer(service)
    }
    case 'redeploy': {
      const runUrl = await dispatchWorkflow('pipeline.yaml', {})
      return { ok: true, detail: 'Triggered redeploy (pipeline.yaml)', runUrl }
    }
    case 'backup': {
      const runUrl = await dispatchWorkflow('backup.yaml', { retention_days: String(BACKUP_RETENTION_DAYS) })
      return { ok: true, detail: 'Triggered backup', runUrl }
    }
    case 'restore': {
      const s3Path = typeof body.path === 'string' ? body.path : ''
      if (!s3Path) throw new Error('Missing "path" (S3 path) for restore')
      const runUrl = await dispatchWorkflow('restore.yaml', { s3_path: s3Path })
      return { ok: true, detail: `Triggered restore from ${s3Path}`, runUrl }
    }
    case 'system-update': {
      const runUrl = await dispatchWorkflow('update.yaml', {})
      return { ok: true, detail: 'Triggered system update', runUrl }
    }
    default:
      throw new Error(`Unknown operation "${name}"`)
  }
}

// ---------------------------------------------------------------------------
// http server
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://agent')
    const pathname = url.pathname

    // Liveness probe — no auth so the container healthcheck stays simple.
    if (req.method === 'GET' && pathname === '/healthz') {
      return sendJson(res, 200, { ok: true })
    }

    // Authenticate everything else.
    const header = req.headers['x-agent-secret']
    const provided = Array.isArray(header) ? header[0] : (header ?? '')
    if (!provided || !secretMatches(provided)) {
      return sendJson(res, 401, { error: 'Unauthorized' })
    }

    if (req.method === 'GET' && pathname === '/metrics') {
      return sendJson(res, 200, await getMetrics())
    }

    const opMatch = pathname.match(/^\/ops\/([a-z][a-z-]{1,40})$/)
    if (req.method === 'POST' && opMatch) {
      const body = await readJsonBody(req)
      try {
        const result = await runOp(opMatch[1]!, body)
        return sendJson(res, 200, result)
      } catch (err) {
        return sendJson(res, 400, { error: err instanceof Error ? err.message : 'Operation failed' })
      }
    }

    return sendJson(res, 404, { error: 'Not found' })
  } catch {
    return sendJson(res, 500, { error: 'Internal error' })
  }
})

server.listen(PORT, () => {
  console.log(`system-agent listening on :${PORT}`)
})
