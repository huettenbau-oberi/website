'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@payloadcms/ui'

import { confirmSetup, startSetup, type SetupResponse } from '../TwoFactor/shared'
import '../TwoFactor/styles.scss'

type Props = {
  /** Begin setup immediately on mount (used by the enforcement gate). */
  autoStart?: boolean
  /** Called after 2FA has been successfully activated. */
  onComplete: () => void
}

/**
 * Shared enrollment flow: fetches a secret + QR, then verifies the first code to
 * activate 2FA. Reused by the account settings panel and the enforcement gate.
 */
export const TwoFactorSetup: React.FC<Props> = ({ autoStart = false, onComplete }) => {
  const [setup, setSetup] = useState<SetupResponse | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const begin = useCallback(async () => {
    setError(null)
    setBusy(true)
    try {
      setSetup(await startSetup())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start setup.')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (autoStart) void begin()
  }, [autoStart, begin])

  const verify = useCallback(async () => {
    setError(null)
    setBusy(true)
    try {
      await confirmSetup(code)
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setBusy(false)
    }
  }, [code, onComplete])

  if (!setup) {
    return (
      <div className="tfa">
        {error && <p className="tfa__error">{error}</p>}
        <div>
          <Button buttonStyle="primary" onClick={begin} disabled={busy}>
            {busy ? 'Starting…' : 'Set up two-factor authentication'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="tfa">
      <p className="tfa__desc">
        Scan this QR code with an authenticator app (Google Authenticator, 1Password, Authy…),
        then enter the 6-digit code it shows.
      </p>
      <div className="tfa__qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={setup.qrDataUrl} alt="Two-factor QR code" />
      </div>
      <p className="tfa__hint">Can’t scan? Enter this key manually:</p>
      <code className="tfa__secret">{setup.secret}</code>
      <div className="tfa__row">
        <input
          className="tfa__code-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && code.length === 6 && !busy) void verify()
          }}
        />
        <Button
          buttonStyle="primary"
          onClick={verify}
          disabled={busy || code.length !== 6}
        >
          {busy ? 'Verifying…' : 'Verify & activate'}
        </Button>
      </div>
      {error && <p className="tfa__error">{error}</p>}
    </div>
  )
}

export default TwoFactorSetup
