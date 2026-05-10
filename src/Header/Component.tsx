import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { draftMode } from 'next/headers'
import React from 'react'

import type { Header } from '@/payload-types'
import { getLocale } from 'next-intl/server'
import type { TypedLocale } from 'payload'

export async function Header() {
  const locale = (await getLocale()) as TypedLocale
  const headerData = (await getCachedGlobal('header', 1, locale)()) as Header
  const { isEnabled: isPreview } = await draftMode()

  return <HeaderClient data={headerData} isPreview={isPreview} />
}
