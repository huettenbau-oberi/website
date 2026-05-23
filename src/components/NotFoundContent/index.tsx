import Link from 'next/link'
import React from 'react'

type Props = {
  title: string
  description: string
  homeLabel: string
  galleryLabel: string
}

export function NotFoundContent({ title, description, homeLabel, galleryLabel }: Props) {
  return (
    <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
      <p
        style={{
          fontSize: 'clamp(7rem, 22vw, 16rem)',
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: '3rem',
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          color: 'var(--foreground, #111)',
        }}
      >
        404
      </p>
      <h1
        style={{
          fontSize: 'clamp(1.875rem, 5vw, 3rem)',
          fontWeight: 900,
          marginBottom: '1rem',
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          color: 'var(--foreground, #111)',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          color: 'var(--muted-foreground, #666)',
          marginBottom: '2rem',
          maxWidth: '32rem',
        }}
      >
        {description}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.5rem 1.25rem',
            background: 'var(--foreground, #111)',
            color: 'var(--background, #fff)',
            textDecoration: 'none',
            borderRadius: '0.375rem',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {homeLabel}
        </Link>
        <Link
          href="/gallery"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.5rem 1.25rem',
            border: '1px solid var(--border, #e2e8f0)',
            color: 'var(--foreground, #111)',
            background: 'transparent',
            textDecoration: 'none',
            borderRadius: '0.375rem',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {galleryLabel}
        </Link>
      </div>
    </section>
  )
}
