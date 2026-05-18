'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import React, { useEffect, useRef } from 'react'

const COOKIE_NAME = 'cf-turnstile-token'

export const BeforeLogin: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Move the widget after the forgot-password link, just before the submit button
    const forgotPasswordLink = document.querySelector('a[href*="forgot"]')
    if (forgotPasswordLink) {
      forgotPasswordLink.insertAdjacentElement('afterend', container)
      container.style.display = 'flex'
    }
  }, [])

  if (!siteKey) return null

  return (
    <div ref={containerRef} style={{ display: 'none', justifyContent: 'center', margin: '1rem 0' }}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => {
          document.cookie = `${COOKIE_NAME}=${token}; path=/; SameSite=Strict`
        }}
        onExpire={() => {
          document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
        }}
      />
    </div>
  )
}

export default BeforeLogin
