import type { Config } from 'src/payload-types'
import type { TypedLocale } from 'payload'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0, locale?: TypedLocale) {
  try {
    const payload = await getPayload({ config: configPromise })

    const global = await payload.findGlobal({
      slug,
      depth,
      ...(locale ? { locale } : {}),
    })

    return global
  } catch {
    return null
  }
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (slug: Global, depth = 0, locale?: TypedLocale) =>
  unstable_cache(async () => getGlobal(slug, depth, locale), [slug, locale ?? 'default'], {
    tags: [`global_${slug}`],
  })
