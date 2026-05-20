'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import { Link } from '@/i18n/routing'
import type { Variants } from 'framer-motion'
import type { Media as MediaType } from '@/payload-types'

export type TimelinePost = {
  id: string | number
  title?: string | null
  slug?: string | null
  publishedAt?: string | null
  heroImage?: MediaType | number | null
  meta?: { description?: string | null } | null
}

type Props = {
  posts: TimelinePost[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
}

export const TimelineClient: React.FC<Props> = ({ posts }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstCircleRef = useRef<HTMLDivElement>(null)
  const lastCircleRef = useRef<HTMLDivElement>(null)

  // Measure rail position and the container + viewport dimensions needed to
  // convert circle layout offsets into scroll-progress fractions.
  const [dims, setDims] = useState({
    railTop: 0,
    railHeight: 0,
    containerH: 0,
    viewportH: 0,
  })

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const first = firstCircleRef.current
      const last = lastCircleRef.current
      if (!container || !first || !last) return

      // offsetTop traversal: layout-space, unaffected by scroll / CSS transforms
      const offsetFromContainer = (el: HTMLElement): number => {
        let top = 0
        let cur: HTMLElement | null = el
        while (cur && cur !== container) {
          top += cur.offsetTop
          cur = cur.offsetParent as HTMLElement | null
        }
        return top
      }

      const firstTop = offsetFromContainer(first) + first.offsetHeight / 2
      const lastTop = offsetFromContainer(last) + last.offsetHeight / 2

      setDims({
        railTop: firstTop,
        railHeight: Math.max(0, lastTop - firstTop),
        containerH: container.offsetHeight,
        viewportH: window.innerHeight,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [posts.length])

  // Map scroll progress to circle positions.
  // useScroll ['start end','end start'] gives 0 when container top hits viewport
  // bottom and 1 when container bottom hits viewport top.
  // containerTop (viewport-relative) = viewportH − p × (containerH + viewportH)
  //
  // Fill = 0 % when first circle centre is at viewport bottom:
  //   pStart = railTop / (containerH + viewportH)
  //
  // Fill = 100 % when last circle centre is at viewport bottom:
  //   pEnd = (railTop + railHeight) / (containerH + viewportH)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const total = dims.containerH + dims.viewportH
  const pStart = total > 0 ? (dims.railTop + dims.viewportH / 2) / total : 0
  const pEnd   = total > 0 ? (dims.railTop + dims.railHeight + dims.viewportH / 2) / total : 1

  const fillHeight = useTransform(scrollYProgress, [pStart, pEnd], ['0%', '100%'], {
    clamp: true,
  })

  return (
    <div ref={containerRef} className="relative py-6 md:py-12">
      {/* ── Rail: spans first → last circle centre ───────────────── */}
      {dims.railHeight > 0 && (
        <div
          className="pointer-events-none absolute left-7 w-0 md:left-1/2"
          style={{ top: dims.railTop, height: dims.railHeight }}
        >
          {/* Thin track (behind) */}
          <div className="absolute left-0 top-0 h-full w-px -translate-x-1/2 bg-border" />
          {/* Thick fill (on top, scroll-driven) */}
          <motion.div
            className="absolute left-0 top-0 w-[3px] -translate-x-1/2 bg-primary"
            style={{ height: fillHeight }}
          />
        </div>
      )}

      {/* ── Post items ───────────────────────────────────────────── */}
      <div className="space-y-12 md:space-y-20">
        {posts.map((post, i) => {
          const isFirst = i === 0
          const isLast = i === posts.length - 1
          const isRight = i % 2 === 0
          const year = post.publishedAt ? new Date(post.publishedAt).getFullYear() : null
          const date = post.publishedAt ? formatDate(post.publishedAt) : null
          const image =
            post.heroImage && typeof post.heroImage === 'object'
              ? (post.heroImage as MediaType)
              : null
          const description = post.meta?.description ?? null
          const href = post.slug ? (`/posts/${post.slug}` as const) : null

          return (
            <div key={String(post.id)} className="relative pt-7">
              {/* Year badge */}
              {year && (
                <div className="absolute left-7 top-0 z-10 -translate-x-1/2 bg-primary px-2 py-0.5 text-[0.58rem] font-bold tracking-[0.14em] text-primary-foreground md:left-1/2">
                  {year}
                </div>
              )}

              {/* Circle node */}
              <div
                ref={isFirst ? firstCircleRef : isLast ? lastCircleRef : null}
                className="absolute left-7 top-6 z-10 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-primary bg-background md:left-1/2"
              />

              {/* Card */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className={cn(
                  'ml-14 mr-2',
                  isRight
                    ? 'md:ml-[calc(50%+2.5rem)] md:mr-4'
                    : 'md:mr-[calc(50%+2.5rem)] md:ml-4',
                )}
              >
                {href ? (
                  <Link
                    href={href}
                    className="group block overflow-hidden rounded-sm bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
                  >
                    <CardInner image={image} title={post.title} date={date} description={description} />
                  </Link>
                ) : (
                  <div className="overflow-hidden rounded-sm bg-card shadow-sm">
                    <CardInner image={image} title={post.title} date={date} description={description} />
                  </div>
                )}
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type CardInnerProps = {
  image: MediaType | null
  title?: string | null
  date: string | null
  description: string | null
}

function CardInner({ image, title, date, description }: CardInnerProps) {
  return (
    <>
      {image ? (
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-video">
          <Media resource={image} fill imgClassName="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <h2
            className="absolute bottom-4 left-4 right-4 text-xl text-white leading-snug sm:text-2xl md:text-3xl"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 900 }}
          >
            {title}
          </h2>
        </div>
      ) : (
        <div className="px-5 pt-5">
          <h2
            className="text-2xl leading-snug md:text-3xl"
            style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 900 }}
          >
            {title}
          </h2>
        </div>
      )}

      <div className="px-5 py-4">
        {date && (
          <p className="mb-2 text-[0.7rem] font-medium tracking-wide text-muted-foreground">
            {date}
          </p>
        )}
        {description && (
          <p className="text-sm leading-relaxed text-foreground/70 line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </>
  )
}
