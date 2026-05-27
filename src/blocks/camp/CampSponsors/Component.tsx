'use client'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type {
  CampSponsorsBlock as CampSponsorsBlockProps,
  Media as MediaType,
} from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

const vp = { once: true, margin: '-60px' as const }

type Sponsor = {
  id?: string | null
  image?: string | number | MediaType | null
  name: string
  url?: string | null
}

// Fixed card dimensions — never change so logos always render at the same pixel size.
const TIER = {
  lg: { card: 'w-40 h-24 sm:w-56 sm:h-36', pxMobile: 160, pxDesktop: 224 },
  md: { card: 'w-36 h-24 sm:w-52 sm:h-32', pxMobile: 144, pxDesktop: 208 },
  sm: { card: 'w-32 h-20 sm:w-48 sm:h-28', pxMobile: 128, pxDesktop: 192 },
} as const

const GAP = 16 // matches gap-4 (1rem = 16px at default font-size)

function SponsorCard({
  sponsor,
  index,
  cardClass,
}: {
  sponsor: Sponsor
  index: number
  cardClass: string
}) {
  const hasImage = sponsor.image && typeof sponsor.image === 'object'

  const card = (
    <motion.div
      className={`flex items-center justify-center bg-[#f5f0e8] dark:bg-white p-4 ${cardClass}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={vp}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
    >
      {hasImage ? (
        <Media
          resource={sponsor.image}
          htmlElement={null}
          pictureClassName="h-full w-full"
          imgClassName="h-full w-full object-contain"
          alt={sponsor.name}
        />
      ) : (
        <span
          className="text-center text-[1.375rem] uppercase tracking-wide text-foreground dark:text-background"
          style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 700 }}
        >
          {sponsor.name}
        </span>
      )}
    </motion.div>
  )

  if (sponsor.url) {
    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
        aria-label={sponsor.name}
      >
        {card}
      </a>
    )
  }

  return card
}

function SponsorSection({
  titleKey,
  sponsors,
  size,
}: {
  titleKey: string
  sponsors: Sponsor[]
  size: keyof typeof TIER
}) {
  const t = useTranslations()
  const { card: cardClass, pxMobile, pxDesktop } = TIER[size]

  const outerRef = useRef<HTMLDivElement>(null)
  const [innerMaxW, setInnerMaxW] = useState<number | undefined>(undefined)
  const [cols, setCols] = useState<number>(2)

  useLayoutEffect(() => {
    const el = outerRef.current
    if (!el) return

    const recalc = () => {
      const available = el.clientWidth
      // Match the sm: Tailwind breakpoint (640px viewport) so cardPx stays in sync with the CSS card size.
      const cardPx = window.innerWidth >= 640 ? pxDesktop : pxMobile
      const c = Math.min(
        sponsors.length,
        Math.max(1, Math.floor((available + GAP) / (cardPx + GAP))),
      )
      setCols(c)
      setInnerMaxW(c * cardPx + (c - 1) * GAP)
    }

    const obs = new ResizeObserver(recalc)
    obs.observe(el)
    recalc()
    return () => obs.disconnect()
  }, [sponsors.length, pxMobile, pxDesktop])

  if (!sponsors.length) return null

  return (
    <motion.div
      className="mb-14"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* outerRef measures available width; inner div is sized to the exact card-row width */}
      <div ref={outerRef} className="w-full">
        {/* When only one column fits, let the divider row span the full container width */}
        {cols === 1 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-foreground/30" />
            <h3 className="text-xl font-bold whitespace-nowrap shrink-0">{t(titleKey)}</h3>
            <div className="flex-1 h-px bg-foreground/30" />
          </div>
        )}
        <div className="mx-auto" style={{ maxWidth: innerMaxW }}>
          {cols > 1 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-foreground/30" />
              <h3 className="text-xl font-bold whitespace-nowrap shrink-0">{t(titleKey)}</h3>
              <div className="flex-1 h-px bg-foreground/30" />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {sponsors.map((sponsor, i) => (
              <SponsorCard
                key={sponsor.id ?? i}
                sponsor={sponsor}
                index={i}
                cardClass={cardClass}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const CampSponsorsBlock: React.FC<CampSponsorsBlockProps> = ({
  title,
  introText,
  mainSponsors,
  sponsors,
  goenner,
  outroText,
  links,
}) => {
  return (
    <section className="w-full bg-background py-16 md:py-24" data-nosnippet="">
      <div className="container max-w-5xl">
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

        {introText && (
          <motion.div
            className="text-center text-muted-foreground [&_p]:mx-auto [&_p]:max-w-xl mb-12 md:mb-24"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <RichText data={introText} enableGutter={false} />
          </motion.div>
        )}

        <SponsorSection
          titleKey="main-sponsors"
          sponsors={(mainSponsors ?? []) as Sponsor[]}
          size="lg"
        />
        <SponsorSection titleKey="sponsors" sponsors={(sponsors ?? []) as Sponsor[]} size="md" />
        <SponsorSection titleKey="goenner" sponsors={(goenner ?? []) as Sponsor[]} size="sm" />

        {outroText && (
          <motion.div
            className="mt-12 md:mt-24 text-center text-muted-foreground [&_p]:mx-auto [&_p]:max-w-xl"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            <RichText data={outroText} enableGutter={false} />
          </motion.div>
        )}

        {Array.isArray(links) && links.length > 0 && (
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          >
            {links.map(({ link }, i) => (
              <CMSLink key={i} {...link} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
