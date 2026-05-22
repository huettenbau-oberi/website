'use client'
import React from 'react'
import { motion } from 'framer-motion'
import type { GalleryGridBlock as GalleryGridBlockProps, Media as MediaType } from '@/payload-types'
import { ZoomableMedia } from '@/components/Media/ZoomableMedia'

type LayoutType = GalleryGridBlockProps['layout']

type ImageItem = { kind: 'image'; flex: number; idx: number }
type SpacerItem = { kind: 'spacer'; flex: number }
type ColumnItem = ImageItem | SpacerItem

type LayoutConfig = {
  left: ColumnItem[]
  right: ColumnItem[]
}

// Shorthand builders
const img = (flex: number, idx: number): ImageItem => ({ kind: 'image', flex, idx })
const spc = (flex: number): SpacerItem => ({ kind: 'spacer', flex })

/**
 * Both columns in every layout must sum to the same flex total (12) so that
 * they fill identical heights. Spacers are transparent flex children that
 * push real images down (beginning) or stop them short (end).
 *
 * flex unit visual guide at a 1:1 square container:
 *   Left col ½-width image  @ flex 6  ≈  square  (6/12 × 100%)
 *   Right col ⅓-width image @ flex 4  ≈  landscape (4/12 × 100%)
 *   Tall portrait image     @ flex 8  ≈  3:4 portrait (8/12 × 100%)
 */
const LAYOUTS: Record<LayoutType, LayoutConfig> = {
  // Both columns flush top → bottom
  middle: {
    left:  [img(6, 0), img(6, 1)],
    right: [img(4, 2), img(4, 3), img(4, 4)],
  },
  // Portrait anchor on left, three equal on right
  middleTall: {
    left:  [img(8, 0), img(4, 1)],
    right: [img(4, 2), img(4, 3), img(4, 4)],
  },
  // Right col starts 2/12 down — top-right gap creates the "intro" stagger
  beginning: {
    left:  [img(5, 0), img(7, 1)],
    right: [spc(2), img(4, 2), img(3, 3), img(3, 4)],
  },
  // Three equal on left, tall portrait on right — both with same stagger
  beginningTall: {
    left:  [img(4, 0), img(4, 1), img(4, 2)],
    right: [spc(2), img(7, 3), img(3, 4)],
  },
  // Left col stops 2/12 early — bottom-left gap creates the "outro" stagger
  end: {
    left:  [img(5, 0), img(5, 1), spc(2)],
    right: [img(4, 2), img(4, 3), img(4, 4)],
  },
  // Portrait anchor on right, left fades out early
  endTall: {
    left:  [img(4, 0), img(6, 1), spc(2)],
    right: [img(8, 2), img(4, 3)],
  },
}

const vp = { once: true, margin: '-30px' as const }

type ColumnProps = {
  items: ColumnItem[]
  images: GalleryGridBlockProps['images']
}

function Column({ items, images }: ColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ gap: '3px' }}>
      {items.map((item, i) => {
        if (item.kind === 'spacer') {
          return <div key={`spacer-${i}`} aria-hidden="true" style={{ flex: item.flex }} />
        }

        const entry = images?.[item.idx]
        const resource =
          entry && typeof entry.image === 'object' ? (entry.image as MediaType) : null

        return (
          <motion.div
            key={entry?.id ?? item.idx}
            className="relative overflow-hidden min-h-0"
            style={{ flex: item.flex }}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: item.idx * 0.07, ease: 'easeOut' }}
          >
            {/* relative w-full h-full: h-full resolves against the flex item's
                used height (definite after layout) — this is the containing block
                that next/image fill and ZoomableMedia's absolute wrapper need.
                Mirrors the pattern used in CampGallery. */}
            <div className="relative w-full h-full">
              {resource && (
                <ZoomableMedia resource={resource} fill imgClassName="object-cover" />
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export const GalleryGridBlock: React.FC<GalleryGridBlockProps> = ({
  layout = 'middle',
  flip = false,
  images,
}) => {
  if (!images?.length) return null

  const config = LAYOUTS[layout ?? 'middle'] ?? LAYOUTS.middle
  const leftItems  = (flip ?? false) ? config.right : config.left
  const rightItems = (flip ?? false) ? config.left  : config.right

  return (
    <section className="w-full">
      <div className="flex" style={{ aspectRatio: '1 / 1', gap: '3px' }}>
        <Column items={leftItems}  images={images} />
        <Column items={rightItems} images={images} />
      </div>
    </section>
  )
}
