import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'
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

  for (const path of paths) {
    revalidatePath(path)
  }
}

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      // Hook `doc` may have categories as bare IDs (depth-0). Re-fetch with depth:1
      // to guarantee categories are populated so getPostUrl returns the correct path.
      let postToRevalidate: Post = doc
      try {
        const fetched = await payload.findByID({
          collection: 'posts',
          id: doc.id,
          depth: 1,
        })
        if (fetched) postToRevalidate = fetched
      } catch (e) {
        payload.logger.warn(`[revalidatePost] Could not fetch populated doc, using hook doc: ${e}`)
      }

      const resolvedPath = getPostUrl(postToRevalidate)
      payload.logger.info(
        `[revalidatePost] Revalidating "${resolvedPath}" (categories: ${JSON.stringify(
          (postToRevalidate.categories ?? []).map((c) =>
            typeof c === 'object' ? { urlPrefix: c.urlPrefix } : c,
          ),
        )})`,
      )

      revalidatePostPaths(postToRevalidate)
      revalidateTag('posts-sitemap', 'default')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      payload.logger.info(
        `[revalidatePost] Revalidating old post at path: ${getPostUrl(previousDoc)}`,
      )
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
