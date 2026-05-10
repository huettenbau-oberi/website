'use client'
import React from 'react'
import { motion } from 'framer-motion'
import type { CampSponsorsBlock as CampSponsorsBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

// Deterministic rotation + vertical nudge per slot so the layout looks organic
// without Math.random() (which would cause hydration mismatches).
const ROTATIONS = [1.5, -2, 2.5, -1.5, 1, -2.5, 2, -1, 1.5, -2, 1, -1.5]
const Y_NUDGES  = [0, 16, -12, 20, -8, 12, -16, 8, 0, -12, 16, -8]

const vp = { once: true, margin: '-60px' as const }

export const CampSponsorsBlock: React.FC<CampSponsorsBlockProps> = ({
  title,
  introText,
  sponsors,
  outroText,
}) => {
  const count = sponsors?.length ?? 0

  // Pick grid columns based on count so small sets don't look sparse
  const gridCols =
    count <= 2 ? 'grid-cols-2'
    : count === 4 ? 'grid-cols-2 md:grid-cols-4'
    : 'grid-cols-2 md:grid-cols-3'

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container max-w-4xl">

        {/* Title */}
        {title && (
          <motion.h2
            className="mb-6 text-center text-3xl font-black md:text-4xl"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {title}
          </motion.h2>
        )}

        {/* Intro text */}
        {introText && (
          <motion.div
            className="mb-12 text-center text-muted-foreground [&_p]:mx-auto [&_p]:max-w-xl"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <RichText data={introText} enableGutter={false} />
          </motion.div>
        )}

        {/* Sponsor logos */}
        {count > 0 && (
          <div className={`grid ${gridCols} gap-6 md:gap-10 mb-12 place-items-center`}>
            {sponsors!.map((sponsor, i) => {
              const rotation = ROTATIONS[i % ROTATIONS.length]
              const nudge    = Y_NUDGES[i % Y_NUDGES.length]
              const hasImage = sponsor.image && typeof sponsor.image === 'object'

              return (
                <motion.div
                  key={sponsor.id ?? i}
                  className="w-full max-w-[260px]"
                  style={{ translateY: nudge, rotate: rotation }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={vp}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                  whileHover={{ scale: 1.04, rotate: 0, transition: { duration: 0.25 } }}
                >
                  {hasImage && (
                    <Media
                      resource={sponsor.image}
                      imgClassName="w-full h-auto object-contain"
                      alt={sponsor.name ?? undefined}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Outro text */}
        {outroText && (
          <motion.div
            className="text-center text-muted-foreground [&_p]:mx-auto [&_p]:max-w-xl"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            <RichText data={outroText} enableGutter={false} />
          </motion.div>
        )}

      </div>
    </section>
  )
}
