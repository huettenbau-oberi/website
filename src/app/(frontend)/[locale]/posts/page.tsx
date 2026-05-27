import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getTranslations } from 'next-intl/server'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const t = await getTranslations()
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  const page = posts.page || 1
  const limit = 12
  const indexStart = (page - 1) * limit + 1
  const indexEnd = Math.min(page * limit, posts.totalDocs)

  return (
    <div className="pt-24 pb-24">
      <PageClient />

      {/* Hero header */}
      <div className="bg-background border-b border-border mb-16">
        <div className="container py-10 md:py-14">
          <h1
            className="leading-none font-black mb-6"
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(2.5rem, 10vw, 7rem)',
            }}
          >
            {t('posts')}
          </h1>

          {posts.totalDocs > 0 && (
            <div className="flex items-center gap-3">
              <span className="inline-block w-8 h-[2px] bg-primary shrink-0" aria-hidden />
              <p className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold font-sans m-0 text-foreground/60">
                {indexStart}
                {indexEnd > indexStart ? ` – ${indexEnd}` : ''} / {posts.totalDocs}{' '}
                {t('posts')}
              </p>
            </div>
          )}
        </div>
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container mt-8">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Hüttenbau Oberi Posts`,
  }
}
