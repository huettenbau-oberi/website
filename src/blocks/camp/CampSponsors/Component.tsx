'use client'
import React from 'react'
import { motion } from 'framer-motion'
import type { CampSponsorsBlock as CampSponsorsBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

const vp = { once: true, margin: '-60px' as const }

export const CampSponsorsBlock: React.FC<CampSponsorsBlockProps> = ({
  title,
  introText,
  sponsors,
  outroText,
}) => {
  const count = sponsors?.length ?? 0

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container max-w-6xl">
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
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-12">
            {sponsors!.map((sponsor, i) => {
              const hasImage = sponsor.image && typeof sponsor.image === 'object'

              return (
                <motion.div
                  key={sponsor.id ?? i}
                  className="flex items-center justify-center bg-background dark:bg-white p-4 h-24 md:h-32 w-44 md:w-56"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={vp}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                >
                  {hasImage && (
                    <Media
                      resource={sponsor.image}
                      htmlElement={null}
                      pictureClassName="h-full w-full"
                      imgClassName="h-full w-full object-contain"
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
