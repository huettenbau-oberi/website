'use client'

import React from 'react'
import { useAuth } from '@payloadcms/ui'

import TwoFactorSetup from '../TwoFactorSetup'
import '../TwoFactor/styles.scss'

type GateUser = {
  twoFactorEnabled?: boolean | null
  twoFactorEnforced?: boolean | null
} | null

/**
 * Admin provider that blocks the panel for users an admin has flagged as
 * `twoFactorEnforced` who haven't set up 2FA yet. They must complete enrollment before
 * they can use anything. This is only a UX guard for the un-enrolled case (no secret
 * exists yet); real second-factor verification happens server-side at login.
 */
const TwoFactorGate: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() as { user: GateUser }

  const mustEnroll = Boolean(user && user.twoFactorEnforced && !user.twoFactorEnabled)

  if (!mustEnroll) return <>{children}</>

  return (
    <div className="tfa__gate">
      <div className="tfa__gate-card">
        <h2 style={{ marginTop: 0 }}>Two-factor authentication required</h2>
        <p className="tfa__desc">
          An administrator requires you to secure your account with two-factor authentication
          before you can continue.
        </p>
        <TwoFactorSetup autoStart onComplete={() => window.location.reload()} />
      </div>
    </div>
  )
}

export default TwoFactorGate
