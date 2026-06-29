'use client'
import React, { useCallback, useEffect, useState } from 'react'
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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="system-panel__stat">
      <span className="system-panel__stat-label">{label}</span>
      <span className="system-panel__stat-value">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const SystemPanel: React.FC = () => {
  const { user } = useAuth()
  // `userRole` drives the three-tier access system; read loosely since generated types may lag.
  const isAdmin = (user as { userRole?: string } | null)?.userRole === 'admin'

  const [stats, setStats] = useState<Async<AppStats>>({ status: 'idle' })
  const [host, setHost] = useState<Async<HostMetrics>>({ status: 'idle' })
  const [actions, setActions] = useState<Record<string, ActionState>>({})
  const [restartTarget, setRestartTarget] = useState<string>('')

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

  useEffect(() => {
    if (!isAdmin) return
    void loadStats()
    void loadHost()
  }, [isAdmin, loadStats, loadHost])

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

  if (!isAdmin) return null

  const s = stats.status === 'done' ? stats.data : null
  const h = host.status === 'done' ? host.data : null
  const containers = h?.containers ?? []

  return (
    <div className="system-panel">
      {/* ----------------------------- System ----------------------------- */}
      <div className="system-panel__header">
        <p className="system-panel__section-label">System</p>
        <button
          className="system-panel__refresh"
          onClick={() => {
            void loadStats()
            void loadHost()
          }}
          disabled={stats.status === 'loading' || host.status === 'loading'}
        >
          {stats.status === 'loading' || host.status === 'loading' ? 'Refreshing…' : 'Refresh'}
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

        {/* Health (host) */}
        <div className="system-panel__card">
          <strong className="system-panel__card-title">Health</strong>
          {h ? (
            <>
              <div className="system-panel__usage">
                <UsageBar used={h.memory.usedBytes} total={h.memory.totalBytes} />
                <span className="system-panel__hint">
                  RAM {formatBytes(h.memory.usedBytes)} / {formatBytes(h.memory.totalBytes)}
                </span>
              </div>
              <Stat label="Load (1m)" value={h.cpu.loadavg[0].toFixed(2)} />
              <Stat label="CPUs" value={h.cpu.count} />
              <Stat label="Host uptime" value={formatUptime(h.uptimeSeconds)} />
            </>
          ) : host.status === 'error' && host.code === 503 ? (
            <span className="system-panel__hint">System agent not configured — host metrics unavailable.</span>
          ) : (
            <span className="system-panel__hint">{host.status === 'error' ? host.message : 'Loading…'}</span>
          )}
          {s && (
            <Stat label="App uptime" value={formatUptime(s.process.uptimeSeconds)} />
          )}
        </div>

        {/* Host disks (only when agent present and reporting extra mounts) */}
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
      {host.status === 'error' && host.code === 503 && (
        <p className="system-panel__hint system-panel__hint--block">
          The system agent is not configured, so operations cannot run from here.
        </p>
      )}
      <div className="system-panel__actions">
        <div className="system-panel__action">
          <div className="system-panel__action-info">
            <strong className="system-panel__action-title">Restart Service</strong>
            <span className="system-panel__action-desc">Restart a single container on the host.</span>
          </div>
          <div className="system-panel__action-control">
            <select
              className="system-panel__select"
              value={restartTarget}
              onChange={(e) => setRestartTarget(e.target.value)}
            >
              <option value="">Select container…</option>
              {containers.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
            <ActionButton
              state={actions['restart-service']}
              label="Restart"
              disabled={!restartTarget}
              onClick={() => runOp('restart-service', { extra: { service: restartTarget } })}
            />
          </div>
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
        <div className="system-panel__action">
          <div className="system-panel__action-info">
            <strong className="system-panel__action-title">Restore</strong>
            <span className="system-panel__action-desc">
              Restore from an encrypted backup in object storage. Destructive — overwrites current data.
            </span>
          </div>
          <div className="system-panel__action-control">
            <ActionButton
              state={actions['restore']}
              label="Restore…"
              danger
              onClick={async () => {
                const path = window.prompt('Absolute S3 path of the backup to restore:')
                if (!path) return
                await runOp('restore', { destructive: true, extra: { path } })
              }}
            />
          </div>
        </div>
      </div>
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
