import crypto from 'crypto'
import QRCode from 'qrcode'
import { generateSecret as otpGenerateSecret, generateURI, verify as otpVerify } from 'otplib'

// TOTP issuer shown in the user's authenticator app next to the account.
const ISSUER = 'Hüttenbau Admin'

// One period (30s) of leeway on each side so a code entered right as it rolls over
// still validates against the neighbouring time steps.
const EPOCH_TOLERANCE = 30

// Marker so we can tell an encrypted secret from a legacy/plaintext value and bump
// the scheme later if needed.
const ENC_PREFIX = 'v1:'

/**
 * 32-byte AES key derived from PAYLOAD_SECRET. The same secret already protects
 * Payload's own tokens, so reusing it keeps the TOTP secrets tied to the same trust
 * root without introducing another env var to manage.
 */
function encryptionKey(): Buffer {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not set — cannot encrypt two-factor secrets')
  }
  return crypto.createHash('sha256').update(secret).digest()
}

/** Encrypt a base32 TOTP secret for storage at rest (AES-256-GCM). */
export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${ENC_PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`
}

/** Reverse of {@link encryptSecret}. Returns null if the value can't be decrypted. */
export function decryptSecret(stored: string | null | undefined): string | null {
  if (!stored || !stored.startsWith(ENC_PREFIX)) return null
  try {
    const [ivB64, tagB64, dataB64] = stored.slice(ENC_PREFIX.length).split(':')
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      encryptionKey(),
      Buffer.from(ivB64, 'base64'),
    )
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ])
    return plain.toString('utf8')
  } catch {
    return null
  }
}

/** Generate a fresh base32 TOTP secret. */
export function generateSecret(): string {
  return otpGenerateSecret()
}

/** otpauth:// URI that authenticator apps consume when scanning the QR code. */
export function buildOtpauthUrl(accountLabel: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: accountLabel, secret })
}

/** Render an otpauth URI to a PNG data URL for display as a QR code. */
export function qrDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, { margin: 1, width: 240 })
}

/**
 * Verify a 6-digit TOTP code against the secret. Non-numeric / wrong-length input
 * short-circuits to false so callers don't have to pre-validate.
 */
export async function verifyToken(secret: string, token: string): Promise<boolean> {
  const normalized = (token ?? '').replace(/\s+/g, '')
  if (!/^\d{6}$/.test(normalized)) return false
  try {
    const result = await otpVerify({ secret, token: normalized, epochTolerance: EPOCH_TOLERANCE })
    return Boolean(result?.valid)
  } catch {
    return false
  }
}
