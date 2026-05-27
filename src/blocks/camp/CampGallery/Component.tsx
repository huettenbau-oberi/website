'use client'
import React from 'react'
import { motion } from 'framer-motion'

import type { CampGalleryBlock as CampGalleryBlockProps } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

// Images arranged around a clear central gap (title zone: left 34–67%, top 38–67%).
// Every image pair has an explicit gap; icons are kept clear of all image bounds.
// All values: [left%, top%, width%, height%] of the container.
const IMAGE_SLOTS: [number, number, number, number][] = [
  [35.5,  13, 14, 24], // portrait,       centre-left
  [51.5,   2, 13, 35], // tall portrait,  centre
  [66.5,  20, 24, 21], // landscape,      right-top
  [ 8.5,  27, 25, 19], // wide landscape, left-middle
  [66.5,  45, 21, 35], // portrait,       right-bottom
  [19.5,  50, 14, 32], // portrait,       left-bottom
  [35.5,  69, 29, 27], // landscape,      bottom-centre
]

// Icons kept >= 3% clear of every image boundary.
// [left%, top%, size%]
const ICON_SLOTS: [number, number, number][] = [
  [11,  12, 7], // sleeping bag      — above slot 3 (top 27%)
  [26,  10, 5], // walking person    — left of slot 0 (left 36%)
  [44,   2, 5], // key / zipper      — between slots 0 & 1, top 2%; clears slot 0 top (13%)
  [75,   6, 5], // arrow             — right of slot 1 (right 65%), above slot 2 (top 20%)
  [87,  10, 6], // backpack          — above slot 2 (top 20%), clears slot 1 right (65%)
  [ 4,  43, 6], // tree with person  — left of slot 3 (left 9%)
  [90,  48, 5], // hammer            — right of slots 2 & 4 (right edge 88%)
  [ 6,  70, 7], // tree              — left of slot 5 (left 20%)
  [90,  72, 4], // nail              — right of slot 4 (right edge 88%)
  [70,  83, 6], // plank / ruler     — right of slot 6 (right 65%), below slot 4 (bottom 80%)
  [33,  84, 5], // gnome / mushroom  — left of slot 6 (left 36%)
  [20,  87, 6], // hat / beanie      — below slot 5 (bottom 82%)
]

const vp = { once: true, margin: '-60px' as const }

export const CampGalleryBlock: React.FC<CampGalleryBlockProps> = ({ title, link, images, icons }) => {
  return (
    <section className="w-full bg-background">
      {/* ── Desktop mosaic ─────────────────────────────────────── */}
      {/* aspect-ratio gives a real computed height so that absolute children's
          top/height percentages resolve correctly (padding-bottom: % does not). */}
      <div
        className="relative hidden mx-auto md:block"
        style={{ aspectRatio: '1276 / 910', maxWidth: '1400px', width: '100%' }}
      >
        {/* Images */}
        {IMAGE_SLOTS.map(([l, t, w, h], i) => {
          const item = images?.[i]
          return (
            <motion.div
              key={i}
              className="absolute overflow-hidden bg-muted rounded-lg"
              style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={vp}
              transition={{ duration: 0.55, delay: i * 0.07, ease: 'easeOut' }}
            >
              {item?.image && typeof item.image === 'object' && (
                <div className="relative w-full h-full">
                  <Media resource={item.image} fill imgClassName="object-cover" />
                </div>
              )}
            </motion.div>
          )
        })}

        {/* Centre text + CTA */}
        <div
          className="absolute z-10 flex flex-col items-center justify-center text-center"
          style={{ left: '50%', top: '53%', width: '31%', transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          >
            <h2
              className="m-0 font-black text-foreground leading-tight"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(1rem, 3.5vw, 2.5rem)',
              }}
            >
              {title}
            </h2>
            {link && (
              <div className="mt-3">
                <CMSLink {...link} appearance="outline" />
              </div>
            )}
          </motion.div>
        </div>

        {/* Icons — overflow: visible so edge icons aren't clipped by the container */}
        {ICON_SLOTS.map(([l, t, s], i) => {
          const item = icons?.[i]
          if (!item?.icon || typeof item.icon !== 'object') return null
          return (
            <motion.div
              key={i}
              aria-hidden="true"
              className="absolute pointer-events-none select-none"
              style={{ left: `${l}%`, top: `${t}%`, width: `${s}%` }}
              initial={{ opacity: 0, scale: 0.75 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.05, ease: 'easeOut' }}
            >
              <Media resource={item.icon} imgClassName="w-full h-auto object-contain dark:invert" />
            </motion.div>
          )
        })}
      </div>

      {/* ── Mobile ─────────────────────────────────────────────── */}
      <div className="md:hidden bg-background overflow-hidden">
        {/* Title card — icons scatter at the four corners like a pinboard */}
        <motion.div
          className="relative px-10 pt-14 pb-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {icons?.[0]?.icon && typeof icons[0].icon === 'object' && (
            <div
              aria-hidden="true"
              className="absolute top-8 left-2 w-14 -rotate-12 pointer-events-none select-none"
            >
              <Media resource={icons[0].icon} imgClassName="w-full h-auto object-contain dark:invert" />
            </div>
          )}
          {icons?.[4]?.icon && typeof icons[4].icon === 'object' && (
            <div
              aria-hidden="true"
              className="absolute top-6 right-2 w-12 rotate-6 pointer-events-none select-none"
            >
              <Media resource={icons[4].icon} imgClassName="w-full h-auto object-contain dark:invert" />
            </div>
          )}
          {icons?.[6]?.icon && typeof icons[6].icon === 'object' && (
            <div
              aria-hidden="true"
              className="absolute bottom-4 left-5 w-11 rotate-6 pointer-events-none select-none"
            >
              <Media resource={icons[6].icon} imgClassName="w-full h-auto object-contain dark:invert" />
            </div>
          )}
          {icons?.[9]?.icon && typeof icons[9].icon === 'object' && (
            <div
              aria-hidden="true"
              className="absolute bottom-2 right-5 w-10 -rotate-6 pointer-events-none select-none"
            >
              <Media resource={icons[9].icon} imgClassName="w-full h-auto object-contain dark:invert" />
            </div>
          )}
          <h2
            className="m-0 font-black text-foreground leading-tight"
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(1.75rem, 8vw, 2.5rem)',
            }}
          >
            {title}
          </h2>
          {link && (
            <div className="mt-4">
              <CMSLink {...link} appearance="outline" />
            </div>
          )}
        </motion.div>

        {/* Infinite auto-scroll: duplicate the image list so the loop is seamless.
            CSS translates the track by -50% (one full copy), then resets to 0. */}
        <style>{`
          @keyframes camp-gallery-scroll {
            to { transform: translateX(-50%); }
          }
        `}</style>
        <div className="overflow-hidden pb-10">
          <div
            className="flex items-start gap-4 w-max"
            style={{
              animation: `camp-gallery-scroll ${(images?.length ?? 6) * 5}s linear infinite`,
            }}
          >
            {[...(images ?? []), ...(images ?? [])].map((item, i) => {
              const isTall = i % 2 === 0
              return (
                <div
                  key={i}
                  className={`relative flex-none overflow-hidden bg-muted rounded-lg${!isTall ? ' mt-10' : ''}`}
                  // `min(280px, 80vw)` keeps the original look on standard phones (375px+)
                  // while shrinking on foldables / very small viewports so the next card
                  // still peeks in. Aspect ratio preserves the original 280×260 / 280×200
                  // proportions regardless of the resolved width.
                  style={{
                    width: 'min(280px, 80vw)',
                    aspectRatio: isTall ? '14 / 13' : '7 / 5',
                  }}
                >
                  {item?.image && typeof item.image === 'object' && (
                    <Media resource={item.image} fill imgClassName="object-cover" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
