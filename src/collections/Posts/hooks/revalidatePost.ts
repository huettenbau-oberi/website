import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'
import { locales } from '../../../i18n/localization'
import { routing } from '../../../i18n/routing'
import { getPostUrl } from '../../../utilities/getPostUrl'

function revalidatePostPaths(doc: Post) {
  const postPath = getPostUrl(doc)
  const paths = new Set([postPath])

  // Also revalidate the category listing page (e.g. /gallery)
  for (const cat of doc.categories ?? []) {
    if (typeof cat === 'object' && cat.urlPrefix) {
      paths.add(`/${cat.urlPrefix}`)
    }
  }

  for (const locale of locales) {
    const code = typeof locale === 'object' ? locale.code : locale
    // Always include the locale code — the middleware rewrites the public URL (e.g. /galerie/2025)
    // to the internal route (/de/galerie/2025), so the cache key always has the locale prefix.
    const prefix = `/${code}`
    for (const path of paths) {
      revalidatePath(`${prefix}${path}`)
    }
  }
}

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating post at path: ${getPostUrl(doc)}`)

      revalidatePostPaths(doc)
      revalidateTag('posts-sitemap', 'default')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old post at path: ${getPostUrl(previousDoc)}`)

      revalidatePostPaths(previousDoc)
      revalidateTag('posts-sitemap', 'default')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePostPaths(doc)
    revalidateTag('posts-sitemap', 'default')
  }

  return doc
}
