import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              { title: { like: query } },
              { 'meta.description': { like: query } },
              { 'meta.title': { like: query } },
              { slug: { like: query } },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />

      {/* Header */}
      <div className="bg-background border-b border-border mb-16">
        <div className="container py-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-8 h-[2px] bg-primary shrink-0" aria-hidden />
            <p className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold font-sans m-0 text-foreground/60">
              Suche
            </p>
          </div>

          <h1
            className="leading-none font-black mb-8"
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(2.5rem, 10vw, 7rem)',
            }}
          >
            Suche
          </h1>

          <div className="max-w-2xl">
            <Search />
          </div>
        </div>
      </div>

      {/* Results */}
      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container">
          <div className="flex items-center gap-3">
            <span className="inline-block w-8 h-[2px] bg-border shrink-0" aria-hidden />
            <p className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold font-sans text-foreground/40 m-0">
              {query ? `Keine Ergebnisse gefunden — "${query}"` : 'Keine Ergebnisse gefunden'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Hüttenbau Oberi Search`,
  }
}
