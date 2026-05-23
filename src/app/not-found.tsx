import Link from 'next/link'
import React from 'react'

// fallback for cases where the url could be malformed

export default function NotFound() {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        <div style={{ padding: '7rem 1.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>404</h1>
          <p style={{ marginBottom: '1.5rem' }}>Diese Seite wurde nicht gefunden</p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.25rem',
              background: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '0.375rem',
            }}
          >
            Zurück zur Startseite
          </Link>
        </div>
      </body>
    </html>
  )
}
