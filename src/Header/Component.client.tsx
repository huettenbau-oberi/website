'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'

import type { Banner, Header } from '@/payload-types'
import { BannerClient } from '@/Banner/Component.client'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  banner: Banner | null
  isPreview: boolean
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, banner, isPreview }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const { headerTheme, setHeaderTheme, forceSolid, setForceSolid } = useHeaderTheme()
  const pathname = usePathname()
  const t = useTranslations()

  useEffect(() => {
    setHeaderTheme(null)
    setForceSolid(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      ref={headerRef}
      className={[
        'sticky top-0 z-20 transition-colors duration-300',
        // Transparent over hero pages — those use `-mt-[10.4rem]` to extend their
        // background up under the header. On non-hero pages this falls through to
        // the page body bg, which is intentional. The scrolled state adds a
        // distinct tinted bg + shadow once the user has scrolled past the hero.
        scrolled || forceSolid ? 'bg-secondary shadow-sm' : 'bg-transparent',
      ].join(' ')}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t('skip-to-content')}
      </a>
      {banner && <BannerClient data={banner} />}
      <div
        className={`container flex items-center justify-between transition-[padding] duration-300 ${scrolled ? 'py-2 md:py-4' : 'py-4 md:py-8'}`}
      >
        {/* `shrink-0` keeps the logo at its natural max-width when the right-hand
            nav grows on mobile — without it the link flex-shrinks below the logo's
            intended size as soon as the nav side gets wider. */}
        <Link className="shrink-0" href="/">
          <Logo loading="eager" priority="high" />
        </Link>
        <HeaderNav data={data} isPreview={isPreview} />
      </div>
    </header>
  )
}
