import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { SendIcon } from 'lucide-react'
import { getLocale } from 'next-intl/server'
import type { TypedLocale } from 'payload'

export async function Footer() {
  const locale = (await getLocale()) as TypedLocale
  const footerData = (await getCachedGlobal('footer', 1, locale)()) as Footer

  const navItems = footerData?.navItems || []
  const legalItems = footerData?.legalItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <div>
          <Link
            className="flex items-center"
            href="/"
            data-theme="dark"
            aria-label="Hüttenbau Oberi – Startseite"
          >
            <Logo />
          </Link>
          {legalItems.length > 0 && (
            <nav aria-label="Rechtliches" className="mt-3">
              <ul className="flex items-center flex-wrap gap-x-2 text-sm">
                {legalItems.map(({ link }, i) => (
                  <li key={i} className="flex items-center gap-x-2">
                    {i > 0 && (
                      <span aria-hidden="true" className="text-white/60">
                        |
                      </span>
                    )}
                    <CMSLink
                      className="text-white/70 hover:text-white transition-colors"
                      {...link}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <button className="primary flex items-center mt-6">
            Kontakt <SendIcon aria-hidden="true" className="size-4 ml-1 stroke-2" />
          </button>
        </div>

        <div className="flex flex-col items-start md:flex-row gap-8">
          {navItems.map(({ title, links }, i) => {
            const headingId = `footer-nav-${i}`
            return (
              <div key={i} className="flex flex-col gap-3">
                <span
                  id={headingId}
                  className="font-semibold text-white text-sm uppercase tracking-wide"
                >
                  {title}
                </span>
                <nav aria-labelledby={headingId}>
                  <ul className="flex flex-col gap-1.5">
                    {(links || []).map(({ link }, j) => (
                      <li key={j}>
                        <CMSLink
                          className="text-white/70 hover:text-white transition-colors text-sm"
                          {...link}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-center py-4 text-sm text-white/60">
        &copy; {new Date().getFullYear()} Hüttenbau Oberi. Alle Rechte vorbehalten.
        {process.env.NEXT_PUBLIC_BUILD_VERSION && (
          <span aria-hidden="true" className="ml-4 text-white/60">
            {process.env.NEXT_PUBLIC_BUILD_VERSION}
          </span>
        )}
      </div>
    </footer>
  )
}
