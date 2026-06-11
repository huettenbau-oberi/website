import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

export function getPagePaths(slug: string): string[] {
  return slug === 'home' ? ['/'] : [`/${slug}`]
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const paths = getPagePaths(doc.slug)

      paths.forEach((path) => {
        payload.logger.info(`Revalidating page at path: ${path}`)
        revalidatePath(path)
      })
      revalidateTag('pages-sitemap', 'default')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const paths = getPagePaths(previousDoc.slug)

      paths.forEach((path) => {
        payload.logger.info(`Revalidating old page at path: ${path}`)
        revalidatePath(path)
      })
      revalidateTag('pages-sitemap', 'default')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    getPagePaths(doc?.slug ?? '').forEach((path) => revalidatePath(path))
    revalidateTag('pages-sitemap', 'default')
  }

  return doc
}
