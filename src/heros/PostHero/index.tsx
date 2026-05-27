import React from 'react'
import Link from 'next/link'

import type { Category, Post } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { useTranslations } from 'next-intl'
import { PostHeroClient } from './PostHeroClient'

function hasRichTextContent(content: Post['content']): boolean {
  if (!content || typeof content === 'string') return false
  const children = content?.root?.children
  if (!children || children.length === 0) return false
  return children.some((child) => {
    const nodeChildren = child.children as { text?: string }[] | undefined
    if (Array.isArray(nodeChildren)) {
      return nodeChildren.some((c) => typeof c.text === 'string' && c.text.trim() !== '')
    }
    return false
  })
}

function formatPostDate(timestamp: string): string {
  const date = new Date(timestamp)
  const DD = String(date.getDate()).padStart(2, '0')
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const YYYY = date.getFullYear()
  return `${DD}.${MM}.${YYYY}`
}

export const PostHero: React.FC<{ post: Post }> = ({ post }) => {
  const t = useTranslations()
  const { categories, content, heroImage, populatedAuthors, publishedAt, title, showAuthor } = post

  const dashIdx = title?.indexOf(' - ') ?? -1
  const titleMain = dashIdx !== -1 ? title!.slice(0, dashIdx) : title
  const titleSub = dashIdx !== -1 ? title!.slice(dashIdx + 3) : null

  const breadcrumbSource = categories?.find(
    (c): c is Category => typeof c === 'object' && c !== null && (c.breadcrumbs?.length ?? 0) > 0,
  )
  const breadcrumbs = breadcrumbSource?.breadcrumbs ?? null

  const hasCaption = heroImage && typeof heroImage === 'object' ? !!heroImage.caption : false

  const hasAuthor = !!showAuthor && (populatedAuthors?.length ?? 0) > 0
  const firstAuthor = populatedAuthors?.[0]

  return (
    <div className="w-full">
      {/* ── Title section ──────────────────────────────────────────── */}
      <div className="bg-background">
        <div className="container pt-8 pb-8 md:pt-10 md:pb-10">
          {/* Breadcrumbs — category hierarchy + current post title */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="relative z-10 flex items-center gap-2 mb-3">
              {[...breadcrumbs, { label: titleMain }].map((crumb, i, arr) => {
                const isLast = i === arr.length - 1
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span className="text-foreground/30 text-xs" aria-hidden>
                        /
                      </span>
                    )}
                    {!isLast && crumb.url ? (
                      <Link
                        href={crumb.url}
                        className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold font-sans text-foreground/60 hover:text-foreground/90 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={`text-[0.65rem] tracking-[0.2em] uppercase font-semibold font-sans ${isLast ? 'text-primary' : 'text-foreground/60'}`}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )}

          {/* Primary title — fluid size so the text fills ~70% of the viewport
              regardless of how many characters the title contains.             */}
          <h1
            className="mb-0 leading-none"
            style={{
              fontSize: `clamp(1.75rem, ${(70 / ((titleMain?.length ?? 10) * 0.58)).toFixed(2)}vw, 9rem)`,
            }}
          >
            {titleMain}
          </h1>

          {/* Subtitle */}
          {titleSub && (
            <p
              className="mt-1 mb-0 text-primary italic leading-[110%]"
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 5vw, 4.5rem)',
              }}
            >
              {titleSub}
            </p>
          )}

          {/* Em-dash + date */}
          {publishedAt && (
            <div className="flex items-center gap-3 mt-6">
              <span className="inline-block w-8 h-px bg-primary shrink-0" aria-hidden />
              <p className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold font-sans m-0">
                <span className="text-foreground/40 mr-2">{t('date')}</span>
                <time dateTime={publishedAt}>{formatPostDate(publishedAt)}</time>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Hero image ─────────────────────────────────────────────── */}
      {/* Mobile: edge-to-edge. lg+: horizontal padding so image floats
          centered. xl+: max-width caps it so it doesn't span the full
          monitor on very wide screens.                                  */}
      {heroImage && typeof heroImage !== 'string' && (
        <div className={`lg:px-6 xl:px-12 ${hasCaption ? 'xl:mb-6' : 'xl:mb-2'}`}>
          <div className="mx-auto xl:max-w-5xl">
            <Media resource={heroImage} priority imgClassName="w-full h-auto block" showCaption enableZoom />
          </div>
        </div>
      )}

      {/* ── Info bar ───────────────────────────────────────────────── */}
      {/* Mobile: edge-to-edge. lg+: small horizontal margin so it sits
          just inside the screen edges without going full-bleed.
          Margins are kept small so the bar still feels wide.            */}
      <div className="lg:mx-6 xl:container xl:mx-auto">
        <div className="bg-foreground text-background">
          <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:py-5">
            {/* Author */}
            {hasAuthor && firstAuthor?.name && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/15">
                  <span className="select-none text-sm font-bold leading-none text-background">
                    {firstAuthor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="m-0 mb-0.5 font-sans text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-background/50">
                    {t('author')}
                  </p>
                  <p className="m-0 font-sans text-sm font-semibold text-background">
                    {firstAuthor.name}
                  </p>
                  {firstAuthor.role && (
                    <p className="m-0 mt-0.5 font-sans text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-background/40">
                      {firstAuthor.role}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Share buttons */}
            <PostHeroClient />
          </div>
        </div>
      </div>

      {/* ── Intro / Vorwort ────────────────────────────────────────── */}
      {content && hasRichTextContent(content) && (
        <div className="container py-10 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
            {/* Label — dash on top, text below, whole column top-aligned */}
            <div className="flex shrink-0 flex-col items-start gap-2">
              <span className="inline-block h-px w-8 bg-primary shrink-0" aria-hidden />
              <p className="m-0 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                {t('foreword')}
              </p>
            </div>
            {/* Content — bold text rendered in primary red */}
            <div className="flex-1 [&_strong]:text-primary [&_b]:text-primary">
              <RichText data={content} enableGutter={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
