'use client'
import React from 'react'
import { motion } from 'framer-motion'
import type { GalleryGridBlock as GalleryGridBlockProps, Media as MediaType } from '@/payload-types'
import { ZoomableMedia } from '@/components/Media/ZoomableMedia'

type LayoutType = GalleryGridBlockProps['layout']

// Align the two columns relative to each other (applied to the parent flex row)
const ALIGN: Record<LayoutType, string> = {
  beginning: 'items-start',
  middle: 'items-center',
  end: 'items-end',
}

const vp = { once: true, margin: '-30px' as const }

type ColumnImages = NonNullable<GalleryGridBlockProps['leftImages']>

function Column({ images }: { images: ColumnImages | null | undefined }) {
  if (!images?.length) return <div className="flex-1" />

  return (
    <div className="flex flex-col flex-1 min-w-0 gap-1">
      {images.map((entry, i) => {
        const resource = typeof entry.image === 'object' ? (entry.image as MediaType) : null

        return (
          <motion.div
            key={entry?.id ?? i}
            className="w-full overflow-hidden"
            style={{ maxHeight: 480 }}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
          >
            {resource && (
              <ZoomableMedia
                resource={resource}
                imgClassName="w-full h-auto block"
                size="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export const GalleryGridBlock: React.FC<GalleryGridBlockProps> = ({
  layout = 'middle',
  leftImages,
  rightImages,
}) => {
  if (!leftImages?.length && !rightImages?.length) return null

  const align = ALIGN[layout ?? 'middle'] ?? ALIGN.middle

  return (
    <section className="w-full">
      <div className={`flex ${align} gap-1`}>
        <Column images={leftImages} />
        <Column images={rightImages} />
      </div>
    </section>
  )
}
