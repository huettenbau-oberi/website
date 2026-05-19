'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import './styles.scss'

import type { Page } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { Media } from '@/components/Media'

type HomeHeroProps = Page['hero'] & {
  tagline?: string | null
  backgroundMedia?: Page['hero']['media']
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
        {tagline ? (
          // The tagline is the visible page headline on the home hero. Promoting it to
          // <h1> gives the page a single, meaningful top-level heading instead of
          // starting the hierarchy at h3.
          <h1 className="font-medium text-white drop-shadow md:text-base tagline">{tagline}</h1>
        ) : (
          // Fallback when no tagline is configured: the brand mark is conveyed visually
          // via the Logo but carries no heading semantics — provide one for screen readers.
          <h1 className="sr-only">Hüttenbau Oberi</h1>
        )}
        <div className="logo-container">
          <Logo loading="eager" priority="high" />
        </div>
      </motion.div>
    </section>
  )
}
