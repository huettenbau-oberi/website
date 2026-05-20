'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import './styles.scss'

import type { Page } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { Media } from '@/components/Media'

type HomeHeroProps = {
  tagline?: string | null
  backgroundMedia?: Page['hero']['backgroundMedia']
}

export const HomeHero: React.FC<HomeHeroProps> = ({ tagline, backgroundMedia }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <section
      className="relative -mt-[10.4rem] h-[60vh] overflow-hidden md:h-[75vh]"
      data-theme="dark"
    >
      {backgroundMedia && typeof backgroundMedia === 'object' && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: 'easeOut' }}
        >
          <Media
            fill
            className="absolute inset-0"
            imgClassName="object-cover object-center"
            priority
            resource={backgroundMedia}
          />
        </motion.div>
      )}

      <motion.div
        className="absolute bottom-0 right-0 z-10 flex flex-col items-end gap-1 p-4 md:p-8 hero-intro"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
      >
        {tagline && (
          // The tagline is decorative subtitle copy — not the page heading. The page's
          // content blocks (rendered after the hero) supply the <h1>, same as for the
          // other hero variants. Earlier work treated this as the page heading and
          // promoted it to <h1>, which risked emitting two <h1>s when the content
          // already contained one.
          <p className="font-medium text-white drop-shadow md:text-base tagline">{tagline}</p>
        )}
        <div className="logo-container">
          <Logo loading="eager" priority="high" />
        </div>
      </motion.div>
    </section>
  )
}
