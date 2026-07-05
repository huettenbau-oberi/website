'use client'

import React, { useState } from 'react'
import { Button, useAuth, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

import TwoFactorSetup from '../TwoFactorSetup'
import { adminReset2fa, disable2fa } from '../TwoFactor/shared'
import '../TwoFactor/styles.scss'

type CurrentUser = {
  id?: number | string
  userRole?: string
} | null

/**
 * Self-service 2FA panel rendered as a `ui` field on the Users collection. It appears on
 * the account view (own profile) and when an admin edits another user:
 *  - Own profile → enable (QR flow) / disable (code-confirmed).
 *  - Admin editing someone else → read-only status + a lockout "Reset 2FA" action.
 */
const TwoFactorSettings: React.FC = () => {
  const { user } = useAuth() as { user: CurrentUser }
  const { id: docId } = useDocumentInfo()
  const router = useRouter()

  const enabled = useFormFields(([fields]) => Boolean(fields?.twoFactorEnabled?.value))
  const enforced = useFormFields(([fields]) => Boolean(fields?.twoFactorEnforced?.value))

  const [disabling, setDisabling] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // No document yet (creating a new user) — nothing to manage.
  if (!docId) return null

  const isSelf = String(docId) === String(user?.id)
  const isAdmin = user?.userRole === 'admin'

  const label = 'Two-Factor Authentication'

  // --- Admin viewing someone else's account --------------------------------------
  if (!isSelf) {
    const handleReset = async () => {
      if (!confirm('Reset this user’s two-factor authentication? They will be able to log in without a code.')) {
        return
      }
      setError(null)
      setBusy(true)
      try {
        await adminReset2fa(docId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reset failed.')
      } finally {
        setBusy(false)
      }
    }

    return (
      <div className="tfa field-type">
        <h4>{label}</h4>
        <span className="tfa__status">
          <span className={`tfa__dot tfa__dot--${enabled ? 'on' : 'off'}`} />
          {enabled ? 'Active for this user' : 'Not set up'}
        </span>
        <p className="tfa__desc">
          A user can only set up 2FA themselves. Use the “Require Two-Factor Authentication”
          checkbox above to force enrollment on their next login.
        </p>
        {isAdmin && enabled && (
          <div>
            <Button buttonStyle="error" onClick={handleReset} disabled={busy}>
              {busy ? 'Resetting…' : 'Reset 2FA (lockout recovery)'}
            </Button>
          </div>
        )}
        {error && <p className="tfa__error">{error}</p>}
      </div>
    )
  }

  // --- Own account ---------------------------------------------------------------
  const handleDisable = async () => {
    setError(null)
    setBusy(true)
    try {
      await disable2fa(code)
      setDisabling(false)
      setCode('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tfa field-type">
      <h4>{label}</h4>

      {enabled ? (
        <>
          <span className="tfa__status">
            <span className="tfa__dot tfa__dot--on" />
            Enabled
          </span>
          <p className="tfa__desc">
            You’ll be asked for a code from your authenticator app each time you log in.
          </p>
          {!disabling ? (
            <div>
              <Button buttonStyle="secondary" onClick={() => setDisabling(true)}>
                Disable two-factor authentication
              </Button>
            </div>
          ) : (
            <div className="tfa">
              <p className="tfa__hint">Enter a current code to confirm disabling 2FA:</p>
              <div className="tfa__row">
                <input
                  className="tfa__code-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <Button buttonStyle="error" onClick={handleDisable} disabled={busy || code.length !== 6}>
                  {busy ? 'Disabling…' : 'Confirm disable'}
                </Button>
                <Button
                  buttonStyle="none"
                  onClick={() => {
                    setDisabling(false)
                    setCode('')
                    setError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <span className="tfa__status">
            <span className={`tfa__dot tfa__dot--${enforced ? 'warn' : 'off'}`} />
            {enforced ? 'Required — not yet set up' : 'Not enabled'}
          </span>
          <TwoFactorSetup
            onComplete={() => {
              router.refresh()
            }}
          />
        </>
      )}

      {error && <p className="tfa__error">{error}</p>}
    </div>
  )
}

export default TwoFactorSettings
