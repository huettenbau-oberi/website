import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import localization from './localization'
import { Locale as PayloadLocale } from 'payload'

const locales = localization.locales.map((locale: PayloadLocale | string) =>
  typeof locale == 'object' ? locale.code : locale,
)
const defaultLocale = localization.defaultLocale

// Full routing config — used by the middleware (proxy.ts) for localized URL matching.
// Pathnames here tell next-intl which public URL each locale uses for a given internal path.
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
  pathnames: {
    '/suche': {
      de: '/suche',
      en: '/search',
    },
  },
})

// Navigation config without pathnames — keeps Link/redirect/useRouter accepting arbitrary
// hrefs so CMS-driven links and dynamic routes continue to type-check.
const navConfig = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(navConfig)

export type Locale = (typeof routing.locales)[number]
