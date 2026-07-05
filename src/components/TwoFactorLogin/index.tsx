'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Button, useAuth, useTheme } from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'

import { Logo } from '@/components/Logo/Logo'
import { getClientSideURL } from '@/utilities/getURL'
import { TWO_FACTOR_REQUIRED } from '@/utilities/twoFactorConstants'
import '../TwoFactor/styles.scss'

const TURNSTILE_COOKIE = 'cf-turnstile-token'

type Step = 'credentials' | 'otp'

/**
 * Custom login view that adds the two-step TOTP prompt Payload's native form can't:
 * step 1 submits email + password; if the server responds with `2FA_REQUIRED` the form
 * reveals a code field and resubmits with the OTP. Because each `/users/login` call runs
 * the Turnstile check (single-use tokens), the widget is reset between attempts to obtain
 * a fresh token.
 */
const TwoFactorLogin: React.FC = () => {
  const { user, setUser } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined)

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Whether we currently hold a fresh Turnstile token (irrelevant when unconfigured).
  const [hasToken, setHasToken] = useState(!siteKey)

  const redirectTo = (() => {
    const raw = searchParams.get('redirect')
    // Only allow same-site admin redirects.
    return raw && raw.startsWith('/') ? raw : '/admin'
  })()

  // A user who is already authenticated shouldn't see the login form.
  useEffect(() => {
    if (user) router.replace(redirectTo)
  }, [user, router, redirectTo])

  const resetTurnstile = useCallback(() => {
    if (!siteKey) return
    setHasToken(false)
    turnstileRef.current?.reset()
  }, [siteKey])

  const submit = useCallback(
    async (withOtp: boolean) => {
      setError(null)
      setBusy(true)
      try {
        const res = await fetch(`${getClientSideURL()}/api/users/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, ...(withOtp ? { otp } : {}) }),
        })

        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data?.user) setUser(data.user)
          // Full navigation so the server re-reads the freshly set auth cookie.
          window.location.assign(redirectTo)
          return
        }

        const body = await res.json().catch(() => ({}))
        const message: string = body?.errors?.[0]?.message ?? body?.message ?? 'Login failed.'

        // The token was consumed by this attempt — get a new one for the next try.
        resetTurnstile()

        if (message === TWO_FACTOR_REQUIRED) {
          setStep('otp')
          setError(null)
        } else {
          setError(message)
          if (step === 'otp') setOtp('')
        }
      } catch {
        resetTurnstile()
        setError('Network error. Please try again.')
      } finally {
        setBusy(false)
      }
    },
    [email, password, otp, redirectTo, setUser, resetTurnstile, step],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !hasToken) return
    void submit(step === 'otp')
  }

  const canSubmit = hasToken && !busy && (step === 'credentials' ? Boolean(email && password) : otp.length === 6)

  return (
    <>
      <div className="tfa-login__logo">
        <Logo theme={theme === 'dark' ? 'light' : 'dark'} />
      </div>

      <form className="tfa-login" onSubmit={onSubmit}>
        {step === 'credentials' ? (
          <>
            <div className="tfa-login__field">
              <label htmlFor="tfa-email">Email</label>
              <input
                id="tfa-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="tfa-login__field">
              <label htmlFor="tfa-password">Password</label>
              <input
                id="tfa-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        ) : (
          <div className="tfa-login__field">
            <label htmlFor="tfa-otp">Authentication code</label>
            <p className="tfa__hint">Enter the 6-digit code from your authenticator app.</p>
            <input
              id="tfa-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
        )}

        {siteKey && (
          <div className="tfa-login__turnstile">
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(token) => {
                document.cookie = `${TURNSTILE_COOKIE}=${token}; path=/; SameSite=Strict`
                setHasToken(true)
              }}
              onExpire={() => {
                document.cookie = `${TURNSTILE_COOKIE}=; path=/; max-age=0`
                setHasToken(false)
              }}
              onError={() => setHasToken(false)}
            />
          </div>
        )}

        {error && <p className="tfa__error">{error}</p>}

        <Button el="button" type="submit" buttonStyle="primary" disabled={!canSubmit}>
          {busy ? 'Please wait…' : step === 'otp' ? 'Verify' : 'Log in'}
        </Button>

        {step === 'otp' && (
          <Button
            el="button"
            type="button"
            buttonStyle="none"
            onClick={() => {
              setStep('credentials')
              setOtp('')
              setError(null)
            }}
          >
            Back
          </Button>
        )}
      </form>
    </>
  )
}

export default TwoFactorLogin
