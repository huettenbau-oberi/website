import { APIError } from 'payload'
import type { CollectionBeforeOperationHook } from 'payload'

export const validateTurnstile: CollectionBeforeOperationHook = async ({ operation, req }) => {
  if (operation !== 'login') return
  // Internal login triggered by first-register — no Turnstile widget is shown there
  if (req.url?.includes('first-register')) return

  const cookieHeader = req.headers.get('cookie') ?? ''
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
