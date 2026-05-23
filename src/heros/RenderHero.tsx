import React from 'react'

import type { Page } from '@/payload-types'

import { GalleryHero } from '@/heros/GalleryHero'
import { HomeHero } from '@/heros/HomeHero'
import { LowImpactHero } from '@/heros/LowImpact'

const heroes = {
  galleryHero: GalleryHero,
  homeHero: HomeHero,
  lowImpact: LowImpactHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
