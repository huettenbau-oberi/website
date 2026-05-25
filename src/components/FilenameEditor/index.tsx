'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React, { useState } from 'react'

export const FilenameEditor: React.FC = () => {
  const { id } = useDocumentInfo()
  const filename = useFormFields(([fields]) => fields.filename?.value as string | undefined)

  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!filename) return null

  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : ''
  const baseName = ext ? filename.slice(0, -ext.length) : filename

  const handleEditClick = () => {
    setInputValue(baseName)
    setError(null)
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!id || !inputValue.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/media/${id}/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputValue.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Rename failed.')
        return
      }
      window.location.reload()
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--theme-elevation-400)',
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
  }

  return (
    <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
      <label style={labelStyle}>Filename</label>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                background: 'var(--theme-input-bg)',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: '4px',
                color: 'var(--theme-text)',
                flexGrow: 1,
                fontSize: '0.875rem',
                padding: '0.375rem 0.5rem',
              }}
            />
            <span
              style={{
                color: 'var(--theme-elevation-400)',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
              }}
            >
              {ext}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !inputValue.trim() || inputValue.trim() === baseName}
              style={{
                background: 'var(--theme-success-500)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: loading ? 'default' : 'pointer',
                fontSize: '0.8125rem',
                opacity: loading || !inputValue.trim() || inputValue.trim() === baseName ? 0.5 : 1,
                padding: '0.3125rem 0.75rem',
              }}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--theme-text)',
                cursor: loading ? 'default' : 'pointer',
                fontSize: '0.8125rem',
                opacity: loading ? 0.5 : 1,
                padding: '0.3125rem 0',
                textDecoration: 'underline',
              }}
            >
              Cancel
            </button>
          </div>

          {error && (
            <p style={{ color: 'var(--theme-error-500)', fontSize: '0.8125rem', margin: 0 }}>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div style={{ alignItems: 'center', display: 'flex', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem' }}>{filename}</span>
          <button
            type="button"
            onClick={handleEditClick}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-elevation-400)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Rename
          </button>
        </div>
      )}
    </div>
  )
}

export default FilenameEditor
