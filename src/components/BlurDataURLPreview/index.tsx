'use client'

import { useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import React, { useState } from 'react'

export const BlurDataURLPreview: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const { id } = useDocumentInfo()
  const mimeType = useFormFields(([fields]) => fields.mimeType?.value as string)
  const [loading, setLoading] = useState(false)

  const isSupported = mimeType?.startsWith('image/') && mimeType !== 'image/svg+xml'
  if (!isSupported) return null

  const handleGenerate = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/media/${id}/generate-blur`, { method: 'POST' })
      const data = await res.json()
      if (data.blurDataUrl) setValue(data.blurDataUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <label
        style={{
          color: 'var(--theme-elevation-400)',
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
        }}
      >
        Blur Preview
      </label>
      {value ? (
        <img
          src={value}
          alt="Blur preview"
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            display: 'block',
            height: 'auto',
            imageRendering: 'pixelated',
            width: '80px',
          }}
        />
      ) : (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--theme-text)',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '0.875rem',
            opacity: loading ? 0.5 : 1,
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {loading ? 'Generating…' : 'Generate blur'}
        </button>
      )}
    </div>
  )
}

export default BlurDataURLPreview
