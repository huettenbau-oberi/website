'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import './index.scss'

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------
type AppStats = {
  database: { sizeBytes: number | null; tables: Array<{ name: string; bytes: number }> }
  counts: Record<string, number>
  media: {
    fileCount: number
    footprintBytes: number
    volume: { totalBytes: number; freeBytes: number; availableBytes: number } | null
  }
  process: { uptimeSeconds: number; rssBytes: number; heapUsedBytes: number; nodeVersion: string }
}

type HostMetrics = {
  disks: Array<{ mount: string; totalBytes: number; usedBytes: number; availableBytes: number }>
  memory: { totalBytes: number; freeBytes: number; usedBytes: number }
  cpu: { count: number; loadavg: [number, number, number] }
  uptimeSeconds: number
  containers: Array<{ name: string; state: string; status: string }>
}

type WorkflowRun = {
  id: number
  name: string
  workflow: string
  status: string
  conclusion: string | null
  actor: string
  event: string
  createdAt: string
  runUrl: string
  cmsActor?: string
}

type AgentSample = { ts: number; cpuPct: number; ramPct: number }

type BackupEntry = { name: string; date: string; sizeBytes: number }
type BackupManifest = { prefix: string; updatedAt: string; backups: BackupEntry[] }

type OrphanEntry = { id: string; filename: string; filesize: number; alt: string | null; createdAt: string }

type MetricSample = { pct: number; ts: number }

type Async<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; data: T }
  | { status: 'error'; message: string; code?: number }

type ActionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; message: string }
  | { status: 'error'; message: string }

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ${units[i]}`
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function workflowLabel(filename: string): string {
  const map: Record<string, string> = {
    'backup.yaml': 'Backup',
    'pipeline.yaml': 'Deploy',
    'restore.yaml': 'Restore',
    'update.yaml': 'System Update',
  }
  return map[filename] ?? filename.replace('.yaml', '')
}

function eventLabel(event: string): string {
  if (event === 'workflow_dispatch') return 'manual'
  if (event === 'schedule') return 'scheduled'
  return event
}

function conclusionTone(run: WorkflowRun): string {
  if (run.status === 'in_progress' || run.status === 'queued') return 'running'
  if (run.conclusion === 'success') return 'success'
  if (run.conclusion === 'failure') return 'failure'
  if (run.conclusion === 'cancelled') return 'cancelled'
  return 'other'
}

async function callJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    ;(err as Error & { code?: number }).code = res.status
    throw err
  }
  return data
}

// ---------------------------------------------------------------------------
// presentational
// ---------------------------------------------------------------------------
function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const tone = pct >= 90 ? 'danger' : pct >= 75 ? 'warn' : 'ok'
  return (
    <div className="system-panel__bar">
      <div className={`system-panel__bar-fill system-panel__bar-fill--${tone}`} style={{ width: `${pct}%` }} />
      <span className="system-panel__bar-label">{pct}%</span>
    </div>
  )
}

function MetricsChart({
  samples,
  tone,
  chartId,
}: {
  samples: MetricSample[]
  tone: 'ok' | 'warn' | 'danger'
  chartId: string
}) {
  const gradId = `mc-${chartId}-${tone}`
  const color =
    tone === 'danger'
      ? 'var(--theme-error-500)'
      : tone === 'warn'
        ? 'var(--theme-warning-500, #d98c0c)'
        : 'var(--theme-success-500)'

  const hasSamples = samples.length >= 2

  const pts = hasSamples
    ? samples.map((s, i) => ({
        x: (i / (samples.length - 1)) * 100,
        y: 100 - s.pct,
      }))
    : []

  const linePath = hasSamples
    ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
    : ''
  const areaPath = hasSamples
    ? `${linePath} L100,100 L0,100 Z`
    : ''

  const now = Date.now()
  const spanMs = hasSamples ? now - samples[0]!.ts : 0
  const spanMin = Math.round(spanMs / 60000)

  return (
    <div className="system-panel__metrics-chart-wrap">
      <svg
        className="system-panel__metrics-chart"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* horizontal grid lines at 25 / 50 / 75 % */}
        {[25, 50, 75].map((pct) => (
          <line
            key={pct}
            x1="0" y1={100 - pct} x2="100" y2={100 - pct}
            stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {hasSamples && (
          <>
            <path d={areaPath} fill={`url(#${gradId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
        {!hasSamples && (
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.15" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <div className="system-panel__metrics-chart-footer">
        {hasSamples ? (
          <>
            <span>0%</span>
            <span className="system-panel__metrics-chart-span">{spanMin > 0 ? `${spanMin}m history · ${samples.length} samples` : `${samples.length} samples`}</span>
            <span>100%</span>
          </>
        ) : (
          <span className="system-panel__metrics-chart-span">Collecting data…</span>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="system-panel__stat">
      <span className="system-panel__stat-label">{label}</span>
      <span className="system-panel__stat-value">{value}</span>
    </div>
  )
}

function ContainerList({
  containers,
  selected,
  onSelect,
}: {
  containers: Array<{ name: string; state: string; status: string }>
  selected: string
  onSelect: (name: string) => void
}) {
  if (containers.length === 0) {
    return <span className="system-panel__hint">No containers available.</span>
  }
  return (
    <div className="system-panel__container-list">
      {containers.map((c) => (
        <button
          key={c.name}
          type="button"
          className={`system-panel__container-row${selected === c.name ? ' system-panel__container-row--selected' : ''}`}
          onClick={() => onSelect(selected === c.name ? '' : c.name)}
        >
          <span
            className={`system-panel__status-dot system-panel__status-dot--${
              c.state === 'running' ? 'ok' : c.state === 'exited' ? 'stopped' : 'error'
            }`}
          />
          <strong className="system-panel__container-name">{c.name}</strong>
          <span className="system-panel__container-status">{c.status}</span>
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const SystemPanel: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = (user as { userRole?: string } | null)?.userRole === 'admin'

  const [stats, setStats] = useState<Async<AppStats>>({ status: 'idle' })
  const [host, setHost] = useState<Async<HostMetrics>>({ status: 'idle' })
  const [workflowRunsData, setWorkflowRunsData] = useState<Async<{ runs: WorkflowRun[]; error?: string }>>({ status: 'idle' })
  const [showAllRuns, setShowAllRuns] = useState(false)
  const [workflowFilter, setWorkflowFilter] = useState<string>('backup.yaml')
  const [userFilter, setUserFilter] = useState<string>('')
  const [backupManifest, setBackupManifest] = useState<Async<BackupManifest>>({ status: 'idle' })
  const [orphanScan, setOrphanScan] = useState<Async<OrphanEntry[]>>({ status: 'idle' })
  const [actions, setActions] = useState<Record<string, ActionState>>({})
  const [restartTarget, setRestartTarget] = useState<string>('')
  const [selectedBackup, setSelectedBackup] = useState<string>('')

  const [agentHistory, setAgentHistory] = useState<AgentSample[]>([])

  const setAction = useCallback((key: string, state: ActionState) => {
    setActions((prev) => ({ ...prev, [key]: state }))
  }, [])

  const loadStats = useCallback(async () => {
    setStats({ status: 'loading' })
    try {
      setStats({ status: 'done', data: await callJson<AppStats>('/api/system/app-stats') })
    } catch (err) {
      setStats({ status: 'error', message: err instanceof Error ? err.message : 'Failed to load' })
    }
  }, [])

  const loadHost = useCallback(async () => {
    setHost({ status: 'loading' })
    try {
      setHost({ status: 'done', data: await callJson<HostMetrics>('/api/system/host-metrics') })
    } catch (err) {
      const code = (err as { code?: number })?.code
      setHost({ status: 'error', message: err instanceof Error ? err.message : 'Failed to load', code })
    }
  }, [])

  const loadMetricsHistory = useCallback(async () => {
    try {
      const data = await callJson<{ samples: AgentSample[] }>('/api/system/metrics-history')
      setAgentHistory(data.samples)
    } catch {
      // silent — existing chart data stays visible on transient failures
    }
  }, [])

  const loadWorkflowRuns = useCallback(async () => {
    setWorkflowRunsData({ status: 'loading' })
    setShowAllRuns(false)
    setUserFilter('')
    try {
      setWorkflowRunsData({
        status: 'done',
        data: await callJson<{ runs: WorkflowRun[]; error?: string }>('/api/system/workflow-runs'),
      })
    } catch (err) {
      setWorkflowRunsData({ status: 'error', message: err instanceof Error ? err.message : 'Failed to load' })
    }
  }, [])

  const loadBackups = useCallback(async () => {
    setBackupManifest({ status: 'loading' })
    try {
      setBackupManifest({ status: 'done', data: await callJson<BackupManifest>('/api/system/backups') })
    } catch (err) {
      setBackupManifest({ status: 'error', message: err instanceof Error ? err.message : 'Failed to load' })
    }
  }, [])

  const refreshAll = useCallback(() => {
    void loadStats()
    void loadHost()
    void loadMetricsHistory()
    void loadWorkflowRuns()
    void loadBackups()
  }, [loadStats, loadHost, loadMetricsHistory, loadWorkflowRuns, loadBackups])

  useEffect(() => {
    if (!isAdmin) return
    refreshAll()
    const interval = setInterval(() => { void loadMetricsHistory() }, 30_000)
    return () => clearInterval(interval)
  }, [isAdmin, refreshAll, loadMetricsHistory])

  const runMaintenance = useCallback(
    async (key: string, url: string, confirmMsg?: string) => {
      if (confirmMsg && !window.confirm(confirmMsg)) return
      setAction(key, { status: 'loading' })
      try {
        const data = await callJson<{ deletedCount?: number; freedBytes?: number }>(url, { method: 'POST' })
        const detail =
          data.deletedCount != null
            ? `Removed ${data.deletedCount} file(s), freed ${formatBytes(data.freedBytes ?? 0)}`
            : 'Done'
        setAction(key, { status: 'done', message: detail })
        void loadStats()
      } catch (err) {
        setAction(key, { status: 'error', message: err instanceof Error ? err.message : 'Failed' })
      }
    },
    [setAction, loadStats],
  )

  const runOp = useCallback(
    async (name: string, opts?: { destructive?: boolean; extra?: Record<string, unknown> }) => {
      const body: Record<string, unknown> = { ...(opts?.extra ?? {}) }
      if (opts?.destructive) {
        const typed = window.prompt(`This is a destructive operation. Type "${name}" to confirm:`)
        if (typed !== name) return
        body.confirm = name
      } else if (!window.confirm(`Run "${name}"?`)) {
        return
      }
      setAction(name, { status: 'loading' })
      try {
        const data = await callJson<{ detail?: string; runUrl?: string }>(`/api/system/ops/${name}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        })
        setAction(name, { status: 'done', message: data.detail || data.runUrl || 'Triggered' })
      } catch (err) {
        setAction(name, { status: 'error', message: err instanceof Error ? err.message : 'Failed' })
      }
    },
    [setAction],
  )

  const runDeepScan = useCallback(async () => {
    setOrphanScan({ status: 'loading' })
    setAction('deep-media-delete', { status: 'idle' })
    try {
      const data = await callJson<{ orphans: OrphanEntry[] }>('/api/system/deep-media-cleanup?dry_run=true', {
        method: 'POST',
      })
      setOrphanScan({ status: 'done', data: data.orphans })
    } catch (err) {
      setOrphanScan({ status: 'error', message: err instanceof Error ? err.message : 'Scan failed' })
    }
  }, [setAction])

  const runDeepDelete = useCallback(
    async (ids: string[]) => {
      if (!window.confirm(`Permanently delete ${ids.length} media record${ids.length !== 1 ? 's' : ''}? This cannot be undone.`)) return
      setAction('deep-media-delete', { status: 'loading' })
      try {
        const data = await callJson<{ deletedCount: number; freedBytes: number; errors: string[] }>(
          '/api/system/deep-media-cleanup',
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids }),
          },
        )
        setAction('deep-media-delete', {
          status: 'done',
          message: `Deleted ${data.deletedCount}, freed ${formatBytes(data.freedBytes)}${data.errors.length ? ` (${data.errors.length} error(s))` : ''}`,
        })
        setOrphanScan({ status: 'idle' })
        void loadStats()
      } catch (err) {
        setAction('deep-media-delete', { status: 'error', message: err instanceof Error ? err.message : 'Delete failed' })
      }
    },
    [setAction, loadStats],
  )

  if (!isAdmin) return null

  const s = stats.status === 'done' ? stats.data : null
  const h = host.status === 'done' ? host.data : null
  const containers = h?.containers ?? []
  const agentMissing = host.status === 'error' && host.code === 503
  const runs = workflowRunsData.status === 'done' ? workflowRunsData.data.runs : []
  const runsError = workflowRunsData.status === 'done' ? workflowRunsData.data.error : undefined
  const uniqueWorkflows = Array.from(new Set(runs.map((r) => r.workflow))).sort()
  const uniqueUsers = Array.from(
    new Set(runs.map((r) => r.cmsActor ?? r.actor).filter(Boolean)),
  ).sort()
  const filteredRuns = runs.filter((r) => {
    if (workflowFilter && r.workflow !== workflowFilter) return false
    if (userFilter && (r.cmsActor ?? r.actor) !== userFilter) return false
    return true
  })
  const RUNS_INITIAL = 10
  const visibleRuns = showAllRuns ? filteredRuns : filteredRuns.slice(0, RUNS_INITIAL)
  const hiddenRunCount = filteredRuns.length - RUNS_INITIAL
  const manifest = backupManifest.status === 'done' ? backupManifest.data : null
  const isRefreshing =
    stats.status === 'loading' ||
    host.status === 'loading' ||
    workflowRunsData.status === 'loading' ||
    backupManifest.status === 'loading'

  return (
    <div className="system-panel">
      {/* ----------------------------- System ----------------------------- */}
      <div className="system-panel__header">
        <p className="system-panel__section-label" style={{ margin: 0 }}>System</p>
        <button
          className="system-panel__refresh"
          onClick={refreshAll}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="system-panel__grid">
        {/* Storage */}
        <div className="system-panel__card">
          <strong className="system-panel__card-title">Storage</strong>
          {s ? (
            <>
              <Stat label="Media files" value={s.media.fileCount.toLocaleString()} />
              <Stat label="Media footprint" value={formatBytes(s.media.footprintBytes)} />
              {s.media.volume && (
                <div className="system-panel__usage">
                  <UsageBar used={s.media.volume.totalBytes - s.media.volume.freeBytes} total={s.media.volume.totalBytes} />
                  <span className="system-panel__hint">
                    {formatBytes(s.media.volume.totalBytes - s.media.volume.freeBytes)} / {formatBytes(s.media.volume.totalBytes)} used
                  </span>
                </div>
              )}
            </>
          ) : (
            <span className="system-panel__hint">{stats.status === 'error' ? stats.message : 'Loading…'}</span>
          )}
        </div>

        {/* Database */}
        <div className="system-panel__card">
          <strong className="system-panel__card-title">Database</strong>
          {s ? (
            <>
              <Stat label="Total size" value={formatBytes(s.database.sizeBytes)} />
              {s.database.tables.slice(0, 3).map((t) => (
                <Stat key={t.name} label={t.name} value={formatBytes(t.bytes)} />
              ))}
            </>
          ) : (
            <span className="system-panel__hint">{stats.status === 'error' ? stats.message : 'Loading…'}</span>
          )}
        </div>

        {/* Content */}
        <div className="system-panel__card">
          <strong className="system-panel__card-title">Content</strong>
          {s ? (
            Object.entries(s.counts).map(([name, count]) => (
              <Stat key={name} label={name} value={count.toLocaleString()} />
            ))
          ) : (
            <span className="system-panel__hint">{stats.status === 'error' ? stats.message : 'Loading…'}</span>
          )}
        </div>

        {/* Health */}
        <div className="system-panel__card">
          <strong className="system-panel__card-title">Health</strong>
          {h ? (
            <>
              <Stat label="Host uptime" value={formatUptime(h.uptimeSeconds)} />
              <Stat label="Containers" value={`${h.containers.filter((c) => c.state === 'running').length} / ${h.containers.length} running`} />
            </>
          ) : agentMissing ? (
            <span className="system-panel__hint">System agent not configured.</span>
          ) : (
            <span className="system-panel__hint">{host.status === 'error' ? host.message : 'Loading…'}</span>
          )}
          {s && (
            <>
              <Stat label="App uptime" value={formatUptime(s.process.uptimeSeconds)} />
              <Stat label="App memory" value={formatBytes(s.process.rssBytes)} />
            </>
          )}
        </div>

        {/* Host disks */}
        {h && h.disks.length > 0 && (
          <div className="system-panel__card">
            <strong className="system-panel__card-title">Host disks</strong>
            {h.disks.map((d) => (
              <div className="system-panel__usage" key={d.mount}>
                <span className="system-panel__hint system-panel__hint--strong">{d.mount}</span>
                <UsageBar used={d.usedBytes} total={d.totalBytes} />
                <span className="system-panel__hint">
                  {formatBytes(d.usedBytes)} / {formatBytes(d.totalBytes)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Metrics — full-width history card */}
        {(() => {
          const ramPct = h ? Math.min(100, Math.round((h.memory.usedBytes / Math.max(1, h.memory.totalBytes)) * 100)) : 0
          const cpuPct = h ? Math.min(100, Math.round((h.cpu.loadavg[0] / Math.max(1, h.cpu.count)) * 100)) : 0
          const ramTone: 'ok' | 'warn' | 'danger' = ramPct >= 90 ? 'danger' : ramPct >= 75 ? 'warn' : 'ok'
          const cpuTone: 'ok' | 'warn' | 'danger' = cpuPct >= 90 ? 'danger' : cpuPct >= 75 ? 'warn' : 'ok'
          const ramSamples: MetricSample[] = agentHistory.map((s) => ({ pct: s.ramPct, ts: s.ts }))
          const cpuSamples: MetricSample[] = agentHistory.map((s) => ({ pct: s.cpuPct, ts: s.ts }))
          return (
            <div className="system-panel__card system-panel__card--metrics">
              <strong className="system-panel__card-title">Metrics</strong>
              {(h || agentMissing || host.status === 'error') ? (
                agentMissing ? (
                  <span className="system-panel__hint">System agent not configured — host metrics unavailable.</span>
                ) : host.status === 'error' ? (
                  <span className="system-panel__hint">{(host as { message: string }).message}</span>
                ) : (
                  <div className="system-panel__metrics-panels">
                    <div className="system-panel__metrics-panel">
                      <div className="system-panel__metrics-header">
                        <span className="system-panel__metrics-label">RAM</span>
                        <span className={`system-panel__metrics-big system-panel__metrics-big--${ramTone}`}>{ramPct}%</span>
                        <span className="system-panel__metrics-detail">
                          {formatBytes(h!.memory.usedBytes)} / {formatBytes(h!.memory.totalBytes)}
                        </span>
                      </div>
                      <MetricsChart samples={ramSamples} tone={ramTone} chartId="ram" />
                    </div>
                    <div className="system-panel__metrics-panel">
                      <div className="system-panel__metrics-header">
                        <span className="system-panel__metrics-label">CPU</span>
                        <span className={`system-panel__metrics-big system-panel__metrics-big--${cpuTone}`}>{cpuPct}%</span>
                        <span className="system-panel__metrics-detail">
                          load {h!.cpu.loadavg[0].toFixed(2)} · {h!.cpu.count} cores
                        </span>
                      </div>
                      <MetricsChart samples={cpuSamples} tone={cpuTone} chartId="cpu" />
                    </div>
                  </div>
                )
              ) : (
                <span className="system-panel__hint">Loading…</span>
              )}
            </div>
          )
        })()}
      </div>

      {/* --------------------------- Maintenance -------------------------- */}
      <p className="system-panel__section-label">Maintenance</p>
      <div className="system-panel__actions">
        <ActionRow
          title="Media Cleanup"
          desc="Delete files on disk that have no matching media record in the database."
          state={actions['cleanup']}
          buttonLabel="Run Cleanup"
          onClick={() => runMaintenance('cleanup', '/api/media/cleanup')}
        />

        {/* Deep media cleanup — two-phase scan → delete */}
        <div className="system-panel__action system-panel__action--column">
          <div className="system-panel__action-info">
            <strong className="system-panel__action-title">Deep Media Cleanup</strong>
            <span className="system-panel__action-desc">
              Find media records with no references in any page or post, then remove them permanently.
            </span>
          </div>

          {orphanScan.status === 'idle' && (
            <div className="system-panel__action-control">
              {actions['deep-media-delete']?.status === 'done' && (
                <span className="system-panel__result">{actions['deep-media-delete'].message}</span>
              )}
              <button className="system-panel__btn" onClick={runDeepScan}>
                Scan for orphaned media
              </button>
            </div>
          )}

          {orphanScan.status === 'loading' && (
            <span className="system-panel__hint">Scanning all content for media references…</span>
          )}

          {orphanScan.status === 'error' && (
            <div className="system-panel__action-control">
              <span className="system-panel__result system-panel__result--error">{orphanScan.message}</span>
              <button className="system-panel__btn" onClick={runDeepScan}>Retry</button>
            </div>
          )}

          {orphanScan.status === 'done' && (
            <>
              {orphanScan.data.length === 0 ? (
                <div className="system-panel__action-control">
                  <span className="system-panel__result">No orphaned media found.</span>
                  <button className="system-panel__btn" onClick={runDeepScan}>Rescan</button>
                </div>
              ) : (
                <div className="system-panel__orphan-list">
                  {orphanScan.data.slice(0, 8).map((m) => (
                    <div key={m.id} className="system-panel__orphan-row">
                      <span className="system-panel__orphan-name">{m.filename}</span>
                      <span className="system-panel__orphan-size">{formatBytes(m.filesize)}</span>
                      {m.alt && <span className="system-panel__orphan-alt">{m.alt}</span>}
                    </div>
                  ))}
                  {orphanScan.data.length > 8 && (
                    <span className="system-panel__hint">…and {orphanScan.data.length - 8} more</span>
                  )}
                  <div className="system-panel__action-control" style={{ marginTop: '0.5rem' }}>
                    {actions['deep-media-delete']?.status === 'error' && (
                      <span className="system-panel__result system-panel__result--error">
                        {actions['deep-media-delete'].message}
                      </span>
                    )}
                    <button
                      className="system-panel__btn"
                      onClick={runDeepScan}
                      disabled={actions['deep-media-delete']?.status === 'loading'}
                    >
                      Rescan
                    </button>
                    <ActionButton
                      state={actions['deep-media-delete']}
                      label={`Delete ${orphanScan.data.length} item${orphanScan.data.length !== 1 ? 's' : ''}`}
                      danger
                      onClick={() => runDeepDelete(orphanScan.data.map((m) => m.id))}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <ActionRow
          title="Clear Image Cache"
          desc="Empty the Next.js image-optimization cache. Images regenerate on demand."
          state={actions['clear-image-cache']}
          buttonLabel="Clear Cache"
          onClick={() => runMaintenance('clear-image-cache', '/api/system/clear-image-cache')}
        />
        <ActionRow
          title="Revalidate Site"
          desc="Purge the Next.js route cache for the whole site."
          state={actions['revalidate']}
          buttonLabel="Revalidate"
          onClick={() => runMaintenance('revalidate', '/api/system/revalidate')}
        />
      </div>

      {/* ---------------------------- Operations -------------------------- */}
      <p className="system-panel__section-label">Operations</p>
      {agentMissing && (
        <p className="system-panel__hint system-panel__hint--block">
          The system agent is not configured, so operations cannot run from here.
        </p>
      )}
      <div className="system-panel__actions">
        {/* Restart Service — visual container list */}
        <div className="system-panel__action system-panel__action--column">
          <div className="system-panel__action-info">
            <strong className="system-panel__action-title">Restart Service</strong>
            <span className="system-panel__action-desc">Restart a single container on the host.</span>
          </div>
          <ContainerList containers={containers} selected={restartTarget} onSelect={setRestartTarget} />
          {restartTarget && (
            <div className="system-panel__action-control">
              {actions['restart-service']?.status === 'done' && (
                <span className="system-panel__result">{actions['restart-service'].message}</span>
              )}
              {actions['restart-service']?.status === 'error' && (
                <span className="system-panel__result system-panel__result--error">
                  {actions['restart-service'].message}
                </span>
              )}
              <ActionButton
                state={actions['restart-service']}
                label={`Restart "${restartTarget}"`}
                onClick={() => runOp('restart-service', { extra: { service: restartTarget } })}
              />
            </div>
          )}
        </div>

        <ActionRow
          title="Redeploy"
          desc="Rebuild and deploy the latest application image (pipeline.yaml)."
          state={actions['redeploy']}
          buttonLabel="Redeploy"
          onClick={() => runOp('redeploy')}
        />
        <ActionRow
          title="Backup"
          desc="Trigger an encrypted backup to object storage (backup.yaml)."
          state={actions['backup']}
          buttonLabel="Run Backup"
          onClick={() => runOp('backup')}
        />
        <ActionRow
          title="System Update"
          desc="Patch the host and restart services (reboots if required). Destructive."
          state={actions['system-update']}
          buttonLabel="Update System"
          danger
          onClick={() => runOp('system-update', { destructive: true })}
        />

        {/* Restore — select from backup list or manual entry */}
        <div className="system-panel__action">
          <div className="system-panel__action-info">
            <strong className="system-panel__action-title">Restore</strong>
            <span className="system-panel__action-desc">
              Restore from an encrypted backup in object storage. Destructive — overwrites current data.
            </span>
          </div>
          <div className="system-panel__action-control">
            {actions['restore']?.status === 'done' && (
              <span className="system-panel__result">{actions['restore'].message}</span>
            )}
            {actions['restore']?.status === 'error' && (
              <span className="system-panel__result system-panel__result--error">{actions['restore'].message}</span>
            )}
            <ActionButton
              state={actions['restore']}
              label={selectedBackup ? `Restore "${selectedBackup}"` : 'Restore…'}
              danger
              onClick={async () => {
                let path: string | null
                if (selectedBackup && manifest) {
                  path = `/${manifest.prefix}/${selectedBackup}`
                } else {
                  path = window.prompt('Absolute S3 path of the backup to restore:')
                }
                if (!path) return
                await runOp('restore', { destructive: true, extra: { path } })
              }}
            />
          </div>
        </div>
      </div>

      {/* --------------------------- Recent Activity ---------------------- */}
      <div className="system-panel__activity-header">
        <p className="system-panel__section-label" style={{ margin: 0 }}>Recent Activity</p>
        {workflowRunsData.status === 'done' && runs.length > 0 && (
          <div className="system-panel__activity-filters">
            <select
              className="system-panel__select"
              value={workflowFilter}
              onChange={(e) => { setWorkflowFilter(e.target.value); setShowAllRuns(false) }}
            >
              <option value="">All workflows</option>
              {uniqueWorkflows.map((wf) => (
                <option key={wf} value={wf}>{workflowLabel(wf)}</option>
              ))}
            </select>
            <select
              className="system-panel__select"
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setShowAllRuns(false) }}
            >
              <option value="">All users</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {runsError && (
        <p className="system-panel__hint system-panel__hint--block system-panel__hint--warn">
          Could not fetch runs: {runsError}
        </p>
      )}
      {visibleRuns.length > 0 ? (
        <>
          <div className="system-panel__runs">
            {visibleRuns.map((run) => (
              <button
                key={run.id}
                type="button"
                className={`system-panel__run-row${run.event === 'workflow_dispatch' ? ' system-panel__run-row--manual' : ''}`}
                onClick={() => window.open(run.runUrl, '_blank', 'noopener')}
              >
                <span className={`system-panel__badge system-panel__badge--${conclusionTone(run)}`}>
                  {run.conclusion ?? run.status}
                </span>
                <span className="system-panel__run-workflow">{run.name || workflowLabel(run.workflow)}</span>
                <span className="system-panel__run-actor" title={run.cmsActor ? `CMS: ${run.cmsActor}` : undefined}>
                  {run.event === 'schedule'
                    ? 'scheduled'
                    : run.cmsActor
                      ? run.cmsActor
                      : run.actor || '—'}
                </span>
                <span className="system-panel__run-event">{eventLabel(run.event)}</span>
                <span className="system-panel__run-time">{timeAgo(run.createdAt)}</span>
              </button>
            ))}
          </div>
          {!showAllRuns && hiddenRunCount > 0 && (
            <button className="system-panel__show-more" onClick={() => setShowAllRuns(true)}>
              Show {hiddenRunCount} more
            </button>
          )}
        </>
      ) : workflowRunsData.status === 'loading' ? (
        <span className="system-panel__hint">Loading activity…</span>
      ) : filteredRuns.length === 0 && runs.length > 0 ? (
        <span className="system-panel__hint">No runs match the selected filters.</span>
      ) : !runsError ? (
        <span className="system-panel__hint">No recent workflow runs found.</span>
      ) : null}

      {/* ----------------------------- Backups ---------------------------- */}
      <p className="system-panel__section-label">Backups</p>
      {manifest ? (
        <div className="system-panel__card">
          <div className="system-panel__backup-meta">
            <Stat label="Total backups" value={manifest.backups.length} />
            <Stat label="Total size" value={formatBytes(manifest.backups.reduce((s, b) => s + b.sizeBytes, 0))} />
            {manifest.updatedAt && (
              <span className="system-panel__hint" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                Updated {timeAgo(manifest.updatedAt)}
              </span>
            )}
          </div>
          {manifest.backups.length > 0 && (
            <div className="system-panel__backup-list">
              {manifest.backups.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  className={`system-panel__backup-row${selectedBackup === b.name ? ' system-panel__backup-row--selected' : ''}`}
                  onClick={() => setSelectedBackup((prev) => (prev === b.name ? '' : b.name))}
                >
                  <span className="system-panel__backup-name">{b.name}</span>
                  <span className="system-panel__backup-size">{formatBytes(b.sizeBytes)}</span>
                  <span className="system-panel__backup-date">
                    {new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedBackup && (
            <p className="system-panel__hint" style={{ marginTop: '0.5rem' }}>
              Selected: <strong>{selectedBackup}</strong> — use the Restore button in Operations above.
            </p>
          )}
        </div>
      ) : backupManifest.status === 'error' ? (
        <span className="system-panel__hint">{backupManifest.message}</span>
      ) : backupManifest.status === 'loading' ? (
        <span className="system-panel__hint">Loading backups…</span>
      ) : (
        <span className="system-panel__hint">No backup manifest available yet.</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// small building blocks
// ---------------------------------------------------------------------------
function ActionButton({
  state,
  label,
  onClick,
  danger,
  disabled,
}: {
  state?: ActionState
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  const loading = state?.status === 'loading'
  return (
    <button
      className={`system-panel__btn${danger ? ' system-panel__btn--danger' : ''}`}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading ? 'Running…' : label}
    </button>
  )
}

function ActionRow({
  title,
  desc,
  state,
  buttonLabel,
  onClick,
  danger,
}: {
  title: string
  desc: string
  state?: ActionState
  buttonLabel: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <div className="system-panel__action">
      <div className="system-panel__action-info">
        <strong className="system-panel__action-title">{title}</strong>
        <span className="system-panel__action-desc">{desc}</span>
      </div>
      <div className="system-panel__action-control">
        {state && state.status === 'done' && (
          <span className="system-panel__result">{state.message}</span>
        )}
        {state && state.status === 'error' && (
          <span className="system-panel__result system-panel__result--error">{state.message}</span>
        )}
        <ActionButton state={state} label={buttonLabel} onClick={onClick} danger={danger} />
      </div>
    </div>
  )
}

export default SystemPanel
