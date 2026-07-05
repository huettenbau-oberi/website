import { getClientSideURL } from '@/utilities/getURL'

// Base for the self-service 2FA endpoints registered in payload.config.ts.
const base = () => `${getClientSideURL()}/api/account/2fa`

export type SetupResponse = {
  otpauthUrl: string
  qrDataUrl: string
  secret: string
}

/** Extract a human-readable message from a Payload REST error response. */
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body?.errors?.[0]?.message ?? body?.error ?? body?.message ?? 'Something went wrong.'
  } catch {
    return 'Something went wrong.'
  }
}

async function post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) throw new Error(await errorMessage(res))
  return (await res.json()) as T
}

export const startSetup = () => post<SetupResponse>('/setup')
export const confirmSetup = (code: string) => post<{ enabled: boolean }>('/verify', { code })
export const disable2fa = (code: string) => post<{ enabled: boolean }>('/disable', { code })
export const adminReset2fa = (userId: number | string) =>
  post<{ ok: boolean }>('/admin-reset', { userId })
