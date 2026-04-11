'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { Media } from '@/components/Media'

type HomeHeroProps = Page['hero'] & {
  tagline?: string | null
  backgroundMedia?: Page['hero']['media']
  logoMedia?: Page['hero']['media']
}

export const HomeHero: React.FC<HomeHeroProps> = ({ tagline, backgroundMedia, logoMedia }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <section
      className="relative -mt-[10.4rem] h-[60vh] overflow-hidden md:h-[75vh]"
      data-theme="dark"
    >
      {/* Full-bleed background: Media wrapper becomes the positioned fill container */}
      {backgroundMedia && typeof backgroundMedia === 'object' && (
        <Media
          fill
          className="absolute inset-0"
          imgClassName="object-cover object-center"
          priority
          resource={backgroundMedia}
        />
      )}

      {/* Bottom-right content, above the image */}
      <div className="absolute bottom-0 right-0 z-10 flex flex-col items-end gap-1 p-4 md:p-8">
        {tagline && (
          <p className="text-sm font-medium text-white drop-shadow md:text-base">{tagline}</p>
        )}
        {logoMedia && typeof logoMedia === 'object' && (
          <div className="w-40 md:w-56">
            <Media
              imgClassName="w-full h-auto object-contain drop-shadow-lg"
              resource={logoMedia}
            />
          </div>
        )}
      </div>
    </section>
  )
}
