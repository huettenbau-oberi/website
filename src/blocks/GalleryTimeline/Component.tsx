import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Category } from '@/payload-types'
import { TimelineClient } from './TimelineClient'
import { getUrlPrefixFromCategories } from '@/utilities/getPostUrl'

type Props = {
  category?: number | Category | null
  blockType?: string
  id?: string | null
}

export const GalleryTimelineBlock: React.FC<Props> = async ({ category }) => {
  const payload = await getPayload({ config: configPromise })

  const categoryId =
    typeof category === 'object' && category !== null
      ? (category as Category).id
      : (category as number | null)

  if (!categoryId) return null

  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { categories: { in: [categoryId] } },
        { publishedAt: { exists: true } },
      ],
    },
    sort: '-publishedAt',
    limit: 50,
    depth: 1,
    overrideAccess: true,
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      heroImage: true,
      meta: true,
    },
  })

  if (!posts.docs.length) return null

  const urlPrefix = getUrlPrefixFromCategories(
    typeof category === 'object' && category !== null ? [category] : [],
  )

  return (
    <section className="container">
      <TimelineClient posts={posts.docs as any} urlPrefix={urlPrefix} />
    </section>
  )
}
