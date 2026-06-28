import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { draftMode } from 'next/headers'
import React from 'react'

import type { Banner, Header } from '@/payload-types'

export async function Header() {
  const [headerData, bannerData] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<Header>,
    getCachedGlobal('banner', 2)() as Promise<Banner | null>,
  ])
  const { isEnabled: isPreview } = await draftMode()

  const now = new Date()
  const banner =
    bannerData?.text &&
    (!bannerData.showFrom || new Date(bannerData.showFrom) <= now) &&
    (!bannerData.showUntil || new Date(bannerData.showUntil) >= now)
      ? bannerData
      : null

  return <HeaderClient data={headerData} banner={banner} isPreview={isPreview} />
}
