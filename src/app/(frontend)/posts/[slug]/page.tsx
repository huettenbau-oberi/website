import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostNavigation } from '@/components/PostNavigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { cache } from 'react'

import type { Page, Post } from '@/payload-types'

import { getPostUrl } from '@/utilities/getPostUrl'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
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
      select: {
        slug: true,
      },
    })

    return posts.docs.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  // Redirect to canonical URL if the post lives under a different prefix
  const canonicalUrl = getPostUrl(post)
  if (canonicalUrl !== url) {
    redirect(canonicalUrl)
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

      {/* Allows redirects for valid pages too */}
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
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
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
