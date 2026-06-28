'use client'
import React from 'react'
import { motion } from 'framer-motion'
import type { GalleryGridBlock as GalleryGridBlockProps, Media as MediaType } from '@/payload-types'
import { ZoomableMedia } from '@/components/Media/ZoomableMedia'
import { RichText as ConvertRichText } from '@payloadcms/richtext-lexical/react'

type LayoutType = GalleryGridBlockProps['layout']

// Align the two columns relative to each other (applied to the desktop flex row)
const ALIGN: Record<LayoutType, string> = {
  beginning: 'items-start',
  middle: 'items-center',
  end: 'items-end',
}

const vp = { once: true, margin: '-30px' as const }

type ColumnImages = NonNullable<GalleryGridBlockProps['leftImages']>
type ImageEntry = ColumnImages[number]

// Zip the two columns into the intended reading order (L0, R0, L1, R1, …) for
// the single-column mobile layout. Tolerates unequal lengths — leftover images
// are appended at the end.
function interleave(left: ColumnImages = [], right: ColumnImages = []): ImageEntry[] {
  const out: ImageEntry[] = []
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const l = left[i]
    const r = right[i]
    if (l) out.push(l)
    if (r) out.push(r)
  }
  return out
}

function GalleryImage({ entry, index, size }: { entry: ImageEntry; index: number; size: string }) {
  const resource = typeof entry.image === 'object' ? (entry.image as MediaType) : null
  if (!resource) return null

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={vp}
      transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
    >
      <div className="w-full overflow-hidden">
        <ZoomableMedia resource={resource} imgClassName="w-full h-auto block" size={size} />
      </div>
      {resource.caption && (
        <div className="mt-1 px-1 text-[0.65rem] tracking-wide text-muted-foreground text-center">
          <ConvertRichText data={resource.caption} />
        </div>
      )}
    </motion.div>
  )
}

function Column({ images }: { images: ColumnImages | null | undefined }) {
  if (!images?.length) return <div className="flex-1" />

  return (
    <div className="flex flex-col flex-1 min-w-0 gap-1">
      {images.map((entry, i) => (
        <GalleryImage key={entry?.id ?? i} entry={entry} index={i} size="50vw" />
      ))}
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
    <section className="w-full max-w-3xl mx-auto">
      {/* Mobile: single centered column in interleaved reading order (one left, one right, …) */}
      <div className="flex flex-col items-center gap-1 sm:hidden">
        {interleave(leftImages ?? [], rightImages ?? []).map((entry, i) => (
          <GalleryImage key={entry?.id ?? i} entry={entry} index={i} size="100vw" />
        ))}
      </div>

      {/* Desktop: two independent staggered columns */}
      <div className={`hidden sm:flex sm:flex-row ${align} gap-1`}>
        <Column images={leftImages} />
        <Column images={rightImages} />
      </div>
    </section>
  )
}
