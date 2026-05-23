'use client'
import React, { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo/Logo'
import Link from 'next/link'
import './index.scss'

type CleanupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; deletedCount: number; freedBytes: number; errors: string[] }
  | { status: 'error'; message: string }

const quickLinks = [
  {
    label: 'Pages',
    href: '/admin/collections/pages',
    description: 'Edit website pages',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'Posts',
    href: '/admin/collections/posts',
    description: 'Write articles',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: 'Media',
    href: '/admin/collections/media',
    description: 'Images & documents',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    label: 'Homepage',
    href: '/',
    description: 'Visit the page',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/admin/globals/settings',
    description: 'Logos & global options',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    label: 'Logout',
    href: '/admin/logout',
    description: 'Sign out',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const BeforeDashboard: React.FC = () => {
  const [date, setDate] = useState<string>('')
  const [cleanup, setCleanup] = useState<CleanupState>({ status: 'idle' })

  async function runCleanup() {
    setCleanup({ status: 'loading' })
    try {
      const res = await fetch('/api/media/cleanup', { method: 'POST' })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      setCleanup({ status: 'done', ...data })
    } catch (err) {
      setCleanup({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    )
  }, [])

  return (
    <div className="before-dashboard">
      <div className="before-dashboard__hero">
        <div className="before-dashboard__hero-inner">
          <div className="before-dashboard__hero-left">
            <div className="before-dashboard__logo-wrap">
              <Logo theme="light" />
            </div>
            <div>
              <h2 className="before-dashboard__title">Welcome back</h2>
              <p className="before-dashboard__subtitle">Hüttenbau Administration</p>
              {date && (
                <div className="before-dashboard__date">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {date}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="before-dashboard__section-label">Quick access</p>

      <div className="before-dashboard__grid">
        {quickLinks.map(({ label, href, description, icon }) => (
          <Link key={href} href={href} className="before-dashboard__card">
            <span className="before-dashboard__card-icon">{icon}</span>
            <strong className="before-dashboard__card-label">{label}</strong>
            <span className="before-dashboard__card-desc">{description}</span>
          </Link>
        ))}
      </div>

      <p className="before-dashboard__section-label" style={{ marginTop: '1.5rem' }}>
        Maintenance
      </p>

      <div className="before-dashboard__maintenance">
        <div className="before-dashboard__maintenance-item">
          <div className="before-dashboard__maintenance-info">
            <strong className="before-dashboard__maintenance-title">Media Cleanup</strong>
            <span className="before-dashboard__maintenance-desc">
              Delete files on disk that have no matching media record in the database.
            </span>
          </div>
          <div className="before-dashboard__maintenance-action">
            {cleanup.status === 'done' && (
              <span className="before-dashboard__cleanup-result">
                {cleanup.deletedCount === 0
                  ? 'No orphaned files found'
                  : `Deleted ${cleanup.deletedCount} file${cleanup.deletedCount !== 1 ? 's' : ''}, freed ${formatBytes(cleanup.freedBytes)}`}
                {cleanup.errors.length > 0 && ` (${cleanup.errors.length} error${cleanup.errors.length !== 1 ? 's' : ''})`}
              </span>
            )}
            {cleanup.status === 'error' && (
              <span className="before-dashboard__cleanup-result before-dashboard__cleanup-result--error">
                {cleanup.message}
              </span>
            )}
            <button
              className="before-dashboard__cleanup-btn"
              onClick={runCleanup}
              disabled={cleanup.status === 'loading'}
            >
              {cleanup.status === 'loading' ? 'Running…' : 'Run Cleanup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BeforeDashboard
