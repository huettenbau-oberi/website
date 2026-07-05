import { APIError } from 'payload'
import type { CollectionBeforeOperationHook } from 'payload'

import { clearPendingCookieHeader, validatePendingCookie } from '../../../utilities/twoFactorPending'

export const validateTurnstile: CollectionBeforeOperationHook = async ({ operation, req }) => {
  if (operation !== 'login') return
  // Internal login triggered by first-register — no Turnstile widget is shown there
  if (req.url?.includes('first-register')) return

  const cookieHeader = req.headers.get('cookie') ?? ''
  const email = typeof req.data?.email === 'string' ? req.data.email : ''

  // OTP step: accept the server-issued proof cookie instead of a Turnstile token.
  // The cookie was set by enforceTwoFactor after the credentials step passed Turnstile,
  // so no widget is needed here. Consume it immediately so it can't be reused.
  if (req.data && typeof req.data === 'object' && 'otp' in req.data) {
    if (!validatePendingCookie(cookieHeader, email)) {
      throw new APIError('Please complete the CAPTCHA challenge before continuing.', 400)
    }
    if (!req.responseHeaders) req.responseHeaders = new Headers()
    req.responseHeaders.append('Set-Cookie', clearPendingCookieHeader())
    return
  }

  const token = cookieHeader.match(/cf-turnstile-token=([^;]+)/)?.[1]

  if (!token) {
    throw new APIError('Please complete the CAPTCHA challenge before continuing.', 400)
  }

  const formData = new FormData()
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY ?? '')
  formData.append('response', token)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })

  const data: { success: boolean } = await response.json()

  if (!data.success) {
    throw new APIError('CAPTCHA validation failed. Please refresh and try again.', 400)
  }
}
