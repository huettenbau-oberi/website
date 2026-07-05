import crypto from 'crypto'

const COOKIE = 'cf-2fa-pending'
const TTL = 300 // seconds — proof cookie expires after 5 minutes

function sign(email: string, ts: number): string {
  const secret = process.env.TURNSTILE_SECRET_KEY ?? ''
  return crypto.createHmac('sha256', secret).update(`${email}:${ts}`).digest('hex')
}

/** Returns a Set-Cookie header value that proves this email passed Turnstile. */
export function createPendingCookieHeader(email: string): string {
  const ts = Math.floor(Date.now() / 1000)
  return `${COOKIE}=${ts}:${sign(email, ts)}; Path=/; Max-Age=${TTL}; HttpOnly; SameSite=Strict`
}

/**
 * Returns true if the cookie header contains a valid, unexpired proof for `email`.
 * The caller is responsible for clearing the cookie after accepting it.
 */
export function validatePendingCookie(cookieHeader: string, email: string): boolean {
  const match = cookieHeader.match(/cf-2fa-pending=([^;]+)/)
  if (!match) return false

  const parts = match[1].split(':')
  if (parts.length !== 2) return false

  const ts = parseInt(parts[0], 10)
  if (!Number.isFinite(ts)) return false
  if (Math.floor(Date.now() / 1000) - ts > TTL) return false

  const expected = Buffer.from(sign(email, ts), 'hex')
  const received = Buffer.from(parts[1], 'hex')
  if (received.length !== expected.length) return false

  return crypto.timingSafeEqual(received, expected)
}

/** Returns a Set-Cookie header value that immediately expires the proof cookie. */
export function clearPendingCookieHeader(): string {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`
}
