/**
 * Server-only client for the system sidecar agent.
 *
 * SECURITY: this module must never be imported into a client component. It holds the
 * shared secret used to authenticate to the agent and talks to it over the internal
 * Docker network only. It is only ever imported by server-side Payload endpoint
 * handlers; the browser reaches these via `/api/system/*` and never sees
 * `SYSTEM_AGENT_URL`/`SYSTEM_AGENT_SECRET`.
 */
const AGENT_URL = process.env.SYSTEM_AGENT_URL
const AGENT_SECRET = process.env.SYSTEM_AGENT_SECRET

export type AgentResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string }

export function isAgentConfigured(): boolean {
  return Boolean(AGENT_URL && AGENT_SECRET)
}

async function call<T>(path: string, init: RequestInit): Promise<AgentResult<T>> {
  if (!AGENT_URL || !AGENT_SECRET) {
    return { ok: false, status: 503, error: 'System agent is not configured' }
  }

  try {
    const res = await fetch(`${AGENT_URL}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-agent-secret': AGENT_SECRET,
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })

    const text = await res.text()
    const data = text ? JSON.parse(text) : null

    if (!res.ok) {
      const error =
        (data && typeof data === 'object' && 'error' in data && String(data.error)) ||
        `Agent responded with ${res.status}`
      return { ok: false, status: res.status, error }
    }

    return { ok: true, data: data as T }
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : 'System agent is unreachable',
    }
  }
}

export type HostMetrics = {
  disks: Array<{ mount: string; totalBytes: number; usedBytes: number; availableBytes: number }>
  memory: { totalBytes: number; freeBytes: number; usedBytes: number }
  cpu: { count: number; loadavg: [number, number, number] }
  uptimeSeconds: number
  containers: Array<{ name: string; state: string; status: string }>
}

export function getHostMetrics(): Promise<AgentResult<HostMetrics>> {
  return call<HostMetrics>('/metrics', { method: 'GET' })
}

export type HistorySample = { ts: number; cpuPct: number; ramPct: number }

export function getMetricsHistory(): Promise<AgentResult<{ samples: HistorySample[] }>> {
  return call<{ samples: HistorySample[] }>('/history', { method: 'GET' })
}

export type OpResult = { ok: boolean; detail?: string; runUrl?: string }

export function runOp(name: string, body: Record<string, unknown>): Promise<AgentResult<OpResult>> {
  return call<OpResult>(`/ops/${encodeURIComponent(name)}`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  })
}

export type WorkflowRun = {
  id: number
  name: string
  workflow: string
  status: string
  conclusion: string | null
  actor: string
  event: string
  createdAt: string
  runUrl: string
}

export function getWorkflowRuns(): Promise<AgentResult<{ runs: WorkflowRun[]; error?: string }>> {
  return call<{ runs: WorkflowRun[]; error?: string }>('/workflow-runs', { method: 'GET' })
}

export type BackupEntry = { name: string; date: string; sizeBytes: number }
export type BackupManifest = { prefix: string; updatedAt: string; backups: BackupEntry[] }

export function getBackups(): Promise<AgentResult<BackupManifest>> {
  return call<BackupManifest>('/backups', { method: 'GET' })
}
