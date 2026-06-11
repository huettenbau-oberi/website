import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostNavigation } from '@/components/PostNavigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import type { Page, Post } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getUrlPrefixFromCategories } from '@/utilities/getPostUrl'
import PageClient from '../../posts/[slug]/page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      depth: 1,
      select: {
        slug: true,
        categories: true,
      },
    })

    const params: { slug: string; postSlug: string }[] = []

    for (const post of posts.docs) {
      const prefix = getUrlPrefixFromCategories(post.categories as any)
      if (prefix !== 'posts' && post.slug) {
        params.push({ slug: prefix, postSlug: post.slug })
      }
    }

    return params
  } catch {
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string // the URL prefix segment, e.g. "gallery"
    postSlug?: string
  }>
}

export default async function PostByPrefix({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug: urlPrefix = '', postSlug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(postSlug)
  const url = `/${urlPrefix}/${decodedSlug}`

  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  // Verify this post actually belongs to a category with the given urlPrefix
  const actualPrefix = getUrlPrefixFromCategories(post.categories as any)
  if (actualPrefix !== urlPrefix) {
    notFound()
  }

  const categoryIds = (post.categories ?? [])
    .map((c) => (typeof c === 'object' ? c.id : c))
    .filter(Boolean)

  const { previous, next } = await queryAdjacentPosts({
    postId: post.id,
    publishedAt: post.publishedAt,
    categoryIds,
  })

  return (
    <article className="pt-16 pb-16">
      <PageClient />

      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      {post.layout && post.layout.length > 0 && (
        <RenderBlocks blocks={(post.layout ?? []) as NonNullable<Page['layout']>} />
      )}

      <PostNavigation previous={previous} next={next} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { postSlug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(postSlug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryAdjacentPosts = cache(
  async ({
    postId,
    publishedAt,
    categoryIds,
  }: {
    postId: string | number
    publishedAt: string | null | undefined
    categoryIds: (string | number)[]
  }) => {
    if (!publishedAt) return { previous: null, next: null }

    const payload = await getPayload({ config: configPromise })
    const shared = {
      collection: 'posts' as const,
      limit: 1,
      pagination: false,
      overrideAccess: false,
    }

    const categoryFilter =
      categoryIds.length > 0 ? [{ 'categories.id': { in: categoryIds.join(',') } }] : []

    const [prevResult, nextResult] = await Promise.all([
      payload.find({
        ...shared,
        sort: '-publishedAt',
        where: {
          and: [
            { publishedAt: { less_than: publishedAt } },
            { id: { not_equals: postId } },
            { _status: { equals: 'published' } },
            ...categoryFilter,
          ],
        },
      }),
      payload.find({
        ...shared,
        sort: 'publishedAt',
        where: {
          and: [
            { publishedAt: { greater_than: publishedAt } },
            { id: { not_equals: postId } },
            { _status: { equals: 'published' } },
            ...categoryFilter,
          ],
        },
      }),
    ])

    return {
      previous: prevResult.docs?.[0] ?? null,
      next: nextResult.docs?.[0] ?? null,
    }
  },
)

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
