import { getServerSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting.
 * Uses getServerSideURL so the result is identical on the server (SSR) and
 * in the browser, preventing React hydration mismatches.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Otherwise prepend server-side base URL (consistent between SSR and browser)
  const baseUrl = getServerSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
