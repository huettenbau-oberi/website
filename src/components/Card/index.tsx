'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { getPostUrl } from '@/utilities/getPostUrl'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = relationTo === 'posts' ? getPostUrl({ slug, categories }) : `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'overflow-hidden bg-card hover:cursor-pointer flex flex-col',
        className,
      )}
      ref={card.ref}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            resource={metaImage}
            fill
            imgClassName="object-cover"
            size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {showCategories && hasCategories && (
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-4 h-px bg-primary shrink-0" aria-hidden />
            <div className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold font-sans text-primary leading-none">
              {categories?.map((category, index) => {
                if (typeof category === 'object') {
                  const { title: titleFromCategory } = category
                  const categoryTitle = titleFromCategory || 'Untitled category'
                  const isLast = index === categories.length - 1
                  return (
                    <Fragment key={index}>
                      {categoryTitle}
                      {!isLast && <Fragment>, &nbsp;</Fragment>}
                    </Fragment>
                  )
                }
                return null
              })}
            </div>
          </div>
        )}

        {titleToUse && (
          <h3
            className="font-black leading-tight mb-0 mt-0 text-lg"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            <Link
              className="text-foreground hover:text-primary transition-colors duration-200 no-underline"
              href={href}
              ref={link.ref}
            >
              {titleToUse}
            </Link>
          </h3>
        )}

        {description && (
          <p className="text-sm text-foreground/55 font-sans line-clamp-2 m-0 mt-3 leading-relaxed">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </article>
  )
}
