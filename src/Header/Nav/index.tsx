'use client'

import React from 'react'
import { useLocale } from 'next-intl'

import type { Header as HeaderType } from '@/payload-types'

import { UserDropdown } from '@/components/UserDropdown'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'

export const HeaderNav: React.FC<{ data: HeaderType; isPreview: boolean }> = ({ data, isPreview }) => {
  const navItems = data?.navItems || []
  const locale = useLocale()
  const menuLabel = locale === 'de' ? 'MENÜ' : 'MENU'

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link
        href="/search"
        className="text-md font-bold tracking-widest text-foreground hover:text-primary transition-colors"
      >
        {menuLabel}
      </Link>
      <UserDropdown isPreview={isPreview} />
    </nav>
  )
}
