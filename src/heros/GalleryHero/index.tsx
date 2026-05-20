import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Category, Page } from '@/payload-types'

type GalleryHeroProps = Page['hero']

async function fetchYearRange(
  categoryId: number | null,
): Promise<{ min: number; max: number } | null> {
  const payload = await getPayload({ config: configPromise })

  const categoryClause = categoryId ? [{ categories: { in: [categoryId] } }] : []

  const where = {
    and: [...categoryClause, { publishedAt: { exists: true } }],
  }

  const [oldest, newest] = await Promise.all([
    payload.find({
      collection: 'posts',
      where,
      sort: 'publishedAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'posts',
      where,
      sort: '-publishedAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const oldestDate = oldest.docs[0]?.publishedAt
  const newestDate = newest.docs[0]?.publishedAt

  if (!oldestDate || !newestDate) return null

  return {
    min: new Date(oldestDate).getFullYear(),
    max: new Date(newestDate).getFullYear(),
  }
}

export const GalleryHero: React.FC<GalleryHeroProps> = async ({ subtitle, category }) => {
  const categoryId = category
    ? typeof category === 'object'
      ? (category as Category).id
      : (category as number)
    : null

  const yearRange = await fetchYearRange(categoryId)

  const yearDisplay = yearRange
    ? yearRange.min === yearRange.max
      ? String(yearRange.min)
      : `${yearRange.min}—${yearRange.max}`
    : null

  return (
    <section className="container pt-10 pb-12 md:pt-14 md:pb-16">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-8 h-px bg-primary shrink-0" aria-hidden />
        <p className="text-[0.65rem] tracking-[0.2em] uppercase font-sans font-semibold text-foreground/70 flex items-center gap-1.5">
          <span>Archiv</span>
          {yearDisplay && (
            <>
              <span aria-hidden className="text-foreground/40">
                ·
              </span>
              <span>{yearDisplay}</span>
            </>
          )}
        </p>
      </div>

      <h1 className="mt-0 mb-5">Galerie</h1>

      {subtitle && (
        <p
          className="max-w-[38rem] text-foreground/70 leading-relaxed"
          style={{
            fontWeight: 400,
            fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
          }}
        >
          {subtitle}
        </p>
      )}
    </section>
  )
}
