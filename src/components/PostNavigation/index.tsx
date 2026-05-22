import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export type AdjacentPost = Pick<Post, 'id' | 'slug' | 'title' | 'meta'>

type Props = {
  previous?: AdjacentPost | null
  next?: AdjacentPost | null
}

export const PostNavigation: React.FC<Props> = ({ previous, next }) => {
  const t = useTranslations()

  if (!previous && !next) return null

  const both = !!previous && !!next

  return (
    <section className="container mt-12 border-t border-border pt-12 pb-4 md:mt-16 md:pt-16">
      <div className="mb-8 flex items-center gap-3 md:mb-10">
        <span className="inline-block h-px w-8 shrink-0 bg-primary" aria-hidden />
        <p className="m-0 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          {t('read-next')}
        </p>
      </div>

      <div
        className={cn(
          'grid gap-4 md:gap-6',
          both ? 'md:grid-cols-2' : 'mx-auto max-w-2xl md:grid-cols-1',
        )}
      >
        {previous && (
          <NavCard post={previous} direction="previous" label={t('previous-post')} />
        )}
        {next && <NavCard post={next} direction="next" label={t('next-post')} />}
      </div>
    </section>
  )
}

const NavCard: React.FC<{
  post: AdjacentPost
  direction: 'previous' | 'next'
  label: string
}> = ({ post, direction, label }) => {
  const isPrev = direction === 'previous'
  const image = post.meta?.image
  const hasImage = image && typeof image === 'object'

  return (
    <Link
      href={`/posts/${post.slug}`}
      aria-label={`${label}: ${post.title}`}
      className={cn(
        'group relative block overflow-hidden rounded-lg border border-border bg-card',
        'transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      <div
        className={cn(
          'flex w-full items-stretch gap-4 p-3 sm:gap-5 sm:p-4',
          isPrev ? 'flex-row' : 'flex-row-reverse',
        )}
      >
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:w-24 md:w-28">
          {hasImage ? (
            <Media
              resource={image}
              fill
              imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
              size="120px"
            />
          ) : null}
        </div>

        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col justify-center gap-1.5',
            isPrev ? 'items-start text-left' : 'items-end text-right',
          )}
        >
          <div className="flex items-center gap-1.5 text-primary">
            {isPrev && (
              <ArrowLeft
                className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1"
                aria-hidden
              />
            )}
            <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em]">
              {label}
            </span>
            {!isPrev && (
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            )}
          </div>
          <h3
            className="m-0 line-clamp-2 font-serif text-base font-black leading-tight text-foreground transition-colors group-hover:text-primary md:text-lg"
          >
            {post.title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
