'use client'

import { useField } from '@payloadcms/ui'
import React from 'react'

export const BlurDataURLPreview: React.FC<{ path: string }> = ({ path }) => {
  const { value } = useField<string>({ path })

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
        <p style={{ color: 'var(--theme-elevation-400)', fontSize: '0.875rem', margin: 0 }}>—</p>
      )}
    </div>
  )
}

export default BlurDataURLPreview
